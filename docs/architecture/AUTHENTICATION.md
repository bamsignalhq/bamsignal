# Authentication Architecture — Sprint 2

BamSignal authentication extends **Supabase Auth** and the existing **username + PIN** login model. This sprint adds an operational layer for lifecycle, sessions, devices, recovery, and audit — without replacing Supabase, Passport, or Trust contracts.

## Principles

- Login UI remains **username + PIN** only (Supabase password grant under the hood).
- Member identity is resolved **server-side** from bearer tokens (`requireMemberAuth`).
- Auth audit writes are **append-only** and **never block** primary auth flows.
- No parallel auth system; no OAuth additions in this sprint.

## Active Auth Endpoints

| Route | Purpose |
|-------|---------|
| `POST /api/auth/email-code` | Signup OTP send / verify / check |
| `POST /api/auth/pin-login` | Username + PIN login |
| `POST /api/auth/pin-reset` | PIN reset (send / complete) |
| `POST /api/auth/forgot-username` | Username recovery via email |
| `POST /api/auth/login-security` | Login 2FA verification |
| `POST /api/auth/sessions` | Session & device management (member) |
| `POST /api/auth/account` | Lifecycle & security event read (member) |
| `POST /api/auth/identity` | Admin identity operations |
| `POST /api/auth/play-reviewer-finish` | Play Store reviewer flow |

## Service Layer

```
server/services/auth/
├── securityEvents.js   # Append-only audit
├── lifecycle.js        # Account lifecycle transitions
├── sessions.js         # Session registry
├── devices.js          # Device registry
├── recovery.js         # Recovery tokens
├── observability.js    # Auth metrics + retention hooks
├── requestContext.js   # IP, UA, device id parsing
└── index.js            # Public exports + post-login hook
```

## Integration Points

- **Signup:** `signupProvisioning.js` → signup + email_verified events, lifecycle transition
- **Login:** `api/auth/pin-login.js` → session/device registration, failed login audit
- **PIN reset:** `pinReset.js` → recovery token audit
- **Deletion:** `memberTrust.js` → retention metadata + lifecycle transitions

## Database Tables (Migration 0058)

- `member_auth_security_events`
- `member_auth_sessions`
- `member_auth_devices`
- `member_account_lifecycle_log`
- `member_auth_recovery_tokens`
- `member_account_retention`

## TypeScript Contracts

Client/shared types live in `src/auth/` (`lifecycle.ts`, `securityEvents.ts`).

## Security Model

- Sessions: Supabase remains token authority; BamSignal stores **metadata only** (device, IP, UA, last activity).
- Devices: Client-supplied `x-device-id` / `x-bamsignal-device-id` — no aggressive fingerprinting.
- Recovery tokens: Hashed at rest; short TTL; append-only completion audit.
- RLS enabled on all new tables; server uses service role for writes.

## Observability

Auth counters exposed via `getAuthObservabilityMetrics()` and operator dashboard snapshot (`observability.auth`).

See also: [ACCOUNT_LIFECYCLE.md](./ACCOUNT_LIFECYCLE.md), [AUTH_FLOW_AUDIT.md](./AUTH_FLOW_AUDIT.md), [AUTH_RUNBOOK.md](../operations/AUTH_RUNBOOK.md).
