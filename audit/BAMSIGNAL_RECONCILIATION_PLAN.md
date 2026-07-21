# BamSignal Migration Reconciliation Plan

**Status:** DRAFT — awaiting approval  
**Mode:** Plan only — **DO NOT EXECUTE** repair / push / reset / up  
**Generated:** 2026-07-21  
**Project:** `nswiwxmavuqpuzlsascs` (`bamsignalhq/bamsignal`)

---

## Current state

| Fact | Evidence |
|------|----------|
| Identity linked correctly | `npm run verify:supabase-project -- --require-linked` → **PASS** |
| Dual migration tracks | `migrations/` (30 files) + `supabase/migrations/` (34 files) |
| App runner history | `public.schema_migrations` = **46** applied IDs |
| CLI history | `supabase_migrations.schema_migrations` = **10** versions |
| CLI local↔remote sync | **0** synced, **10** remote-only, **34** local-only |
| Live public tables | **259** |
| Full `pg_dump` DDL | **Unavailable** (Docker not installed; dump failed) |

### Authoritative production path (evidence)

Production schema was primarily produced by the **app track** (`migrations/` + `npm run migrate` / startup migrations):

1. All 30 current `migrations/*.sql` IDs appear in `public.schema_migrations`.
2. Additional IDs `0022`–`0037` appear as applied in `public.schema_migrations` but **are not present as files** in the current `migrations/` directory.
3. Tables created by SQL that still lives under `supabase/migrations/` (platform centers, security fixes) exist live and align with those applied IDs.
4. Supabase CLI history contains only 10 versions and has **never** recorded the 34 local CLI files.

**Classification:** **C — mixed**, with **`migrations/` / `schema_migrations` as the operational authority**, plus unrecovered remote-only CLI entries (April legacy + June 27 `stankings_*`).

---

## Canonical migration system recommendation

**Keep `migrations/` + `npm run migrate` (and `server/startupMigrations.js`) as the sole write path for BamSignal schema changes.**

| Option | Recommendation |
|--------|----------------|
| A. `migrations/` | **Canonical for future applies** |
| B. `supabase/migrations/` | **Demote to archive / mirror only** — do not `db push` |
| Dual unmanaged tracks | **Forbidden** going forward |

Rationale:

- Coolify/production already uses app migrations.
- Live `schema_migrations` matches that system.
- CLI history is incomplete and diverged; adopting CLI without repair would risk re-applying DDL.

---

## Exact reconciliation steps (approved execution only)

### Phase R0 — Preconditions

1. Snapshot / backup BamSignal Supabase project (dashboard backup).
2. Confirm identity: `npm run verify:supabase-project -- --require-linked`.
3. On a machine **with Docker Desktop**, produce full DDL:

```bash
supabase db dump --linked --schema public,auth,storage --file audit/live_schema.full.sql
```

4. Re-run column-level diff against both tracks; update `audit/schema-diff.md`.

### Phase R1 — Recover missing app-track files (repo hygiene)

Restore or recreate numbered files for applied-but-missing IDs:

| Applied ID (live) | Likely SQL source (repo) |
|-------------------|--------------------------|
| `0022_row_level_security_hardening` | Not found as file — recover from backup/git elsewhere or regenerate from live policies |
| `0023_fix_security_definer_views` | `supabase/migrations/202606151800_fix_security_definer_views.sql` |
| `0024_fix_function_security` | `supabase/migrations/202606152000_fix_function_security.sql` |
| `0025_payment_fulfillment_processing` | `supabase/migrations/202606211300_payment_fulfillment_processing.sql` |
| `0026_platform_health_center` | `supabase/migrations/202606259000_platform_health_center.sql` |
| `0027_abuse_protection_center` | `supabase/migrations/202606259100_abuse_protection_center.sql` |
| `0028_notification_center` | `supabase/migrations/202606261100_notification_center.sql` |
| `0029_search_center` | `supabase/migrations/202606261200_search_center.sql` |
| `0030_disaster_recovery_operations` | `supabase/migrations/202606261300_disaster_recovery_center.sql` |
| `0031_data_governance_privacy_center` | `supabase/migrations/202606261400_data_governance_privacy_center.sql` |
| `0032_launch_command_center` | `supabase/migrations/202606261500_launch_command_center.sql` |
| `0033_quality_assurance_center` | `supabase/migrations/202606261600_quality_assurance_center.sql` |
| `0034_security_operations_center` | `supabase/migrations/202606261700_security_operations_center.sql` |
| `0035_performance_engineering_center` | `supabase/migrations/202606261800_performance_engineering_center.sql` |
| `0036_enterprise_api_center` | `supabase/migrations/202606261900_enterprise_api_center.sql` |
| `0037_institutional_readiness_audit` | `supabase/migrations/202606262000_institutional_readiness_audit.sql` |

