# Monitoring

BamSignal monitoring spans HTTP health endpoints, structured observability logs, institutional admin dashboards, and certification test suites.

---

## Health endpoints

| Endpoint | Type | Implementation |
|----------|------|----------------|
| `GET /health` | Liveness | `server/services/readiness.js` → `livenessPayload()` |
| `GET /ready` | Readiness | `readinessPayload()` — DB ping, Paystack, signup email, photo storage |
| `HEAD /health`, `HEAD /ready` | Probe-friendly | Same logic, no body |

### Readiness checks

`isReadinessChecksReady()` requires all of:

- `databaseReady` — `DATABASE_URL` connected and ping OK
- `paystackReady` — `PAYSTACK_SECRET_KEY` set
- `signupEmailReady` — Resend + Supabase service role configured
- `photoStorageReady` — Supabase storage buckets accessible

Detailed fields (with `?details=1` + diagnostics secret):

- `database`, `paystack`, `resend`, `signupEmail`, `signupEmailTrace`
- Firebase health, `telegram`, `sendchamp`, `sendchampTrace`, `photoStorage`

---

## Docker and Coolify

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/ready')..."
```

Coolify health check should target **`/ready`**, not `/health`.

Startup warning when not ready:

```
[bamsignal] Production readiness incomplete — GET /ready returns 503 until ...
```

---

## Observability

**Middleware:** `requestContextMiddleware` in `server/app.js`  
**Service:** `server/services/observability.js`

### Structured events

| Event | When |
|-------|------|
| `ready_check_failed` | `/ready` returns not ready |
| `pin_login_failed` | Invalid credentials |
| `pin_login_locked` | Throttle lockout |
| `payment_webhook_failed` | Webhook signature or processing failure |
| `throttle_db_unavailable` | Rate limit DB fallback |
| `member_memory_throttle_used` | In-memory throttle active |

Logs include `requestId` / `correlationId` where applicable.  
Sensitive fields redacted via `logRedaction.js`.

### Diagnostics API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/diagnostics/paystack-connectivity` | Paystack reachability |
| `GET/POST /api/diagnostics/view-security` | Security definer view status |
| `GET/POST /api/diagnostics/function-security` | Function search_path status |

Requires `x-diagnostics-secret` or admin session.

---

## Admin monitoring surfaces

| Surface | Path | Engine |
|---------|------|--------|
| System Health | `/hard/system-health` | `systemHealth` services |
| Monitoring Center | `/hard/monitoring` | `monitoringCenterEngine.ts` |
| Performance Center | `/hard/performance` | `performanceCenterEngine.ts` |
| Production performance | `/hard/performance-optimization` | `productionPerformanceLogic.ts` |
| Launch certification | `/hard/launch-certification` | Aggregates readiness + security + perf |
| Institutional readiness | `/hard/readiness` | `institutionalReadinessEngine.ts` |
| Route audit | `/hard/audit/routes` | `routeAudit.ts` |
| Database audit | `/hard/audit/database` | `databaseAudit` |

---

## Automated verification

### Certification suite (pre-release)

```bash
npm run test              # 73 test:* scripts
npm run test:certification-suite
```

### Targeted audits

```bash
npm run audit:routes
npm run audit:permissions
npm run audit:persistence
npm run audit:journeys
npm run audit:launch
npm run test:system-health
npm run test:monitoring
npm run test:fortress          # includes observability + runbooks checks
```

### CI / hooks

- `npm run test:server-import` — enforced by `.githooks/pre-push` after `npm install`
- Docker build runs `test:source-integrity` in builder stage

---

## Alerting recommendations

| Signal | Threshold | Action |
|--------|-----------|--------|
| `/ready` != 200 | 2 consecutive failures | Page on-call, check Coolify + Supabase |
| `ready_check_failed` rate | > 5/min | Check secrets rotation |
| `payment_webhook_failed` | Any sustained | Payment runbook |
| `pin_login_locked` spike | > 100/hour | Possible credential stuffing |
| Container restarts | > 3/hour | Memory leak or crash loop |

Wire Coolify notifications or external uptime monitor to `https://bamsignal.com/ready`.

---

## Optional integrations

| Service | Env | Purpose |
|---------|-----|---------|
| Telegram bot | `TELEGRAM_BOT_TOKEN` | Ops notifications (optional) |
| Firebase | `FIREBASE_*` | Push notifications — app works without |
| Sendchamp | `SENDCHAMP_*` | WhatsApp delivery health in `/ready` details |

---

## Related documents

- [RUNBOOK.md](./RUNBOOK.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SECURITY.md](./SECURITY.md)
