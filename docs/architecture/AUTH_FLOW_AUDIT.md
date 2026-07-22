# Authentication Flow Audit — Sprint 2

Audit date: Sprint 2 implementation. Scope: `/api/auth/*` and related services.

## Endpoints Reviewed

### Signup — `POST /api/auth/email-code`

- **Actions:** `send`, `verify`, `check`, `math-challenge`
- **Service:** `signupOtp.js`, `signupProvisioning.js`
- **Status:** Active, production consumer (member signup)
- **Sprint 2 change:** Audit events on successful provisioning

### Login — `POST /api/auth/pin-login`

- **Service:** `pinLogin.js`, `pinAuthThrottle.js`
- **Status:** Active — canonical member login
- **Sprint 2 change:** Session/device registration, failed login audit

### PIN Reset — `POST /api/auth/pin-reset`

- **Actions:** `send`, `complete` (query or body)
- **Service:** `pinReset.js`
- **Status:** Active
- **Sprint 2 change:** Recovery token audit trail

### Forgot Username — `POST /api/auth/forgot-username`

- **Status:** Active
- **Note:** No removal; recovery audit via security events (future hook)

### Login Security — `POST /api/auth/login-security`

- **Service:** `accountSecurity.js` (2FA codes, trusted devices JSONB)
- **Status:** Active — complements new device registry (both coexist)

### Identity — `POST /api/auth/identity`

- **Status:** Active — admin-only
- **Note:** Not modified

### Play Reviewer — `POST /api/auth/play-reviewer-finish`

- **Status:** Active — store review flow
- **Note:** Not modified

### Sessions — `POST /api/auth/sessions` (NEW)

- **Actions:** `list`, `revoke`, `revoke-all`, `logout`, `revoke-device`, `trust-device`
- **Status:** New backend-only member API

### Account — `POST /api/auth/account` (NEW)

- **Actions:** `lifecycle`, `security-events`
- **Status:** New backend-only member API

## Not Present (Confirmed Absent)

- Email/password login endpoint (by design — PIN login only)
- OAuth / social login routes
- Duplicate signup auth systems
- Legacy `/api/login` or parallel refresh endpoints (Supabase client handles refresh)

## Legacy / Deprecated (Retained — Has Consumers)

| Item | Location | Action |
|------|----------|--------|
| `trusted_devices` JSONB | `accountSecurity.js` | **Kept** — existing 2FA/trust flow |
| `createConfirmedSupabaseUser` | `signupOtp.js` | **Kept** — deprecated export, no removal |
| CRON secret diagnostics fallback | `diagnosticsAccess.js` | **Kept** — deprecated path from Sprint 1.1 |

## Dead Code Removed

**None in this sprint.** All reviewed routes have production consumers. Removal deferred to architectural review if any legacy path is confirmed unused in production logs.

## Duplicate Logic Notes

- **Trusted devices:** JSONB in `accountSecurity.js` + new `member_auth_devices` table — intentional overlap during transition; new registry used for session observability, JSONB retained for 2FA.
- **Audit:** Existing `audit_logs` / `platform_audit_log` retained; auth-specific events go to `member_auth_security_events`.

## Recommendations (Post-Review)

1. Run migration `0058_member_auth_lifecycle.sql` before enabling schema gate.
2. Monitor `member_auth_security_events` volume after launch.
3. Consider consolidating trusted device reads to registry in a future sprint (not Sprint 2 scope).