Action: copy SQL into `migrations/00NN_….sql` matching applied IDs (content restore only — **do not re-run**). Verify filenames match `schema_migrations.id` exactly.

### Phase R2 — Document remote-only CLI artifacts

| Remote version | Likely objects | Action |
|----------------|----------------|--------|
| `202604130001`–`202604140004` | Legacy tables (`fixtures`, `tips`, `daily_games`, `users`, `matches`, `signals`, …) | Export SQL from dashboard if available; archive under `audit/remote-archive/`; **do not delete live tables** without product decision |
| `20260627123631`–`20260627152446` | `stankings_*` tables in BamSignal DB | Confirm intent (contamination vs intentional). Archive SQL. Product decision: keep, migrate out, or drop |

### Phase R3 — CLI history policy (only after R0–R2)

**Preferred:** Leave CLI history as-is. Stop using `supabase db push` for BamSignal. Treat `supabase/migrations/` as non-authoritative archive.

**If** leadership insists CLI history must match local files, repair is a **bookkeeping** operation only after confirming no DDL would re-run. Proposed (NOT EXECUTED):

```bash
# ONLY AFTER APPROVAL + BACKUP + full DDL verification
# Mark remote-only versions as reverted OR document as intentional orphans.
# Mark local-only versions as applied ONLY if schema already contains their objects.

# Example shape (DO NOT RUN NOW):
# supabase migration repair --status reverted 202604130001
# … repeat for each remote-only after archival …
# supabase migration repair --status applied 202606151800
# … repeat for each local-only after proving objects exist …
```

Exact repair command list must be regenerated after R0 full dump and R1 file restore — **do not execute the examples above**.

### Phase R4 — Process freeze

1. Update `CONTRIBUTING.md` / `DATABASE_ARCHITECTURE.md`: BamSignal schema changes go only through `migrations/` + `npm run migrate`.
2. Keep `verify:supabase-project` guard.
3. Optionally add CI check: fail if `supabase/migrations/` gains files without matching `migrations/` entry.

---

## Rollback strategy

| Step | Rollback |
|------|----------|
| Repo file restore (R1) | `git revert` / delete restored files — no DB impact |
| CLI `migration repair` (R3) | Re-repair opposite status; history-only — no schema change if done correctly |
| Accidental `db push` | Restore from Supabase backup snapshot taken in R0; do not attempt ad-hoc DROP |
| Accidental table drop of legacy/`stankings_*` | Restore from backup only |

---

## Risk assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| `db push` of 34 local CLI files | **Critical** | Many objects already exist → errors / partial applies |
| Repair without full DDL | **High** | Obtain Docker dump first |
| Dropping legacy/`stankings_*` without product OK | **High** | Explicit decision gate |
| Leaving dual tracks | **Medium** | Future engineers will push wrong track |
| Missing `0022` SQL content | **Medium** | May need live policy dump to recreate |

---

## Is migration repair required?

**Not required for production correctness.**  
The live schema is already serving production via the app track.

**Repair is optional bookkeeping** only if the team wants Supabase CLI history to stop looking divergent. Prefer **documentation + demotion of CLI track** over repair.

If repair is later approved: it is **history metadata only**, after backup and full DDL verification — never as the first action.

---

## Forbidden until approval

```text
supabase db push
supabase migration repair
supabase migration up
supabase db reset
supabase db pull
```
