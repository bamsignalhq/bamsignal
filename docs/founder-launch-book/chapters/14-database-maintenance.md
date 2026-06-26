# Database Maintenance

## Schema sources

| Location | Purpose |
|----------|---------|
| `migrations/*.sql` | Application migrations (primary) |
| `supabase/migrations/*.sql` | Supabase-tracked migrations |
| `server/db.js` | Connection, ping, schema check |

## Routine maintenance

| Task | Frequency | Command / action |
|------|-----------|------------------|
| Verify connectivity | Weekly | `npm run verify:database` |
| Migration apply | On release | `npm run migrate` |
| Index review | Quarterly | Supabase advisors + `certify:database` |
| Backup verify | Monthly | Test restore to staging |
| Orphan photos | Monthly | `node scripts/reconcile-photo-orphans.mjs` |
| Audit | Pre-release | `/hard/audit/database` |

## Migration procedure

1. Review SQL in PR — RLS policies included.
2. Backup production (manual snapshot).
3. Apply: `npm run migrate` against production `DATABASE_URL`.
4. Deploy app if code depends on new schema.
5. Verify: `npm run verify:database`, member API smoke.

## Connection pool

- Use Supabase pooler URL for serverless-style bursts if recommended.
- Watch connection count during deploy windows.

## Read-only diagnostics

With `DIAGNOSTICS_SECRET`, certification E2E supports read/peek/cleanup on `cert.bamsignal.com` emails only — not general SQL access.

## Performance certification

```bash
npm run certify:database
```

Reports under `certification/database/reports/`.

## Never in production

- Ad-hoc `DELETE` without backup and approval.
- Disabling RLS without security review.
- Running unreviewed SQL from chat or tickets.
