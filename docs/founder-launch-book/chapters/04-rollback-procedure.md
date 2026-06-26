# Rollback Procedure

BamSignal has **no separate image registry** — rollback means redeploying a known-good git commit.

## Application rollback (preferred)

### Option A — Coolify redeploy

1. Open https://control.bamsignal.com → BamSignal service.
2. **Deployments** → select last known-good deployment.
3. **Redeploy** that artifact.
4. Confirm logs: `[bamsignal] Running on http://0.0.0.0:3000`
5. Verify `GET /ready` → 200 and `npm run smoke:production` PASS.

### Option B — Git revert

```bash
git revert <bad-sha>
git push origin main
```

Wait for Coolify rebuild, then verify health and smoke.

## Environment rollback

If a bad secret was introduced:

1. Coolify → Environment variables → restore previous values from password manager history.
2. Restart container (no code change required).
3. `curl -H "x-diagnostics-secret: $SECRET" "https://bamsignal.com/ready?details=1"`

## Database rollback

Schema rollback is **not automatic**. Options:

1. Restore Supabase backup to a point before migration (see **Backup and Recovery**).
2. Ship forward-fix migration if revert SQL was prepared.

**Stop writes** during data-loss suspicion — escalate P0.

## Payment rollback

- Do not delete Paystack ledger rows.
- Use `docs/runbooks/payment-recovery.md` for webhook replay or manual fulfillment with ops approval.
- Confirm member entitlement flags after any payment fix.

## Communication

- P1+: notify founder within 30 minutes.
- Record incident using `docs/releases/templates/incident-template.md`.
