# Runbook

Operational procedures for BamSignal production. Detailed playbooks live in `docs/runbooks/` — this document is the **on-call index**.

**Platform:** Coolify — https://control.stankings.com (alias: https://control.bamsignal.com)  
**Production:** https://bamsignal.com

---

## Quick triage

| Symptom | Severity | First action |
|---------|----------|--------------|
| Site 502/503 | P0 | Check Coolify container + `GET /ready` |
| `/ready` 503 | P0 | Readiness deps — DB, Paystack, signup email, photos |
| Login failures spike | P1 | Check `pin_login_failed` logs, DB connectivity |
| Payments not fulfilling | P1 | [payment-recovery.md](./docs/runbooks/payment-recovery.md) |
| Bad deploy | P1 | [deployment-recovery.md](./docs/runbooks/deployment-recovery.md) |
| Data loss suspicion | P0 | Stop writes, [database-restore.md](./docs/runbooks/database-restore.md) |
| Photos missing | P2 | [storage-restore.md](./docs/runbooks/storage-restore.md) |

---

## Health checks

```bash
# Liveness
curl -s https://bamsignal.com/health

# Readiness (503 = not production-ready)
curl -s -o /dev/null -w "%{http_code}\n" https://bamsignal.com/ready

# Detailed (requires secret)
curl -s -H "x-diagnostics-secret: $DIAGNOSTICS_SECRET" \
  "https://bamsignal.com/ready?details=1" | jq .
```

| Endpoint | Pass | Fail |
|----------|------|------|
| `/health` | 200, `{ ok: true }` | Connection refused, timeout |
| `/ready` | 200 | 503 — check `database`, `paystack`, `signupEmail`, `photoStorage` |

Docker `HEALTHCHECK` uses `/ready` — failing container may be restarted by orchestrator.

---

## Emergency: site down

1. **Coolify** → BamSignal service → check container status and logs.
2. Look for:
   - `Missing build output` — image build failed
   - `db_unavailable` — Postgres unreachable
   - `ready_check_failed` — missing secrets
3. **Restart** container if transient (no code change).
4. If bad deploy: rollback per [DEPLOYMENT.md](./DEPLOYMENT.md#rollback-steps).
5. If DB down: contact Supabase status, verify `DATABASE_URL`.
6. Post-incident: log in monitoring center `/hard/monitoring` if available.

---

## Emergency: payment incident

1. Check Paystack dashboard for transaction status.
2. Query `payment_fulfillments` by `paystack_reference`.
3. Follow `docs/runbooks/payment-recovery.md`:
   - Replay webhook if signature valid
   - Manual fulfillment only with ops approval
4. Verify member entitlement in `app_users` / product flags.
5. Confirm purchase email sent (`email_sent_at` on fulfillment).

---

## Emergency: auth / lockout spike

1. Check logs for `pin_login_locked`, `throttle_db_unavailable`.
2. If DB throttle down: memory throttle active — restore DB first.
3. Review `rate_limit_events` for abuse patterns.
4. Do **not** disable throttle without security review.

---

## Emergency: data corruption

1. **Stop** destructive admin operations.
2. Snapshot current state if possible (`pg_dump` — see BACKUP_RECOVERY).
3. Identify scope (table, time range).
4. Restore from backup per `docs/runbooks/database-restore.md`.
5. Run `npm run verify:database` on restored environment before cutover.

---

## Scheduled operations

| Task | Frequency | Reference |
|------|-----------|-----------|
| Verify `/ready` | Daily | Monitoring |
| Review payment failures | Daily | Finance ops `/hard/finance` |
| Permission audit | Monthly | `npm run audit:permissions` |
| Backup drill | Quarterly | BACKUP_RECOVERY.md |
| Certification suite | Pre-release | `npm run test` |

---

## Admin access recovery

| Scenario | Action |
|----------|--------|
| Locked out of `/hard` | Verify email in `COMMAND_CENTER_EMAILS` / `admin_users` |
| No operators exist | One-time bootstrap: `/hard/auth` + `ADMIN_BOOTSTRAP_*` (disable after) |
| Forgot COMMAND_CENTER_PIN | Rotate in Coolify, redeploy |
| CRON jobs failing | Verify `CRON_SECRET` header on caller |

---

## Log events to watch

From `server/services/observability.js`:

| Event | Meaning |
|-------|---------|
| `ready_check_failed` | Readiness dependency missing |
| `pin_login_failed` | Failed member login |
| `pin_login_locked` | Throttle lockout |
| `payment_webhook_failed` | Invalid signature or processing error |
| `throttle_db_unavailable` | Rate limit falling back to memory |
| `db_unavailable` | Database connection failure |

---

## Detailed runbooks

| Document | Path |
|----------|------|
| Index | `docs/runbooks/README.md` |
| Deployment recovery | `docs/runbooks/deployment-recovery.md` |
| Database backup | `docs/runbooks/database-backup.md` |
| Database restore | `docs/runbooks/database-restore.md` |
| Storage backup | `docs/runbooks/storage-backup.md` |
| Storage restore | `docs/runbooks/storage-restore.md` |
| Payment recovery | `docs/runbooks/payment-recovery.md` |

---

## Related documents

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [BACKUP_RECOVERY.md](./BACKUP_RECOVERY.md)
- [MONITORING.md](./MONITORING.md)
- [SECURITY.md](./SECURITY.md)
