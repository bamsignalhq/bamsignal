# Session Persistence Report

**Date:** June 15, 2026  
**Sprint:** Session Persistence + Final Auth QA  
**Goal:** Authenticated users stay logged in across refresh, browser reopen, and app resume.

---

## Root cause

Session persistence was **configured correctly in Supabase** (`persistSession`, `autoRefreshToken`, `detectSessionInUrl`), but the **app rendered the public experience before auth finished loading**.

1. `isAuthed` defaulted to `false` while `getSession()` / `INITIAL_SESSION` was still in flight.
2. The splash preloader (`booting`) ended on a fixed timer (~1.5s) **independent** of auth bootstrap.
3. Users saw the **public landing page** (logged-out UI) even with a valid Supabase session in `localStorage`.
4. `onAuthStateChange` only handled `SIGNED_IN` on the auth route — not `INITIAL_SESSION`, `TOKEN_REFRESHED`, or `SIGNED_OUT`.
5. Logout did not consistently call `signOut()` or clear member caches from one place.
6. Onboarding **step** reset to 0 on every refresh.

---

## Fixes applied

### 1. Supabase client (`src/services/supabase.ts`)

Confirmed and explicit:

- `persistSession: true`
- `autoRefreshToken: true`
- `detectSessionInUrl: true`
- `flowType: "pkce"`
- `storage: window.localStorage` (browser)

### 2. Auth bootstrap (`src/App.tsx`)

- Added `authLoading` state (starts `true`).
- UI shows preloader while `booting || authLoading` — **no public home flash** during session restore.
- `onAuthStateChange` handles:
  - `INITIAL_SESSION` — restore user, hydrate member data, premium
  - `SIGNED_IN` — login flow or silent restore
  - `TOKEN_REFRESHED` / `USER_UPDATED` — refresh user + premium
  - `SIGNED_OUT` — clear member caches + reset state (only after real sign-out)
- 8s fallback timeout so auth loading cannot hang forever.

### 3. Session utilities (`src/utils/authSession.ts`)

- `clearMemberSessionCaches()` — intentional logout cleanup (profile, prefs, payment pending, onboarding step, premium snapshot).
- Used by `handleLogout` and `SIGNED_OUT` handler.

### 4. Logout (`src/App.tsx` → `ProfilePage`)

- `handleLogout` calls `supabase.auth.signOut()`, clears caches, resets state, navigates to `/`.
- Profile page delegates to `onLogout()` only (no duplicate sign-out).

### 5. Onboarding persistence (`src/pages/OnboardingPage.tsx`)

- `STORAGE_KEYS.onboardingStep` — resume step on refresh.
- Partial `datingProfile` saved during onboarding.
- Step cleared when onboarding completes.

### 6. Unintentional clearing audit

Searched codebase — **no** `localStorage.clear()` / `sessionStorage.clear()` on app boot.  
`removeItem` / cache clears only on payment success, logout, or dismiss — expected.

---

## Files changed

```
src/App.tsx
src/services/supabase.ts
src/utils/authSession.ts                    (new)
src/constants/limits.ts                     (onboardingStep key)
src/pages/OnboardingPage.tsx
src/pages/ProfilePage.tsx
SESSION_PERSISTENCE_REPORT.md
```

---

## Test matrix

### Code / build

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** |
| Auth config audit | **PASS** |
| No boot-time storage wipe | **PASS** |
| Route guard waits on `authLoading` | **PASS** |

### Refresh (expected after deploy)

| Scenario | Expected |
|----------|----------|
| Login → refresh home | Member home, no landing flash |
| Login → refresh discover tab | Still authed (tab resets to home — URL is `/`, session intact) |
| Login → refresh profile (`me` tab) | Still authed |
| Login → refresh during onboarding | Same onboarding step |
| Refresh while logged out | Public home |

*Requires manual/browser verification on https://bamsignal.com after deploy.*

### Browser reopen

| Scenario | Expected |
|----------|----------|
| Close tab → reopen site | Session from `localStorage` restored via `INITIAL_SESSION` |
| Close browser → reopen | Same (standard web persistence) |

### Mobile / PWA

| Scenario | Expected |
|----------|----------|
| Background app → return | `autoRefreshToken` refreshes JWT; user stays authed |
| Capacitor app reopen | Same `localStorage` + Supabase session storage |

*Native/PWA: verify on device after `npm run cap:sync` deploy.*

### Logout

| Step | Expected |
|------|----------|
| Settings → Logout | `signOut()`, caches cleared, public home |
| Refresh after logout | Stays logged out |

---

## Remaining auth risks

1. **Demo account (dev)** — Demo login bypasses Supabase; refresh will not restore demo session. Dev-only.
2. **Member tab URL** — Member tabs are in React state, not URLs; refresh returns to home tab but user stays logged in.
3. **Multi-tab `SIGNED_OUT`** — Signing out in one tab should propagate via `onAuthStateChange` in others (Supabase default).
4. **Missing `VITE_SUPABASE_*` at build** — Production build without keys yields `supabase: null`; no session persistence possible.
5. **Safari ITP / private mode** — `localStorage` may be ephemeral; expected browser limitation.

---

## Success criteria

| Criterion | Status |
|-----------|--------|
| Refresh does not log out authenticated users | **Fixed** (pending production QA) |
| No public home flash while session loads | **Fixed** |
| Onboarding does not restart from step 0 | **Fixed** |
| Intentional logout still works | **Fixed** |

**Deploy:** Push to `main` → Coolify rebuild → verify login + hard refresh on production.
