# Metadata Repair Plan — Supabase CLI

**Sprint:** 2.0 — PLAN ONLY — **DO NOT EXECUTE**  
**Date:** 2026-07-21

---

## Is `supabase migration repair` required?

# **No — NOT REQUIRED** for BamSignal production correctness.

| Reason | Evidence |
|--------|----------|
| Canonical apply path is app track | 46 files ↔ 46 `schema_migrations` |
| Coolify / migrate / startup use `migrations/` | `package.json`, `startupMigrations.js` |
| CLI folder is demoted archive | `audit/CANONICAL_DATABASE_ARCHITECTURE.md` |
| `db push` already forbidden | Guardrails + divergence |

Repair would only make `supabase migration list` look cleaner. It does **not** fix application schema (already aligned).

---

## If leadership still wants optional CLI hygiene later

Treat as **optional bookkeeping**, never as schema migration.

### Preconditions

1. Backup BamSignal Supabase project.
2. `npm run verify:supabase-project -- --require-linked` PASS.
3. Written approval that CLI remains non-authoritative after repair.
4. Docker dump optional but recommended for peace of mind.
5. Operator understands `repair` does not DROP objects.

### Recommended optional procedure (DO NOT RUN NOW)

**Goal:** Mark the 34 local-only CLI versions as `applied` so they stop appearing as “pending push” candidates.

```bash
npm run verify:supabase-project -- --require-linked

# Example shape — repeat for each local-only version from migration list:
npx supabase migration repair --status applied 202606151800
npx supabase migration repair --status applied 202606152000
npx supabase migration repair --status applied 202606211200
npx supabase migration repair --status applied 202606211300
npx supabase migration repair --status applied 202606211430
npx supabase migration repair --status applied 202606251200
npx supabase migration repair --status applied 202606251400
npx supabase migration repair --status applied 202606251600
npx supabase migration repair --status applied 202606251800
npx supabase migration repair --status applied 202606252000
npx supabase migration repair --status applied 202606252200
npx supabase migration repair --status applied 202606252400
npx supabase migration repair --status applied 202606252600
npx supabase migration repair --status applied 202606252700
npx supabase migration repair --status applied 202606252800
npx supabase migration repair --status applied 202606252900
npx supabase migration repair --status applied 202606253000
npx supabase migration repair --status applied 202606254000
npx supabase migration repair --status applied 202606255000
npx supabase migration repair --status applied 202606256000
npx supabase migration repair --status applied 202606257000
npx supabase migration repair --status applied 202606258000
npx supabase migration repair --status applied 202606259000
npx supabase migration repair --status applied 202606259100
npx supabase migration repair --status applied 202606261100
npx supabase migration repair --status applied 202606261200
npx supabase migration repair --status applied 202606261300
npx supabase migration repair --status applied 202606261400
npx supabase migration repair --status applied 202606261500
npx supabase migration repair --status applied 202606261600
npx supabase migration repair --status applied 202606261700
npx supabase migration repair --status applied 202606261800
npx supabase migration repair --status applied 202606261900
npx supabase migration repair --status applied 202606262000

npx supabase migration list
```

**Expected output:** Those 34 versions show as present on remote + local (synced).  
**Still remote-only:** April legacy + June 27 Stankings (10 versions) — **leave as historical remote entries** (truthful: they were applied; objects may still exist).

### Do NOT

```bash
# Dangerous while objects still exist / unclear ownership:
npx supabase migration repair --status reverted 20260627123631
# …without an explicit DROP/archive plan

npx supabase db push   # FORBIDDEN
```

Marking remote Stankings/legacy versions `reverted` while tables remain can encourage a later push to re-apply them.

### Rollback of optional repair

Re-run `migration repair --status reverted <version>` for each version marked `applied` in error (metadata only). Does not undo DDL.

---

## Preferred long-term stance

**Leave CLI history diverged; never use CLI as BamSignal schema write path.**  
Document remote orphans in `audit/`. Optionally move `supabase/migrations/` to `supabase/migrations/_archive/` in a future docs/chore PR (not required for Sprint 2.0).

---

## Relation to Auth trigger

Orthogonal. Trigger retirement uses **app** `migrations/NNNN_*.sql` via `npm run migrate`, not CLI repair.
