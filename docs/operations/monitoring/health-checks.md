# Health Checks

Production health verification standards for BamSignal. Defines endpoints, probes, expected results, and check frequency.

**Implementation reference:** `server/services/readiness.js`, `server/services/serviceRegistry.js`, `docs/operations/service-registry-lifecycle.md`

---

## Application

| Check | Method | Endpoint / Command | Expected | Frequency |
|-------|--------|-------------------|----------|-----------|
| Liveness | GET / HEAD | `/health` | HTTP 200, `{ ok: true, service: "bamsignal" }` | 30s (Docker) |
| Readiness | GET / HEAD | `/ready` | HTTP 200 when all critical deps ready | 30s (Coolify) |
| Readiness detail | GET | `/ready?details=1` + diagnostics secret | Full dependency booleans + schema | On incident |
| Startup migrations | Log | Container boot | Migrations complete before `listen()` | Per deploy |
| Schema | `/ready?details=1` | `schema.ok === true` | No missing tables | Post-migrate |

### Readiness gates (`isReadinessChecksReady`)

`/ready` returns **200** only when **all CRITICAL registry services are configured** and **database is connected**. Important/optional integrations never fail readiness.

| Gate | Source |
|------|--------|
| Critical features | Service Registry — database, supabase, application URL, Paystack, Command Center, cron |
| Database | Registry `database` health — connected + ping OK |

Signup email, photo storage, Sendchamp, and Firebase are **important/optional** — visible in detailed readiness but do not fail `/ready`.

### Detailed-only fields (`?details=1` + diagnostics auth)

Registry snapshot (`registry.services`, metrics), `features`, `paystack`, `resend`, `signupEmail`, `sendchamp`, `firebase`, `photoStorage`, `telegram`, `schema`, `databaseError`

---

## Database

| Check | Command / Probe | Expected |
|-------|-----------------|----------|
| Connection ping | `/ready` database flag | `true` |
| Schema completeness | `/ready?details=1` → `schema` | `ok: true`, no `missing` array |
| Verification script | `node scripts/verify-database.mjs` | Exit 0 (staging/maintenance) |
| Connection count | Supabase dashboard / future metrics | Below pool limit |
| Slow queries | Supabase logs / future APM | p95 query < 500ms target |

---

## Storage

| Check | Method | Expected |
|-------|--------|----------|
| Photo storage ready | `/ready` → photoStorage (detailed) | `true` |
| Upload smoke | Member photo upload E2E | 200, object in bucket |
| Bucket policy | Supabase dashboard | RLS aligned |

---

## Notifications

| Channel | Health signal | Expected |
|---------|---------------|----------|
| Push (Firebase) | `/ready?details=1` Firebase fields | Configured or gracefully degraded |
| Email (Resend) | `signupEmail`, `resend` in detailed ready | `true` for production |
| WhatsApp (SendChamp) | `sendchamp`, `sendchampTrace` | Configured when feature active |
| Telegram (optional) | `telegram` boolean | Optional ops bot |

Structured log events: monitor `background_task_failed`, notification queue errors.

---

## Payments

| Check | Method | Expected |
|-------|--------|----------|
| Paystack configured | `/ready` paystack | `true` |
| Connectivity | `GET /api/diagnostics/paystack-connectivity` | Reachable (auth required) |
| Webhook processing | Log: absence of sustained `payment_webhook_failed` | < 1% failure rate |
| Verify endpoint | Paystack callback smoke | Fulfillment + confirmation email |

---

## Calendar / Meetings

| Check | Signal | Expected |
|-------|--------|----------|
| Google Calendar OAuth | Startup log completeness | No persistent service-unavailable |
| Zoom env | Consultation meeting creation | Link returned |
| Google Meet env | Standalone Meet path | Link or graceful unavailable |

---

## Email

| Check | Signal | Expected |
|-------|--------|----------|
| Signup email gate | `/ready` signupEmail | `true` |
| Purchase confirmation | Post-payment smoke | Email queued/sent once |
| Resend API | `RESEND_API_KEY` in Coolify | Valid, domain verified |

---

## WhatsApp

| Check | Signal | Expected |
|-------|--------|----------|
| SendChamp configured | `isSendchampConfigured()` trace | API key + sender |
| Verification codes | WhatsApp OTP flow | Delivery within SLA |

