# Database backup runbook

**Scope:** BamSignal Postgres (Supabase) — member data, payments ledger, admin settings, social graph.

**Production:** Coolify at [control.bamsignal.com](https://control.bamsignal.com). Database is external Postgres via `DATABASE_URL` (Supabase).

---

## What must be backed up

| Layer | Contents | Priority |
|-------|----------|----------|
| **Full database** | `app_users`, `app_member_profiles`, chats, signals, payments | Critical |
| **Auth schema** | Supabase `auth.users` (login identities) | Critical |
| **Payment tables** | `payment_events`, `payment_fulfillments`, `subscription_events` | Critical |
| **Platform config** | `platform_settings`, `admin_users` | High |
| **Schema reference** | `supabase/migrations/*.sql` in repo (security fixes) | Medium |

BamSignal also creates/updates tables at runtime via `server/db.js` (`ensure*Table` helpers). Treat **logical dumps** as source of truth; do not rely on repo migrations alone for full schema history.

---

## Backup methods

### 1. Supabase dashboard export (recommended for operators)

1. Open Supabase project → **Database** → **Backups** (Pro plan) or **Database** → **SQL** for ad-hoc exports.
2. Confirm automated daily backups are enabled on the Supabase plan.
3. For manual snapshot before risky changes: use **Backups** → create backup, or export via SQL editor for specific tables.

### 2. `pg_dump` (portable, scriptable)

Use the **direct** Postgres connection string from Supabase (**Settings → Database → Connection string → URI**). Store credentials in a password manager — never commit `DATABASE_URL`.

```bash
# Full logical backup (custom format — supports parallel restore)
export DATABASE_URL='postgresql://...'   # from secure vault, not git
pg_dump "$DATABASE_URL" \
  --format=custom \
  --file="bamsignal-$(date +%Y%m%d-%H%M%S).dump" \
  --no-owner \
  --no-acl

# Schema-only (for drift review)
pg_dump "$DATABASE_URL" \
  --schema-only \
  --file="bamsignal-schema-$(date +%Y%m%d).sql"

# Critical tables only (faster, payment recovery)
pg_dump "$DATABASE_URL" \
  --format=custom \
  --table=payment_events \
  --table=payment_fulfillments \
  --table=subscription_events \
  --table=app_users \
  --file="bamsignal-payments-$(date +%Y%m%d).dump"
```

Use SSL unless local dev sets `PGSSLMODE=disable` (see `.env.example`).

### 3. Repo schema artifacts

Commit and tag releases that include:

- `supabase/migrations/*.sql`
- Application release tag on GitHub (`main` at deploy time)

These are **not** a substitute for database dumps.

---

## Recommended schedule

| Backup type | Frequency | Retention |
|-------------|-----------|-----------|
| Supabase automated | Daily (enable in Supabase) | Per Supabase plan (min 7 days) |
| Manual `pg_dump` full | Before major releases / schema work | 30 days off-site |
| Payment-table dump | Daily or before billing incidents | 90 days |
| Schema-only export | After any manual DDL | 12 months |

Store dumps **encrypted** (S3, Backblaze, or operator vault). Restrict access to ops roles only.

---

## Verification (non-destructive)

After each backup:

1. Confirm file size > 0 and timestamp matches run.
2. Optional: restore to a **staging** Supabase project and run:

   ```bash
   node scripts/verify-database.mjs
   ```

   (`verify-database.mjs` writes test rows — **never run against production**.)

3. Spot-check payment tables:

   ```sql
   select count(*) from payment_fulfillments;
   select count(*) from payment_events;
   ```

---

## Single points of failure

- One primary Postgres instance (Supabase). Mitigate with Supabase PITR/backups and off-site `pg_dump`.
- Runtime schema in `server/db.js` — dumps capture live schema; repo migrations are partial.
- No in-app backup job — backups are **operator responsibility**.

---

## Related runbooks

- [database-restore.md](./database-restore.md)
- [payment-recovery.md](./payment-recovery.md)
- [deployment-recovery.md](./deployment-recovery.md)
