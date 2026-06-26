# Monitoring

## Health endpoints

| Endpoint | Type | Pass criteria |
|----------|------|---------------|
| `GET /health` | Liveness | 200, `{ ok: true, service: "bamsignal" }` — no dependency fields |
| `GET /ready` | Readiness | 200 when DB + Paystack + signup email + photos OK |
| `HEAD /health`, `HEAD /ready` | Probes | Same status codes, no body |

Detailed readiness: `GET /ready?details=1` with `x-diagnostics-secret` or admin session.

## Structured logs

Service: `server/services/observability.js`

| Event | Meaning |
|-------|---------|
| `ready_check_failed` | Container not production-ready |
| `pin_login_failed` | Auth failure |
| `pin_login_locked` | Throttle lockout |
| `payment_webhook_failed` | Paystack webhook issue |
| `throttle_db_unavailable` | Rate limit DB fallback to memory |

Logs include `requestId` / `correlationId`. Sensitive fields redacted.

## Admin monitoring surfaces

| Surface | Path |
|---------|------|
| System Health | `/hard/system-health` |
| Monitoring Center | `/hard/monitoring` |
| Production Observability | `/hard/observability` |
| Platform Health | `/hard/platform-health` |
| Performance Center | `/hard/performance` |
| Institutional Readiness | `/hard/readiness` |

## Automated verification

```bash
npm run test                 # certification suite
npm run smoke:production     # post-deploy HTTP smoke
npm run test:monitoring
npm run test:system-health
```

Coolify health check must target **`/ready`**, not `/health` alone.

See also: `MONITORING.md`, `docs/operations/monitoring/observability-architecture.md`