---

## Deep Links

| Check | Command | Expected |
|-------|---------|----------|
| assetlinks.json | `curl https://bamsignal.com/.well-known/assetlinks.json` | 200, valid JSON |
| apple-app-site-association | `curl .../apple-app-site-association` | 200 |
| Android App Links | `adb shell pm get-app-links com.bamsignal.com` | Domain verified |

Full checklist: [deep-link-verification.md](../../releases/checklists/deep-link-verification.md)

---

## Queues

| Queue | Signal | Expected |
|-------|--------|----------|
| Notification queue | Admin Monitoring Center / logs | Depth < threshold |
| Payment fulfillment | Ledger processing lag | Near real-time |
| Concierge applications | Operations Center | No stale > 24h unassigned |

*Future: explicit queue depth metrics via observability integration.*

---

## Background Jobs

| Job | Signal | Expected |
|-----|--------|----------|
| Cron endpoints | `CRON_SECRET` protected routes | 200 on schedule |
| Startup migrations | Boot logs | Complete before listen |
| Timer/listener cleanup | `timer_cleanup`, `listener_cleanup` logs | No leak warnings |

Log event: `background_task_failed` → alert.

---

## Memory

| Check | Signal | Threshold |
|-------|--------|-----------|
| Container RSS | Coolify / host metrics | < 80% limit |
| OOM restart | Container restart count | 0 per hour normal |
| Node heap | Future APM | Stable after warm-up |

---

## CPU

| Check | Signal | Threshold |
|-------|--------|-----------|
| Container CPU | Coolify metrics | < 70% sustained |
| Event loop lag | Future APM | p99 < 100ms |

---

## Disk

| Check | Signal | Threshold |
|-------|--------|-----------|
| Container disk | Host metrics | < 80% |
| Supabase disk | Supabase dashboard | < 80% |
| Log volume | Coolify logs rotation | No fill |

---

## Network

| Check | Signal | Expected |
|-------|--------|----------|
| Ingress | HTTPS 200 on `/` | Reachable globally |
| Egress | Paystack, Resend, SendChamp API calls | No sustained timeouts |
| Latency | External probe to `/health` | p95 < 500ms (target) |

---

## SSL

| Check | Command | Expected |
|-------|---------|----------|
| Certificate validity | `curl -vI https://bamsignal.com 2>&1 \| grep expire` | > 30 days remaining |
| Chain | SSL Labs (manual quarterly) | A or A+ |

Alert: see [alerts.md](./alerts.md) → Certificate expiry.

---

## DNS

| Check | Command | Expected |
|-------|---------|----------|
| Apex resolution | `dig bamsignal.com +short` | Production IP |
| WWW redirect | `curl -I https://www.bamsignal.com` | 301 to apex |
| `.well-known` | No CNAME break | Direct to app |

---

## Domain

| Check | Expected |
|-------|----------|
| Domain registration | > 60 days to expiry |
| DNS provider access | Documented in password manager |
| Coolify domain binding | Matches production URL |

---

## Backups

| Check | Method | Expected |
|-------|--------|----------|
| Database backup | [database-backup.md](../../runbooks/database-backup.md) | Daily, restorable |
| Storage backup | [storage-backup.md](../../runbooks/storage-backup.md) | Per policy |
| Backup age | Manual audit | < 24h for DB |
| Restore drill | Quarterly staging restore | Documented pass |

---

## Probe configuration

### Docker HEALTHCHECK

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/ready')..."
```

Use **`/ready`**, not `/health`, for container health.

### Coolify

- Health check URL: `https://bamsignal.com/ready` (or internal container URL)
- Failed readiness: check Coolify logs for `ready_check_failed`

### External uptime (recommended, not in-repo)

- Monitor: `GET https://bamsignal.com/ready` every 60s
- Alert: 2 consecutive non-200

---

## Certification automation

```bash
npm run test:server-import      # boot order, /ready mount
npm run test:readiness-health   # readiness logic (if script exists)
npm run test:system-health
npm run test:monitoring
npm run test:source-integrity   # /health vs /ready split enforced
```

---

## Related

- [service-dependencies.md](./service-dependencies.md)
- [alerts.md](./alerts.md)
- [runbooks.md](./runbooks.md)
