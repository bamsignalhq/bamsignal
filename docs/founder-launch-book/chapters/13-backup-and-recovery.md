# Backup and Recovery

BamSignal does **not** ship automated in-repo backup jobs. Operators manage backups via Supabase and documented playbooks.

**Admin UI:** `/hard/disaster-recovery` (Disaster Recovery Center)

## What to back up

| Layer | Priority | Method |
|-------|----------|--------|
| Postgres (users, chats, payments, CRM) | Critical | Supabase automated + `pg_dump` |
| Supabase Auth | Critical | Included in DB dump |
| Storage (photos, voice) | High | Bucket export / mirror |
| Platform config tables | High | DB dump |
| Application code | Medium | GitHub `main` |
| Coolify secrets | Critical | Password manager (not git) |

## Database backup

### Supabase automated

1. Supabase project → Database → Backups.
2. Confirm daily backups (Pro plan).
3. Manual snapshot before risky migrations.

### Manual dump

```bash
export DATABASE_URL='postgresql://...'   # from vault
pg_dump "$DATABASE_URL" \
  --format=custom \
  --file="bamsignal-$(date +%Y%m%d-%H%M%S).dump" \
  --no-owner --no-acl
```

Retention: 30 daily + 12 monthly off-site.

## Recovery

| Scenario | Playbook |
|----------|----------|
| Full DB restore | `docs/runbooks/database-restore.md` |
| Storage restore | `docs/runbooks/storage-restore.md` |
| Bad deploy | `docs/runbooks/deployment-recovery.md` |
| Payment replay | `docs/runbooks/payment-recovery.md` |

After restore: `npm run verify:database`, `npm run migrate`, redeploy, `smoke:production`.

See `BACKUP_RECOVERY.md` for full detail.
