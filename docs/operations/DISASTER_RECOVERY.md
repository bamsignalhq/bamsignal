# Disaster Recovery

## Backup Strategy

| Asset | Method | Owner |
|-------|--------|-------|
| PostgreSQL (Supabase) | Automated daily backups + PITR | Platform |
| Photo storage (Firebase) | Provider retention policy | Platform |
| Runtime configuration | Export `ops_runtime_configuration` | Operations |
| Certification manifests | `certification/production/reports/manifest.json` per deploy | Engineering |

## Restore Procedure

1. Confirm incident scope via `GET /ready?details=1` with diagnostics secret
2. Enable `maintenance_mode` in ops runtime configuration
3. **Application fault:** Coolify rollback to previous successful image
4. **Database fault:** Supabase point-in-time recovery — forward-fix only, never partial schema rollback
5. Re-run `npm run certify:production` against restored environment
6. Disable maintenance mode after certification PASS

## Checklist

See `DISASTER_RECOVERY_CHECKLIST` in `server/services/productionReadiness/disasterRecovery.js`.

## RTO / RPO Targets (Launch)

| Metric | Target |
|--------|--------|
| RPO (data loss) | ≤ 24 hours (Supabase daily backup) |
| RTO (service restore) | ≤ 4 hours (Coolify redeploy + verification) |

## Quarterly Schedule

| Quarter | Activity | Owner |
|---------|----------|-------|
| Q3 2026 | PITR restore drill to staging Supabase | Platform |
| Q4 2026 | Coolify rollback exercise | Platform |
| Ongoing | Certification manifest archive per deploy | Engineering |

## Live Drill Status

**Last drill:** Not yet executed  
**Next scheduled:** Q3 2026  
**Procedure:** See restore procedure above; re-run `npm run smoke:production` after restore.

- Do not run down migrations in production
- Do not restore stale AAB/APK without fresh web asset verification
- Do not bypass certification after recovery
