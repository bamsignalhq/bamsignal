# Security

BamSignal security spans transport headers, authentication hardening, payment integrity, secrets handling, and institutional audit dashboards.

**Security dashboard:** `/hard/security-dashboard`  
**Tests:** `npm run test:security`

---

## Response headers

Applied on every response via `securityHeadersMiddleware` in `server/app.js`:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-DNS-Prefetch-Control` | `off` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

Implementation: `server/services/securityHeaders.js`  
`X-Powered-By` disabled: `app.disable("x-powered-by")`.

---

## Authentication

### Members (username + PIN)

| Control | Implementation |
|---------|----------------|
| Login endpoint | `POST /api/auth/pin-login` |
| Throttle | `server/services/pinAuthThrottle.js` — lockout after failures |
| Username normalize | `server/services/loginResolve.js` |
| Invalid message | Generic: "Invalid username or PIN" |
| Memory fallback | In-memory throttle when DB unavailable (logged) |

**UI rule:** Login never shows email, password, or phone login.

### Operators (admin)

| Control | Implementation |
|---------|----------------|
| Auth page | `/hard/auth` |
| Allowlist | `COMMAND_CENTER_EMAILS`, `admin_users` table |
| Destructive PIN | `COMMAND_CENTER_PIN` / `ADMIN_ACTION_PIN` |
| Bootstrap | `POST /api/admin/bootstrap` — disabled unless `ADMIN_BOOTSTRAP_ENABLED=true` |
| Legacy setup | `/api/hard/setup` — disabled unless `LEGACY_SETUP_ENABLED=true` |

### Diagnostics and cron

| Control | Implementation |
|---------|----------------|
| Diagnostics | `x-diagnostics-secret` header (`DIAGNOSTICS_SECRET`; deprecated `CRON_SECRET` fallback when unset) |
| Admin automation | `x-bamsignal-secret` header (`ADMIN_SECRET` only) |
| Cron | `x-cron-secret` header (`CRON_SECRET`) — no query param |
| Access helper | `server/services/diagnosticsAccess.js` |

**Rule:** `ADMIN_SECRET`, `DIAGNOSTICS_SECRET`, and `CRON_SECRET` must use **unique values** in production.

---

## Transport hardening

| Control | Implementation |
|---------|----------------|
| HSTS | Terminated at Cloudflare edge for production domains — origin receives HTTPS from Cloudflare |
| CSP | No application-level CSP header today; static assets served from same origin. Third-party scripts limited to build-time `VITE_*` integrations. Document any new inline scripts through security review. |
| TLS to Postgres | `DATABASE_URL` connections use SSL with `rejectUnauthorized: false` for managed Postgres providers (Supabase/Hetzner). Set `PGSSLMODE=disable` only for local development. |
| Webhook signatures | Paystack webhooks verify HMAC using `PAYSTACK_WEBHOOK_SECRET` or `PAYSTACK_SECRET_KEY` — never skip verification on production paths |

Implementation references: `server/db.js`, `server/migrationRunner.js`, `server/databaseConnection.js`, Paystack webhook handler in `server/routes/paystack.js`.

---

## Authorization

Role-based permissions on `/hard` tabs — see [PERMISSIONS.md](./PERMISSIONS.md).

`ENFORCED_HARD_ROUTE_PATHS` in `permissions.ts` — every protected admin path registered for audit.

---

## Payment security

| Control | Implementation |
|---------|----------------|
| Webhook signature | `PAYSTACK_WEBHOOK_SECRET` or `PAYSTACK_SECRET_KEY` |
| Raw body | Paystack webhook paths use `express.raw` for signature verify |
| Idempotent fulfillment | Unique `paystack_reference` on `payment_fulfillments` |
| Race handling | `test:payment-fulfillment-race.mjs` |

---

## Data protection

| Area | Control |
|------|---------|
| Log redaction | `server/services/logRedaction.js` — usernames hashed in logs |
| Identity exposure | `test:identity-exposure.mjs` |
| Photo moderation | Server authority — `PHOTO_MODERATION_MODE`, admin moderation API |
| Supabase RLS | Views hardened — `fixSecurityDefinerViews.js` at startup |
| Function security | `search_path` fix — `fixFunctionSecurity.js` |

---

## Secrets management

**Never commit:** `.env`, service account JSON, API keys.

| Class | Storage |
|-------|---------|
| `VITE_*` public keys | Docker build args (Coolify buildtime ON) |
| Runtime secrets | Coolify runtime env (buildtime OFF) |
| CRON / diagnostics | Password manager + Coolify only |

Reference: `.env.example`, `Dockerfile` comments, `.cursor/rules/deployment.mdc`.

---

## Rate limiting

- PIN login throttle (per username + IP context) — memory fallback when DB unavailable.
- API rate limits (`server/services/rateLimit.js`) — database authoritative, **memory fallback** during outages.
- Payment initialize throttle — memory fallback (`test:payment-initialize-throttle.mjs`).
- Admin action PIN throttle — fail-closed without database (`test:admin-action-pin-throttle.mjs`).
- Rate limit retention — `api_rate_events` table (`0003` migration).

---

## Security verification

```bash
npm run test:security
npm run audit:permissions
npm run test:source-integrity
npm run test:production-hardening
npm run certify:production
```

Institutional dashboard aggregates checks at `/hard/security-dashboard` (`productionSecurityLogic.ts`).

---

## Related documents

- [PERMISSIONS.md](./PERMISSIONS.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [RUNBOOK.md](./RUNBOOK.md)
