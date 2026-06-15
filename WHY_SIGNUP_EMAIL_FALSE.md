# Why `signupEmail` Is False

**Date:** June 15, 2026  
**Symptom:** `GET /health` returns `"signupEmail": false` despite `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (`sb_secret_…`) being set in Coolify.

---

## Exact code path

| Step | File | Line | What happens |
|------|------|------|--------------|
| 1 | `server/production.js` | **89** | `signupEmail: isSignupEmailConfigured()` |
| 2 | `server/supabaseEnv.js` | **31–39** | `isSignupEmailConfigured()` evaluates **four AND conditions** |
| 3 | `server/production.js` | **90** | `signupEmailTrace` shows which condition is `false` (post-fix) |

### Failing condition (the gate)

`signupEmail` is `false` when **any** of these is falsy in `server/supabaseEnv.js` lines **34–38**:

```javascript
return Boolean(
  hasResend &&                        // (1) RESEND_API_KEY present at runtime
    serviceKey &&                     // (2) SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY present
    isSupabaseServiceKeyFormat(serviceKey) &&  // (3) key format accepted
    resolveSupabaseUrl()              // (4) SUPABASE_URL or VITE_SUPABASE_URL resolves
);
```

`signupEmail` is **`true` only when all four are truthy**.

---

## Does the code reject `sb_secret_` keys?

**No.** `isSupabaseServiceKeyFormat()` at `server/supabaseEnv.js` **lines 24–29** explicitly accepts:

- `eyJ…` — legacy JWT service_role key
- `sb_secret_…` — new Supabase secret API key
- any other string with length ≥ 20 (fallback)

The code does **not** require a JWT. It does **not** reject `sb_secret_` keys.

---

## Does the code read the wrong env variable?

**Primary:** `SUPABASE_SERVICE_ROLE_KEY` (`server/supabaseEnv.js` line **17–18**)

**URL:** `SUPABASE_URL`, then fallback `VITE_SUPABASE_URL` (`server/supabaseEnv.js` lines **11–12**)

### Common Coolify mistake

| You set in Coolify | Code reads | Result |
|--------------------|------------|--------|
| `SUPABASE_SECRET_KEY` only | `SUPABASE_SERVICE_ROLE_KEY` first | `hasServiceRoleKey: false` → **signupEmail false** |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | works |
| `SUPABASE_URL` (runtime) | ✓ | works |
| `VITE_SUPABASE_URL` only, build-time only | fallback at runtime | **false** if runner image has no URL |

**Fix applied:** `resolveSupabaseServiceKey()` now also reads `SUPABASE_SECRET_KEY` as an alias (line **18**).

---

## Build-time vs runtime

| Variable | When needed | In Dockerfile runner? |
|----------|-------------|------------------------|
| `VITE_SUPABASE_URL` | Build (frontend) + optional runtime fallback | `ARG`/`ENV` in runner stage (line 31–32) |
| `SUPABASE_URL` | **Runtime** (health + OTP verify) | **Not baked in** — must be injected by Coolify at container start |
| `SUPABASE_SERVICE_ROLE_KEY` | **Runtime** | **Not baked in** — must be injected by Coolify at container start |
| `RESEND_API_KEY` | **Runtime** | Not in Dockerfile |

**Root cause when vars “look configured” in Coolify UI but health is false:**

Coolify shows the variable in the dashboard, but the **running container** does not have it in `process.env` because:

1. Variable was added as **build-only** (not passed to the running container), or
2. Container was not **restarted/redeployed** after adding the var, or
3. Wrong variable name (`SUPABASE_SECRET_KEY` without `SUPABASE_SERVICE_ROLE_KEY` before alias fix).

`signupEmail` reads **`process.env` at request time** — not values from the Vite build bundle.

---

## How to see which gate fails

After deploy, `GET /health` includes safe diagnostics:

```json
{
  "signupEmail": false,
  "signupEmailTrace": {
    "hasResend": true,
    "hasServiceRoleKey": false,
    "validServiceKeyFormat": false,
    "resolvedUrl": true
  }
}
```

Interpretation:

| Field | `false` means |
|-------|----------------|
| `hasResend` | `RESEND_API_KEY` missing at runtime |
| `hasServiceRoleKey` | neither `SUPABASE_SERVICE_ROLE_KEY` nor `SUPABASE_SECRET_KEY` in container |
| `validServiceKeyFormat` | key present but too short / invalid (rare with real `sb_secret_` keys) |
| `resolvedUrl` | neither `SUPABASE_URL` nor `VITE_SUPABASE_URL` available at runtime |

Container boot logs also print: `[bamsignal] signupEmail env trace:` (no secret values).

---

## Fix applied

| Change | File | Purpose |
|--------|------|---------|
| Central `isSignupEmailConfigured()` | `server/supabaseEnv.js:31–39` | Single source of truth for health |
| `SUPABASE_SECRET_KEY` alias | `server/supabaseEnv.js:17–18` | Match Supabase dashboard “secret key” naming |
| Quote/BOM stripping | `server/supabaseEnv.js:6–8` | Coolify copy-paste with `"..."` wrappers |
| `signupEmailTrace` on `/health` | `server/production.js:90` | Pinpoint failing gate without log access |
| `VITE_SUPABASE_URL` in runner image | `Dockerfile:31–32` | URL fallback when `SUPABASE_URL` unset at runtime |

---

## Health result after fix

```bash
curl -sS https://bamsignal.com/health | jq '{signupEmail, signupEmailTrace, resend}'
```

**Expected (post-fix, env correctly injected):**

```json
{
  "signupEmail": true,
  "signupEmailTrace": {
    "hasResend": true,
    "hasServiceRoleKey": true,
    "validServiceKeyFormat": true,
    "resolvedUrl": true
  },
  "resend": true
}
```

---

## Coolify checklist (if still false)

1. Set **`SUPABASE_SERVICE_ROLE_KEY`** = full `sb_secret_…` value (or use `SUPABASE_SECRET_KEY` after alias fix).
2. Set **`SUPABASE_URL`** = `https://<ref>.supabase.co` as a **runtime** variable.
3. Confirm **`RESEND_API_KEY`** is set (if `resend: false`, signup cannot be true).
4. **Redeploy** the service so the container restarts with new env.
5. `curl /health` → check `signupEmailTrace` for the one `false` field.
