# Signup Failure Investigation Report

**Date:** June 15, 2026  
**Severity:** P0 launch blocker  
**Status:** Root cause identified — fixes deployed (`de965da`). **Coolify env action still required for OTP verify.**

---

## Update (June 15, 2026 — deploy `de965da`)

Production verification after deploy:

| Check | Result |
|-------|--------|
| JS bundle | `index-D7MIUZ1t.js` (new; old “could not reach the server” removed) |
| CORS preflight | `204` with `Access-Control-Allow-Origin: https://localhost` |
| `POST /api/auth/email-code` | **200** |
| `/health` signupEmail | **false** — `SUPABASE_SERVICE_ROLE_KEY` still missing in Coolify |

**Additional root cause:** `www.bamsignal.com` returns **503** (no server). API calls now always target `https://bamsignal.com` in production.

---

## Symptom

On signup (Create account → Continue), users saw:

> BamSignal could not reach the server. Check your internet connection.

This blocked new registrations.

---

## Step 1–2 — Reproduction & failing request

### Production checks (curl)

| Check | Result |
|-------|--------|
| `GET https://bamsignal.com/health` | **200** — `database: connected`, `paystack: true`, `resend: true`, **`signupEmail: false`** |
| `POST /api/auth/email-code` (send) | **200** `{"ok":true,"email":"..."}` |
| `POST /api/auth/email-code` (verify, bad code) | **400** `That code doesn't match...` |
| `OPTIONS /api/auth/email-code` (Origin: `https://localhost`) | **200** — **no `Access-Control-Allow-Origin`** (before fix) |
| Direct `supabase.auth.signUp` (anon) | **500** `Error sending confirmation email` |

### Browser / native behaviour

| Client | Request | Failure mode |
|--------|---------|--------------|
| **Web** (`bamsignal.com`) | `POST /api/auth/email-code` | Same-origin — API works |
| **Android/iOS (Capacitor)** | `POST https://bamsignal.com/api/auth/email-code` | Cross-origin from `https://localhost` — **CORS blocked** → `Failed to fetch` |
| **Fallback path (old code)** | `supabase.auth.signUp()` | Supabase SMTP not configured → **500 email error** (masked as “network” when both failed) |

---

## Root cause

**Primary:** Missing **CORS** on the Express API. The native app calls `https://bamsignal.com/api/...` from a Capacitor WebView origin (`https://localhost`). Preflight/POST was blocked → `Failed to fetch` → generic “could not reach the server” message.

**Secondary:** Signup flow **fell back to `supabase.auth.signUp()`** when the BamSignal OTP API failed. Supabase project email is **not configured** (`Error sending confirmation email`), so fallback also failed.

**Tertiary (verify step):** Production health shows **`signupEmail: false`** because **`SUPABASE_SERVICE_ROLE_KEY` is not set in Coolify**. OTP *send* works (Resend + DB), but OTP *verify* cannot create confirmed users without the service role key.

---

## Failing endpoint

| Phase | Endpoint | Typical status (before fix) |
|-------|----------|----------------------------|
| Signup Continue (native) | `POST https://bamsignal.com/api/auth/email-code` | Browser blocked (CORS) — no response body |
| Signup fallback (old) | `POST {supabase}/auth/v1/signup` | **500** — confirmation email failure |
| Verify OTP (production today) | `POST /api/auth/email-code` action `verify` | **503** when `SUPABASE_SERVICE_ROLE_KEY` missing |

---

## Fixes applied (code)

1. **`server/cors.js`** — CORS middleware for Capacitor, localhost dev, and `bamsignal.com` origins.
2. **`server/production.js`** — Mount CORS globally; health `signupEmail` also requires Supabase URL.
3. **`src/services/authEmail.ts`** — Proper JSON/HTML error parsing; `AuthEmailError` with specific messages (no generic `"network"` throw).
4. **`src/services/supabase.ts`** — `friendlyAuthError()` maps network, exists, OTP, and server errors per product spec.
5. **`src/pages/AuthPage.tsx`** — **Removed** broken Supabase `signUp` / `resend` / `verifyOtp` fallbacks; signup uses BamSignal OTP API only.
6. **`server/services/signupOtp.js`** — Server reads `SUPABASE_URL` or `VITE_SUPABASE_URL` for admin user creation.
7. **`.env.example`** — Document `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.

---

## Required Coolify action (not in repo)

Add runtime secret:

```env
SUPABASE_SERVICE_ROLE_KEY=<service_role key from Supabase Dashboard → Settings → API>
SUPABASE_URL=https://nswiwxmavuqpuzlsascs.supabase.co
```

After redeploy, `/health` should show:

```json
"signupEmail": true
```

---

## Env verification

| Variable | Local `.env` | Production build | Production runtime |
|----------|--------------|------------------|-------------------|
| `VITE_SUPABASE_URL` | Set | In JS bundle (`nswiwxmavuqpuzlsascs.supabase.co`) | N/A (build-time) |
| `VITE_SUPABASE_ANON_KEY` | Set | In JS bundle | N/A |
| `RESEND_API_KEY` | Set | N/A | **true** on health |
| `SUPABASE_SERVICE_ROLE_KEY` | **Missing** | N/A | **Missing** → `signupEmail: false` |
| `DATABASE_URL` | — | N/A | **connected** |

---

## Improved error messages (after fix)

| Cause | User sees |
|-------|-----------|
| Network / CORS / offline | Unable to connect. Check your internet connection and try again. |
| Email already exists | An account already exists for this email. Try logging in instead. |
| OTP / Resend misconfigured | Email verification is temporarily unavailable. Please try again shortly. |
| Server 5xx / HTML error page | We're having trouble creating your account right now. Please try again shortly. |
| Wrong OTP | That code doesn't match. Check your email and try again. |

---

## Success criteria checklist

After **deploy + Coolify `SUPABASE_SERVICE_ROLE_KEY`**:

- [ ] New user: signup form → Continue → verify screen (no network error)
- [ ] Email OTP received via Resend
- [ ] Enter OTP → account created → signed in → onboarding
- [ ] Native app signup works (CORS headers present on API)
- [ ] `/health` → `signupEmail: true`

---

## Production test (post-deploy)

1. `curl -I -X OPTIONS https://bamsignal.com/api/auth/email-code -H "Origin: https://localhost"` → expect `Access-Control-Allow-Origin: https://localhost`
2. `curl https://bamsignal.com/health` → `signupEmail: true`
3. Manual signup on web + Android with new email

---

## Build

`npm run build` — **passed** after fixes.
