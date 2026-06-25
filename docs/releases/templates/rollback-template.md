# BamSignal Rollback Record

> Copy to `docs/releases/rollback/YYYY-MM-DD-rollback-from-vX-to-vY.md` when executing a rollback.  
> Pair with the release record in [history/](../history/) and [deployment-recovery runbook](../../runbooks/deployment-recovery.md).

---

## Rollback Summary

| Field | Value |
|-------|-------|
| **Rollback ID** | RB-YYYY-MM-DD-NNN |
| **Triggered By** | |
| **Trigger Time** | YYYY-MM-DD HH:MM WAT |
| **From Release** | vX.Y.Z @ `<commit-sha>` |
| **To Release** | vX.Y.Z @ `<commit-sha>` |
| **Environment** | Production |
| **Severity** | Low / Medium / High / Critical |
| **Status** | In Progress / Complete / Failed |

---

## Reason for Rollback

<!-- Symptoms: 502/503, `/ready` failing, regression, payment failure, etc. -->

---

## Preparation

- [ ] Incident channel opened (if applicable)
- [ ] Stakeholders notified (Engineering, Founder)
- [ ] Previous stable commit SHA confirmed in Coolify deployment history
- [ ] Database state assessed (forward-only migrations?)
- [ ] [Rollback plan](../templates/release-template.md#rollback-plan) from source release reviewed
- [ ] Backup recency confirmed ([database-backup.md](../../runbooks/database-backup.md))

---

## Downtime

| Phase | Start | End | Duration |
|-------|-------|-----|----------|
| Planned maintenance | | | |
| Actual outage | | | |

**Expected downtime:** <!-- e.g. 2–5 min container restart -->  
**Actual downtime:**

---

## Docker Rollback

Coolify rebuilds from `Dockerfile` per git SHA — there is no separate in-repo image registry.

### Option A — Redeploy prior Coolify deployment (preferred)

1. Coolify → BamSignal service → **Deployments**
2. Select last **successful** deployment
3. **Redeploy** / **Rollback** (label varies by Coolify version)
4. Watch logs for `[bamsignal] Running on http://0.0.0.0:3000`

### Option B — Git revert on `main`

```bash
git revert <bad-commit-sha>
git push origin main
# Wait for webhook rebuild
```

- [ ] Container started successfully
- [ ] Build logs clean (no migration failures)
- [ ] Commit SHA matches target rollback version

---

## Database Rollback

> BamSignal migrations in `migrations/` run on container boot (`RUN_MIGRATIONS_ON_STARTUP`). Most migrations are forward-only.

- [ ] List migrations applied since bad release: _______________
- [ ] Reversible? ☐ Yes ☐ No
- [ ] If no: restore from backup ([database-restore.md](../../runbooks/database-restore.md)) or accept forward schema with rolled-back app
- [ ] Manual SQL executed (if any): _______________
- [ ] `node scripts/verify-database.mjs` on staging before prod (recommended)

---

## Supabase Verification

- [ ] `DATABASE_URL` unchanged and reachable
- [ ] `/ready` schema check passes (no missing tables)
- [ ] RLS policies intact
- [ ] Storage buckets accessible (photo upload smoke test)
- [ ] Supabase dashboard: no connection pool exhaustion

---

## Cache Clearing

- [ ] CDN / reverse proxy cache purge (if applicable)
- [ ] Service worker: confirm cache version from rolled-back build
- [ ] Android: users may need app restart (no forced update unless bad AAB shipped)

---

## Smoke Tests

| Test | Command / Action | Expected | Result |
|------|------------------|----------|--------|
| Liveness | `curl -s -o /dev/null -w "%{http_code}" https://bamsignal.com/health` | 200 | ☐ |
| Readiness | `curl -s -o /dev/null -w "%{http_code}" https://bamsignal.com/ready` | 200 | ☐ |
| Homepage | Browser GET `/` | Public SEO page, no member shell | ☐ |
| Login | `/login` username + PIN | Auth succeeds | ☐ |
| Payment return | `/payment/success?reference=test` | App shell, not public homepage dump | ☐ |
| Deep links | [deep-link-verification.md](../checklists/deep-link-verification.md) | As applicable | ☐ |

---

## Communication Checklist

- [ ] Engineering team notified — rollback start
- [ ] Engineering team notified — rollback complete
- [ ] Founder notified (if production-impacting)
- [ ] Support briefed (if user-visible)
- [ ] Status page / social (if extended outage)
- [ ] Post-mortem scheduled (if Severity ≥ High)

---

## Completion Checklist

- [ ] Production verified (smoke tests pass)
- [ ] Source release record status → **Rolled Back**
- [ ] [history/index.md](../history/index.md) updated
- [ ] Incident record filed if applicable ([incident-template.md](./incident-template.md))
- [ ] Metrics baseline captured (T+0 post-rollback)
- [ ] Root cause ticket created for bad release
- [ ] Lessons learned documented

---

## Sign-off

| Role | Name | Date | Verified |
|------|------|------|----------|
| Release Engineer | | | ☐ |
| DevOps | | | ☐ |
