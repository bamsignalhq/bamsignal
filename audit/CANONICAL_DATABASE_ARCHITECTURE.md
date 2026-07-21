# Canonical Database Architecture — BamSignal

**Status:** Canonical policy (Sprint 1.2)  
**Repository:** `bamsignalhq/bamsignal`  
**Supabase project:** `nswiwxmavuqpuzlsascs`  
**Date:** 2026-07-21

---

## Authoritative migration path

```
migrations/
    ↓
npm run migrate
    ↓
public.schema_migrations
    ↓
Production (Coolify / DATABASE_URL)
```

Also on boot (unless disabled):

```
server/production.js
    → runStartupMigrations()
    → migrationRunner.runMigrations()
    → migrations/*.sql
```

Disable startup applies with `RUN_MIGRATIONS_ON_STARTUP=false`.

---

## Tracking table

| Table | Owner | Purpose |
|-------|-------|---------|
| `public.schema_migrations` | App runner (`server/migrationRunner.js`) | ID = SQL filename stem; records applied migrations |

ID format: `NNNN_description` (e.g. `0054_discover_conversation_unlock`).

---

## Supabase CLI usage

| Action | Allowed? | Notes |
|--------|----------|-------|
| `supabase link` / project verify | **Yes** | Must match `nswiwxmavuqpuzlsascs` |
| `npm run verify:supabase-project` | **Required** before migrate wrappers | Guardrail |
| `supabase db dump` / read-only inspect | **Yes** | Evidence / backups |
| Adding files under `supabase/migrations/` | **Discouraged** | Mirror/archive only |
| `supabase db push` | **Forbidden** for schema changes | History diverged |
| `supabase migration repair` | **Only** in an approved Sprint 2.0+ plan | Metadata only, after backup |
| `supabase db reset` / `migration up` | **Forbidden** on production | |

`supabase/migrations/` is a **non-authoritative archive** of historical dual-track SQL. New schema changes must not be authored there.

---

## When `npm run migrate` is required

- Any DDL/DML that changes BamSignal application schema
- After adding a new file under `migrations/`
- Before deploying code that depends on new tables/columns
- Locally when `DATABASE_URL` points at a linked non-prod or explicitly approved target

Always:

```bash
npm run verify:supabase-project -- --require-linked
npm run migrate
```

(`migrate` script already chains verify.)

---

## When CLI is allowed

1. **Identity / link verification**
2. **Read-only dumps** for audit
3. **Local Supabase stack** (if introduced later) — must never target production ref by accident
4. **Approved metadata repair** after written plan + backup

---

## Repository policy

1. One write path: `migrations/` + app runner.
2. Do not dual-commit identical SQL to CLI folder.
3. Number migrations monotonically; do not reuse IDs.
4. Unused gaps (e.g. `0040`–`0047`) must be documented if intentional.
5. Never commit `supabase/.temp/` secrets/paths casually; keep link state local or document ignore rules.
6. Cross-app objects (`stankings_*`) must not be added to BamSignal migrations; cleanup is a separate product decision.
7. Identity source of truth: `docs/engineering/PROJECT_IDENTITY.md` + `server/applicationIdentity.js`.

---

## Startup migration flow

1. Container starts `node server/production.js`
2. `runStartupMigrations` reads `DATABASE_URL`
3. Ensures `schema_migrations` exists
4. Applies any on-disk file whose ID is not yet recorded
5. Server continues to listen

Schema verification at startup is verify-oriented for critical tables (separate from migrate).

---

## Repair vs migrate

| Goal | Tool |
|------|------|
| Apply new BamSignal DDL | `npm run migrate` |
| Fix CLI history bookkeeping | `supabase migration repair` (future, approved) |
| Reconstruct missing files | Git restore (done in Sprint 1.1) |
| Remove contamination tables | Explicit DROP plan — **not** migrate |

---

## Related audits

- `audit/BAMSIGNAL_RECOVERY_MASTER_REPORT.md`
- `audit/migration-crosswalk.md`
- `audit/production-dependencies.md`
