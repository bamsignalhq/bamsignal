# Startup Performance Report

**Date:** 2026-06-26  
**Issue:** Authenticated startup could exceed one minute before Home rendered.  
**Goal:** First paint from valid session + cached identity in under 500ms (warm) / 800ms (returning) / 2s (cold).

---

## Root cause

Session restoration blocked first paint on work that should run in the background:

1. **`scheduleMemberBundleHydration` cleared `memberSessionReady`** and set `memberHydrating=true` until `bootstrapMemberSession` finished — including a full member `pull` (matches, chats, signals, premium, profile) plus a **duplicate** `onboarding-status` call after `goToApp` had already fetched route.
2. **`bootstrapMemberSession` ran serially** — `registerMember` → `hydrateMemberData` → retry → `fetchOnboardingStatus`, with no API timeouts.
3. **`memberApiHeaders` called `getSession()` + `refreshSession()` on every member API request** with no cache or timeout — a slow/hung refresh blocked all downstream calls.
4. **`restoreFromSession` awaited** validate → goToApp → bundle hydration before the member shell could render, even when cached profile existed locally.
5. **Token refresh path** cleared session-ready and re-blocked the UI on every `TOKEN_REFRESHED` event.

---

## Startup waterfall (after fix)

| Phase | Blocks first paint? | Typical target |
|-------|---------------------|----------------|
| App boot | No | 0–50ms |
| Supabase `getSession` | Only if no cache | 80–180ms |
| Supabase `getUser` (timeout) | Background on warm cache | 0–2000ms |
| Basic member identity (localStorage) | Yes (instant from cache) | 0–20ms |
| `goToApp` / onboarding-status | Background on warm restore | 200–400ms |
| `member/register` + `member/pull` | **No** — background | 300–1200ms |
| Chats / signals / matches in pull | **No** | Background |
| Notifications / analytics | **No** | Background |
| **First paint (Home shell)** | **Yes — session + identity only** | **<500ms warm** |

Example warm returning user:

```
app_boot              12ms
supabase_get_session  95ms
first_paint          180ms   ← member shell visible
go_to_app            220ms   (background)
member_pull          480ms   (background)
onboarding_status    skipped (deduped)
```

---

## Blocking operations removed from first paint

- Full member bundle `pull`
- Duplicate onboarding-status after `goToApp`
- Premium refresh before Home
- Token refresh re-blocking UI

---

## Optimizations applied

| Change | File(s) |
|--------|---------|
| First paint from cached identity; background validate + route | `src/App.tsx`, `sessionRestoreBootstrap.ts` |
| Bundle hydration never clears `memberSessionReady` | `src/App.tsx` |
| Skip duplicate onboarding fetch (`skipOnboardingStatus`) | `memberData.ts`, `goToApp.ts`, `App.tsx` |
| Parallel `registerMember` + `hydrateMemberData` | `memberData.ts` |
| Member API timeout (8s) | `memberData.ts` |
| Header token cache + refresh timeout (4s) | `memberApiAuth.ts` |
| Bootstrap in-flight dedupe | `memberData.ts` |
| Startup instrumentation + first-paint mark | `startupInstrumentation.ts` |
| Token refresh no longer blocks UI | `App.tsx` |

---

## Before / after (expected)

| Scenario | Before | After (target) |
|----------|--------|----------------|
| Warm launch (cached session) | 5–60s+ blocked on bundle | **<500ms** first paint |
| Returning user refresh | Full-screen restore until pull | **<800ms** to Home shell |
| Cold launch | Serial auth + pull + onboarding ×2 | **<2s** to interactive shell; data fills in background |
| Loading screen >1s | Common | Only if auth validation slow; not waiting on chats/signals |

---

## Validation

```bash
npm run build
npm test
npm run test:server-import
node scripts/test-startup-performance.mjs
```

In dev, inspect `[bamsignal][startup]` console logs and `getStartupSummary()` from `src/utils/startupInstrumentation.ts`.

---

## Remaining background work (by design)

- Member bundle pull (matches, chats, signals, saved profiles)
- Premium status refresh after first paint
- Compliance sync retry
- Discover cache warm from matches

These must not gate `memberAccessReady` or first paint.
