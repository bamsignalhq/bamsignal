# Database restore runbook

**When to use:** corruption, accidental deletes, bad migration, need to roll back data to a known good point.

**Stop conditions:** If unsure which backup to use, **do not restore over production** until a staging restore is validated.

---

## Before you start

1. **Announce maintenance** — BamSignal will be inconsistent during restore.
2. **Pause deploys** in Coolify (no new containers during restore).
3. **Capture current state** (even if corrupt):

   ```bash
   pg_dump "$DATABASE_URL" --format=custom \
     --file="bamsignal-pre-restore-$(date +%Y%m%d-%H%M%S).dump"
   ```

4. Identify restore target: Supabase PITR timestamp **or** a `.dump` file from [database-backup.md](./database-backup.md).

---

## Option A — Supabase point-in-time recovery (PITR)

If Supabase Pro PITR is enabled:

1. Supabase dashboard → **Database** → **Backups** → **Restore** / PITR.
2. Choose timestamp **just before** the incident.
3. Restore creates a **new** project or branch (preferred) — point staging `DATABASE_URL` at it first.
4. Run verification on staging (see below).
5. Swap production `DATABASE_URL` in Coolify only after sign-off.

---

## Option B — Restore from `pg_dump`

**Staging first (required):**

```bash
# Drop and recreate staging database, or use empty Supabase project
pg_restore \
  --dbname="$STAGING_DATABASE_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  bamsignal-YYYYMMDD.dump
```

**Production (after staging OK):**

1. Scale BamSignal to **0** replicas or stop container in Coolify.
2. Restore:

   ```bash
   pg_restore \
     --dbname="$DATABASE_URL" \
     --clean \
     --if-exists \
     --no-owner \
     --no-acl \
     bamsignal-YYYYMMDD.dump
   ```

3. Restart container; confirm `GET /ready` returns **200** (with runtime secrets configured).
4. Smoke-test: login (existing user), profile pull, payment verify read-only query.

---

## Partial restore (accidental delete)

For targeted recovery without full restore:

1. Restore backup to a **temporary** database.
2. Export affected rows:

   ```sql
   copy (select * from app_member_profiles where id = '...') to stdout csv header;
   ```

3. Merge into production with explicit `insert ... on conflict` — review FKs (`user_key`, `auth.users`).
4. Log action in Command Center audit trail.

Payment rows: prefer [payment-recovery.md](./payment-recovery.md) over manual SQL when Paystack still has the transaction.

---

## Post-restore verification

| Check | Command / action |
|-------|------------------|
| DB connectivity | `GET https://bamsignal.com/ready` → 200 |
| Staging DB smoke | `node scripts/verify-database.mjs` on **staging only** (writes test data) |
| App smoke | `npm run test:server-import` against restored staging |
| Payment ledger | `select paystack_reference, status from payment_fulfillments order by created_at desc limit 20;` |
| Auth | Test username + PIN login for a known account |
| Storage URLs | Profile photos still resolve (storage is separate — see [storage-restore.md](./storage-restore.md)) |

---

## Auth.users coordination

Member login uses Supabase Auth (`auth.users`) **and** BamSignal tables (`app_users`, `app_member_profiles`). Restoring only `public` schema without `auth` breaks login.

- Full restore: include `auth` schema in dump or restore entire Supabase backup.
- Partial: reconcile usernames/emails between `auth.users` and `app_member_profiles` before reopening traffic.

---

## Rollback of a bad restore

If restore made things worse:

1. Stop app.
2. Restore the **pre-restore** dump captured at the start.
3. Re-open only after `/ready` passes.

---

## Related runbooks

- [database-backup.md](./database-backup.md)
- [payment-recovery.md](./payment-recovery.md)
- [deployment-recovery.md](./deployment-recovery.md)
