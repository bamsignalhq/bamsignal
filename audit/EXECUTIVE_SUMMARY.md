# BamSignal Migration Reconciliation — Executive Summary

**Sprint:** 1.0 (READ-ONLY)  
**Date:** 2026-07-21  
**Project:** `nswiwxmavuqpuzlsascs`  
**Repository:** `bamsignalhq/bamsignal`

---

## One-line verdict

Production is running on the **app migration track** (`migrations/` + `schema_migrations`); the Supabase CLI track is **historically diverged** and must not be pushed. Full column-level DDL comparison is incomplete because Docker-based dump failed.

---

## Evidence collected

| Deliverable | Status |
|-------------|--------|
| Identity verify (`--require-linked`) | **PASS** |
| `audit/migration-list.txt` | Complete (0 synced / 10 remote-only / 34 local-only) |
| `audit/migrations-track-report.md` | Complete |
| `audit/live_schema.sql` | **Inventory substitute** (not full `pg_dump`; Docker unavailable) |
| `audit/schema-diff.md` | Complete for tables; MODIFIED undetermined |
| `audit/BAMSIGNAL_RECONCILIATION_PLAN.md` | Draft plan — not executed |

---

## Key findings

1. **Canonical producer of today’s schema: mixed, dominated by `migrations/`.**  
   Live `public.schema_migrations` has **46** applied app IDs. CLI history has only **10** remote versions and records **none** of the 34 local `supabase/migrations/` files.

2. **April remote migrations (`202604*`)** align with **~20 legacy tables** (`fixtures`, `tips`, `daily_games`, `users`, `matches`, `signals`, …) that are **not** in either current BamSignal migration folder — consistent with an earlier product era on the same Supabase project.

3. **June 27 remote migrations (`20260627*`)** align with **12 `stankings_*` tables** present in BamSignal’s database but **absent from BamSignal git migration SQL** — consistent with ad-hoc applies (possible HQ contamination or intentional cross-app objects).

4. **App IDs `0022`–`0037` are applied in production** but **missing as files** under `migrations/`; equivalent SQL largely still exists under `supabase/migrations/` with different timestamps.

5. **No `CREATE TABLE` from either current track is missing live** (0 MISSING). Live is a **superset** of both tracks.

---

## Recommendation

- **Do not** run `supabase db push` or `migration repair` now.  
- Treat **`migrations/` as canonical** going forward.  
- Restore missing numbered files for documentation parity; archive remote-only SQL; decide product fate of legacy + `stankings_*` tables.  
- Re-obtain full `pg_dump` DDL when Docker is available before any history repair.

---

## Conclusion

**MORE EVIDENCE REQUIRED**

Full `supabase db dump` / `pg_dump --schema-only` DDL is still needed to classify column-level **MODIFIED** differences and to safely enumerate exact `migration repair` commands. Table-level evidence is sufficient to **forbid push/repair now**, but not sufficient to certify **SAFE TO REPAIR**.
