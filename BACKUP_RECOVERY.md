# Backup and Recovery

BamSignal does **not** ship automated backup jobs in this repository. Backups are operator-managed via Supabase and documented playbooks.

**Admin UI:** `/hard/recovery` (Disaster Recovery Center)  
**Detailed playbooks:** `docs/runbooks/`

---

## What to back up

| Layer | Contents | Priority | Method |
|-------|----------|----------|--------|
| Postgres | Users, profiles, chats, payments, concierge CRM | **Critical** | Supabase automated + `pg_dump` |
| Supabase Auth | `auth.users` | **Critical** | Included in full DB dump |
| Supabase Storage | `profile-photos`, `cover-photos`, voice | **High** | Bucket export / mirror |
| Platform config | `platform_settings`, `admin_users` | High | DB dump |
| Application code | `main` branch | Medium | GitHub |
| Secrets | Coolify env | **Critical** | Password manager (not git) |

---

## Database backup

### Supabase automated (recommended)

1. Supabase project → **Database** → **Backups**.
2. Confirm daily backups enabled (Pro plan).
3. Before risky migrations: create manual backup snapshot.

### Manual `pg_dump`

```bash
export DATABASE_URL='postgresql://...'   # from vault — never commit

pg_dump "$DATABASE_URL" \
  --format=custom \
  --file="bamsignal-$(date +%Y%m%d-%H%M%S).dump" \
  --no-owner --no-acl
```

**Retention:** Keep 30 daily + 12 monthly off-site (S3, encrypted volume).

Full procedure: `docs/runbooks/database-backup.md`

---

## Storage backup

Supabase Storage buckets:

- `profile-photos`
- `cover-photos`
- Voice assets (if enabled)

Mirror via Supabase CLI or periodic object sync.  
Procedure: `docs/runbooks/storage-backup.md`

Orphan reconciliation: `node scripts/reconcile-photo-orphans.mjs`

---

## Recovery procedures

### Database full restore

1. Provision clean Postgres (or Supabase restore point).
2. `pg_restore` from latest `.dump`.
3. Run `npm run verify:database`.
4. Run `npm run migrate` (idempotent — applies missing migrations).
5. Point `DATABASE_URL` to restored instance in Coolify.
6. Redeploy app, verify `/ready`.

Procedure: `docs/runbooks/database-restore.md`

### Storage restore

1. Restore bucket objects from mirror.
2. Run orphan reconciliation script.
3. Verify sample member photos load.

Procedure: `docs/runbooks/storage-restore.md`

### Application rollback

No DB restore needed — redeploy previous git SHA in Coolify.  
See [DEPLOYMENT.md](./DEPLOYMENT.md#rollback-steps).

### Payment recovery

Ledger in `payment_fulfillments` — replay or manual fulfill per playbook.  
`docs/runbooks/payment-recovery.md`

---

## Recovery time objectives (targets)

| Scenario | RTO target | RPO target |
|----------|------------|------------|
| Bad deploy | 15 min | 0 (no data loss) |
| DB restore from daily backup | 2 hours | 24 hours |
| Full region loss | 4 hours | 24 hours |
| Storage restore | 4 hours | 24 hours |

Adjust based on Supabase plan and backup frequency.

---

## Quarterly drill

1. Restore latest `pg_dump` to **staging** Supabase (never prod overwrite first).
2. Run `node scripts/verify-database.mjs` against staging.
3. Restore one storage bucket mirror sample.
4. Document time-to-recover and gaps.

---

## Business continuity

Institutional BC center: `/hard/business-continuity`  
Migration: `migrations/0007_business_continuity.sql`

---

## Related documents

- [RUNBOOK.md](./RUNBOOK.md)
- [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- `docs/runbooks/README.md`
