# Signup Email Env Trace Report

**Date:** June 15, 2026  
**Scope:** `signupEmail` health flag and `POST /api/auth/email-code`  
**Status:** Fixed — centralized env resolution, startup trace logging, `sb_secret_` key support

---

## 1. What makes `/health` → `signupEmail` false?

`signupEmail` is `true` only when **all three** are satisfied (see `server/supabaseEnv.js` → `isSignupEmailConfigured()`):

| Requirement | Env var(s) | Notes |
|-------------|------------|-------|
| Resend configured | `RESEND_API_KEY` | Non-empty after trim |
| Supabase admin key | `SUPABASE_SERVICE_ROLE_KEY` | Legacy JWT (`eyJ…`) **or** new secret (`sb_secret_…`) |
| Supabase project URL | `SUPABASE_URL` **or** `VITE_SUPABASE_URL` | Resolved URL must be non-empty |

Previous inline check in `server/production.js` only tested key presence (any string). It did **not** reject `sb_secret_` keys — failures were almost always **missing runtime env**, not key format.

### Common failure modes

1. **`SUPABASE_SERVICE_ROLE_KEY` not set in Coolify** (runtime) — most common.
2. **`SUPABASE_URL` unset at runtime** and `VITE_SUPABASE_URL` not available in the Docker **runner** image (build-time only before this fix).
3. **`RESEND_API_KEY` missing** — rare when contact form works (`resend: true`).

---

## 2. Startup trace logging (safe booleans only)

On server boot, `server/config.js` logs one JSON line — **no secrets**:

```json
{
  "hasSupabaseUrl": true,
  "hasViteSupabaseUrl": true,
  "hasServiceRoleKey": true,
  "serviceKeyPrefixIsSbSecret": true,
  "serviceKeyLength": 64,
  "resolvedUrl": true,
  "validServiceKeyFormat": true,
  "signupEmail": true
}
```

Check Coolify container logs for: `[bamsignal] signupEmail env trace:`

---

## 3. New Supabase key format (`sb_secret_…`)

The server passes the key verbatim to Supabase Auth Admin API:

```
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
apikey: <SUPABASE_SERVICE_ROLE_KEY>
```

No JWT parsing is performed. `isSupabaseServiceKeyFormat()` accepts:

- `eyJ…` — legacy service_role JWT
- `sb_secret_…` — new secret API key (2025+)

Store the secret key in Coolify as **`SUPABASE_SERVICE_ROLE_KEY`** (same var name as before; value is the `sb_secret_…` string from Supabase Dashboard → Settings → API).

---

## 4. Code changes

| File | Change |
|------|--------|
| `server/supabaseEnv.js` | **New** — URL/key resolution, format check, health helper, trace logging |
| `server/production.js` | Health uses `isSignupEmailConfigured()` |
| `server/config.js` | Calls `logSignupEmailEnvTrace()` at boot |
| `server/services/signupOtp.js` | Uses shared `supabaseServiceHeaders()` |
| `server/provisionPlayReviewer.js` | Uses shared `supabaseServiceHeaders()` |
| `Dockerfile` | Passes `VITE_SUPABASE_URL` build arg into **runner** stage so URL fallback works without duplicate Coolify var |

---

## 5. Coolify env checklist

```env
RESEND_API_KEY=re_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...   # or legacy eyJ... service_role JWT
SUPABASE_URL=https://<project-ref>.supabase.co   # recommended at runtime
# VITE_SUPABASE_URL is optional at runtime if SUPABASE_URL is set;
# runner image now also retains VITE_SUPABASE_URL from build when passed as Docker build arg.
```

---

## 6. Verification (production)

**Deploy:** `5f8ea17` pushed to `main` — June 15, 2026

### `/health`

```bash
curl -sS https://bamsignal.com/health | jq .
```

**Result (post-deploy):**

```json
{
  "ok": true,
  "service": "bamsignal",
  "database": "connected",
  "paystack": true,
  "resend": true,
  "signupEmail": true,
  "firebase": false,
  "telegram": false
}
```

### `POST /api/auth/email-code` (send)

```bash
curl -sS -X POST https://bamsignal.com/api/auth/email-code \
  -H "Content-Type: application/json" \
  -d '{"action":"send","email":"env-trace-verify@example.com","name":"Env Trace"}'
```

**Result:** `{"ok":true,"email":"env-trace-verify@example.com"}` — HTTP 200

### Email-code verify

Requires a real OTP from email. With `signupEmail: true`, verify + account creation should return 200 (or 409 if email already exists), not 503.

---

## 7. Troubleshooting

| Log field | `false` meaning | Action |
|-----------|-----------------|--------|
| `hasServiceRoleKey` | `SUPABASE_SERVICE_ROLE_KEY` empty in container | Set in Coolify, redeploy |
| `serviceKeyPrefixIsSbSecret` | Using legacy JWT (informational) | OK if `validServiceKeyFormat: true` |
| `validServiceKeyFormat` | Key too short or wrong prefix | Copy full key from Supabase dashboard |
| `resolvedUrl` | Neither URL env available at runtime | Set `SUPABASE_URL` in Coolify |
| `hasViteSupabaseUrl` | Build arg not passed / runner missing URL | Set `SUPABASE_URL` or ensure Docker build arg |

---

## 8. Summary

- **Root cause of `signupEmail: false`:** missing or unreachable Supabase runtime env (`SUPABASE_SERVICE_ROLE_KEY` and/or project URL), not rejection of `sb_secret_` keys.
- **Fix:** Centralized env module, safe boot trace, runner-stage `VITE_SUPABASE_URL` passthrough, explicit `sb_secret_` format acceptance.
- **No new product features** — health flag and OTP verify path only.
