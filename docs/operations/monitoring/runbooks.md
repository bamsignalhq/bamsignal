# Operational Runbooks

Scenario-based runbooks for production monitoring incidents. Each runbook links to disaster recovery docs where applicable.

**Severity defaults:** See [incident-escalation.md](./incident-escalation.md)  
**Alerts:** See [alerts.md](./alerts.md)

---

## Runbook index

| Scenario | Default severity | DR doc |
|----------|------------------|--------|
| [API Down](#api-down) | P1 | [deployment-recovery.md](../../runbooks/deployment-recovery.md) |
| [Database Down](#database-down) | P1 | [database-restore.md](../../runbooks/database-restore.md) |
| [Supabase Incident](#supabase-incident) | P1 | [database-restore.md](../../runbooks/database-restore.md) |
| [Payment Failure](#payment-failure) | P1 | [payment-recovery.md](../../runbooks/payment-recovery.md) |
| [Notification Failure](#notification-failure) | P2 | — |
| [Calendar Failure](#calendar-failure) | P2 | — |
| [Storage Failure](#storage-failure) | P1 | [storage-restore.md](../../runbooks/storage-restore.md) |
| [Authentication Failure](#authentication-failure) | P2 | — |
| [Deep Link Failure](#deep-link-failure) | P2 | [deep-link-verification.md](../../releases/checklists/deep-link-verification.md) |
| [Docker Failure](#docker-failure) | P1 | [deployment-recovery.md](../../runbooks/deployment-recovery.md) |
| [Deployment Failure](#deployment-failure) | P1 | [deployment-recovery.md](../../runbooks/deployment-recovery.md) |
| [Android Release Failure](#android-release-failure) | P2 | [production-release-checklist.md](../../releases/checklists/production-release-checklist.md) |

---

## API Down

**Symptoms:** 502/503, `/health` or `/ready` failing, site unreachable  
**Severity:** P1

### Diagnosis

```bash
curl -s -o /dev/null -w "health:%{http_code}\n" https://bamsignal.com/health
curl -s -o /dev/null -w "ready:%{http_code}\n"  https://bamsignal.com/ready
```

1. Coolify → BamSignal → container status and logs
2. Check for OOM, crash loop, migration failure on boot
3. If `/health` OK but `/ready` 503 → dependency failure (not process dead)

### Mitigation

| Cause | Action |
|-------|--------|
| Process crash / OOM | Coolify restart; scale memory if repeat |
| Bad deploy | [Deployment Failure](#deployment-failure) rollback |
| Dependency 503 | Fix DB/Paystack/storage per specific runbook |
| Migration stuck | Check boot logs; `RUN_MIGRATIONS_ON_STARTUP`; schema in `/ready?details=1` |

### Verification

- [ ] `/health` → 200
- [ ] `/ready` → 200
- [ ] Homepage + login smoke
- [ ] Error rate baseline restored

---

## Database Down

**Symptoms:** `/ready` database false, `db_unavailable` logs, API 503 on DB routes  
**Severity:** P1

### Diagnosis

1. Supabase dashboard — project status, connections, disk
2. Verify `DATABASE_URL` in Coolify (not rotated/expired)
3. `/ready?details=1` → `databaseError`, `schema.missing`

### Mitigation

| Cause | Action |
|-------|--------|
| Supabase outage | Wait + status page; communicate ETA |
| Connection pool exhausted | Kill idle connections; restart API; scale pool |
| Missing tables | Apply migrations; redeploy with `migrations/` copied |
| Data corruption | [database-restore.md](../../runbooks/database-restore.md) |

### Verification

- [ ] `/ready` database true
- [ ] `node scripts/verify-database.mjs` (staging first if restoring)
- [ ] Member login + profile load

---

## Supabase Incident

**Symptoms:** Supabase platform issue, auth/storage/DB combined failures  
**Severity:** P1

### Diagnosis

1. Supabase status page
2. Separate DB vs Storage vs Auth symptoms
3. Check regional outage reports

### Mitigation

1. Enable maintenance communication if extended
2. DB-only: connection string failover if replica exists
3. Storage-only: photo uploads fail but site may load — degrade gracefully
4. Full outage: static public pages may cache; member app degraded

### Recovery

- Post-incident: verify RLS, bucket policies, connection counts
- Document in [incident-template.md](../../releases/templates/incident-template.md)

---

## Payment Failure

**Symptoms:** `payment_webhook_failed`, paid-but-not-active, Paystack errors  
**Severity:** P1

### Diagnosis

1. `/ready` paystack flag
2. `GET /api/diagnostics/paystack-connectivity` (with diagnostics auth)
3. Paystack dashboard — webhook delivery logs
4. Server logs for webhook signature failures

### Mitigation

| Cause | Action |
|-------|--------|
| Missing `PAYSTACK_SECRET_KEY` | Restore in Coolify; restart |
| Webhook URL wrong | Fix Paystack dashboard URL |
| Signature mismatch | Verify live vs test keys |
| Fulfillment lag | [payment-recovery.md](../../runbooks/payment-recovery.md) — replay verify |

### Verification

- [ ] Test initialize + verify flow (small amount)
- [ ] Webhook 200 in Paystack logs
- [ ] Purchase confirmation email sent once
- [ ] User returned to preserved `paymentReturnPath`

---

## Notification Failure

**Symptoms:** No emails, push, or WhatsApp; signupEmail false; queue backlog  
**Severity:** P2 (P1 if signup email blocks `/ready`)

### Diagnosis

1. `/ready?details=1` — `signupEmail`, `resend`, Firebase, `sendchampTrace`
2. Provider dashboards (Resend, Firebase, SendChamp)
3. Log rates for notification errors

### Mitigation

| Channel | Action |
|---------|--------|
| Email / signup | Fix `RESEND_API_KEY`, domain verification, service role |
| Push | Rotate Firebase credentials; check service account JSON |
| WhatsApp | Verify SendChamp sender approval and templates |
| Queue backlog | Ops triage; replay failed jobs if idempotent |

### Verification

- [ ] `/ready` signupEmail true
- [ ] Test signup email
- [ ] Test push to test device
- [ ] Test WhatsApp OTP if enabled

---

## Calendar Failure

**Symptoms:** Consultation scheduling 503, missing meeting links  
**Severity:** P2

### Diagnosis

1. Startup logs — Google Calendar OAuth completeness
2. Zoom / Meet env presence
3. Consultation scheduling test flow

### Mitigation

| Cause | Action |
|-------|--------|
| Google OAuth expired | Re-authorize; update Coolify env |
| Zoom key invalid | Rotate Zoom credentials |
| Meet unavailable | Fallback to Zoom; ops manual link |

### Verification

- [ ] Schedule test consultation
- [ ] Calendar invite received
- [ ] Meeting link opens

---

## Storage Failure

**Symptoms:** photoStorage false, upload 5xx, missing photos  
**Severity:** P1

### Diagnosis

1. `/ready?details=1` photoStorage
2. Supabase Storage dashboard — buckets, policies, quota
3. Test upload via member flow

### Mitigation

| Cause | Action |
|-------|--------|
| Bucket policy | Fix RLS / policy in Supabase |
| Quota exceeded | Upgrade tier or cleanup orphans |
| Service role missing | Restore `SUPABASE_SERVICE_ROLE_KEY` |
| Data loss | [storage-restore.md](../../runbooks/storage-restore.md) |

### Verification

- [ ] Photo upload succeeds
- [ ] Photo renders on profile
- [ ] `/ready` photoStorage true

---

## Authentication Failure

**Symptoms:** Login spike failures, lockouts, throttle errors  
**Severity:** P2 (P1 if total auth outage)

### Diagnosis

1. Distinguish invalid credentials vs system failure
2. Check `throttle_db_unavailable` — rate limit falling back to memory
3. Supabase auth / DB connectivity
4. `pin_login_locked` spike → possible attack

### Mitigation

| Cause | Action |
|-------|--------|
| DB throttle store down | Fix database (see Database Down) |
| Credential stuffing | Monitor; tighten throttle; no UI copy changes |
| Session/bootstrap bug | Deploy fix; check member hydration |
| Supabase auth outage | Communicate; wait for provider |

### Verification

- [ ] Valid username + PIN login succeeds
- [ ] Invalid PIN returns correct error copy
- [ ] No member shell on public routes

---

## Deep Link Failure

**Symptoms:** Play Console domain warning, payment opens browser not app  
**Severity:** P2

### Diagnosis

Full checklist: [deep-link-verification.md](../../releases/checklists/deep-link-verification.md)

1. `curl https://bamsignal.com/.well-known/assetlinks.json`
2. Compare SHA-256 to Play App Signing certificate
3. Android manifest intent filters vs callback URLs

### Mitigation

| Cause | Action |
|-------|--------|
| Wrong fingerprint | Update `assetlinks.json`; redeploy web |
| Stale web assets | Rebuild + deploy; verify dist |
| Manifest path mismatch | Fix `pathPrefix` / Paystack callback URL |
| Custom scheme OK, HTTPS not | Users can still use `com.bamsignal.com://payment-success` |

### Verification

- [ ] ADB App Link test passes
- [ ] Play Console deep link status clean
- [ ] Payment return opens app

---

## Docker Failure

**Symptoms:** Container restart loop, OOM, unhealthy in Coolify  
**Severity:** P1

### Diagnosis

1. Coolify logs — OOM, uncaught exception, migration timeout
2. Memory/CPU graphs
3. HEALTHCHECK failures on `/ready`

### Mitigation

| Cause | Action |
|-------|--------|
| OOM | Increase memory limit; profile leak |
| Migration timeout | Extend start-period; fix SQL |
| Crash on boot | Fix code; rollback deploy |
| Disk full | Clear logs/images; expand disk |

### Verification

- [ ] Container stable > 30 min
- [ ] `/ready` → 200
- [ ] No restart loop

---

## Deployment Failure

**Symptoms:** Coolify build fail, post-deploy `/ready` 503, bad release  
**Severity:** P1

### Diagnosis

1. Coolify build logs — npm build, test:source-integrity
2. Compare commit SHA to intended release
3. [release history](../../releases/history/index.md) — rollback target

### Mitigation

1. **Rollback** — Coolify redeploy previous successful deployment
2. Or `git revert` + push to `main`
3. Document in [rollback-template.md](../../releases/templates/rollback-template.md)

See [deployment-recovery.md](../../runbooks/deployment-recovery.md).

### Verification

- [ ] Previous stable SHA running
- [ ] `/ready` → 200
- [ ] Production verification checklist complete
- [ ] Release record status → Rolled Back

---

## Android Release Failure

**Symptoms:** Crash spike, stale assets, deep link regression, verify-assets fail  
**Severity:** P2 (P1 if widespread crashes)

### Diagnosis

1. Play Console — crash traces, ANR
2. Compare AAB versionCode to intended release
3. `npm run android:verify-assets` locally
4. Confirm web build before `cap sync`

### Mitigation

| Cause | Action |
|-------|--------|
| Stale dist in AAB | Rebuild: `npm run build` → `cap sync` → fresh AAB |
| Crash bug | Hotfix release; staged rollout halt in Play Console |
| Deep links | [Deep Link Failure](#deep-link-failure) |
| Bad rollout | Halt rollout; previous version promoted |

### Verification

- [ ] `android:verify-assets` pass
- [ ] Crash-free rate stable
- [ ] Deep link checklist pass
- [ ] Document in release record

---

## General incident checklist

Apply to all runbooks:

1. Classify P1–P4 → [incident-escalation.md](./incident-escalation.md)
2. Create incident record if P1/P2
3. Execute scenario steps above
4. Verify SLIs green → [slis.md](./slis.md)
5. Postmortem if required
6. Update alerts/runbooks if gap found

---

## Related

- [health-checks.md](./health-checks.md)
- [service-dependencies.md](./service-dependencies.md)
- [../runbooks/README.md](../../runbooks/README.md)
- [../releases/README.md](../../releases/README.md)
