# Rollback Checklist

Use when production deploy causes service degradation or certification failure.

## Decision Criteria

Rollback when ANY of:

- `/ready` returns 503 for > 2 minutes after deploy
- Payment webhook failure rate spikes above baseline
- Authentication failure rate spikes
- Data corruption or migration failure detected

Do **not** rollback database migrations — forward-fix only.

## Application Rollback (Coolify)

1. Open [Coolify control panel](https://control.stankings.com)
2. Select BamSignal production application
3. Deployments → select last known-good build (pre-`e574d50` if needed)
4. Redeploy previous image
5. Confirm `GET /ready` returns 200
6. Run `npm run test:production-smoke` against production URL

**Expected RTO:** ≤ 4 hours (target)

## Database — Do Not Roll Back

- Never run down migrations in production
- If migration partially failed: diagnose via Supabase logs, forward-fix with corrective SQL
- If data corruption: Supabase point-in-time recovery (PITR)

## Emergency Maintenance Mode

If rollback insufficient:

1. Set `maintenance_mode` = `true` in `ops_runtime_configuration`
2. Display emergency banner if needed
3. Investigate via `/ready?details=1` with diagnostics secret
4. Forward-fix or PITR restore
5. Re-run `npm run certify:production`
6. Disable maintenance mode

## Post-Rollback Verification

- [ ] `/health` and `/ready` green
- [ ] PIN login functional
- [ ] Paystack webhook processing
- [ ] No elevated error rates in observability
- [ ] Incident documented with root cause

## Recovery After Rollback

1. Fix issue on `main`
2. Re-certify locally: `npm run certify:production`
3. Re-deploy via Coolify
4. Apply any pending migrations separately (forward-only)
