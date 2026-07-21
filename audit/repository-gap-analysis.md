# Repository Gap Analysis

**Sprint:** 1.1  
**Date:** 2026-07-21  
**Question:** Can missing application migrations `0022`–`0037` be reconstructed from the repository?

---

## Executive answer

| Gap | Reconstructible from repo? | Method |
|-----|----------------------------|--------|
| `0022` | **Yes** | Dangling git blob `b4f9c61e603c8fa3b04c33fcd85c7fe3f43582cf` |
| `0023`–`0037` | **Yes** | Copy/rename from `supabase/migrations/202606*.sql` |
| `0040`–`0047` | **N/A** | Never existed; unused numbers |
| April remote SQL | **No** (not in BamSignal git) | Needs dashboard export / `pg_dump` archival |
| June 27 remote / `stankings_*` | **Yes, but from Stankings repo** | `/Users/stanlex/Documents/stankings/supabase/migrations/202606271*.sql` — do **not** add to BamSignal app track |

---

## What SQL is missing from `migrations/`?

### Recoverable now (exact)

| Target filename | Source | Bytes | Notes |
|-----------------|--------|------:|-------|
| `0022_row_level_security_hardening.sql` | `git cat-file -p b4f9c61e` | 517 | RLS enable loop over all public tables except `schema_migrations` |
| `0023_fix_security_definer_views.sql` | `supabase/migrations/202606151800_fix_security_definer_views.sql` | 414 | |
| `0024_fix_function_security.sql` | `supabase/migrations/202606152000_fix_function_security.sql` | 1298 | |
| `0025_payment_fulfillment_processing.sql` | `supabase/migrations/202606211300_payment_fulfillment_processing.sql` | 904 | |
| `0026_platform_health_center.sql` | `supabase/migrations/202606259000_platform_health_center.sql` | 2348 | |
| `0027_abuse_protection_center.sql` | `supabase/migrations/202606259100_abuse_protection_center.sql` | 2675 | |
| `0028_notification_center.sql` | `supabase/migrations/202606261100_notification_center.sql` | 2336 | |
| `0029_search_center.sql` | `supabase/migrations/202606261200_search_center.sql` | 1300 | |
| `0030_disaster_recovery_operations.sql` | `supabase/migrations/202606261300_disaster_recovery_center.sql` | 1886 | **Keep applied ID name** `_operations` |
| `0031_data_governance_privacy_center.sql` | `supabase/migrations/202606261400_data_governance_privacy_center.sql` | 2355 | |
| `0032_launch_command_center.sql` | `supabase/migrations/202606261500_launch_command_center.sql` | 3152 | |
| `0033_quality_assurance_center.sql` | `supabase/migrations/202606261600_quality_assurance_center.sql` | 2988 | |
| `0034_security_operations_center.sql` | `supabase/migrations/202606261700_security_operations_center.sql` | 2907 | |
| `0035_performance_engineering_center.sql` | `supabase/migrations/202606261800_performance_engineering_center.sql` | 2002 | |
| `0036_enterprise_api_center.sql` | `supabase/migrations/202606261900_enterprise_api_center.sql` | 2594 | |
| `0037_institutional_readiness_audit.sql` | `supabase/migrations/202606262000_institutional_readiness_audit.sql` | 1960 | |

**Total:** 16 files. Content available without touching the database.

### Not missing as SQL (numbering only)

`0040`–`0047` — no SQL to reconstruct. Document as reserved/skipped in sequence docs only.

### Missing from BamSignal git (live objects exist)

| Artifact | Reconstruct from BamSignal git? | Alternative |
|----------|---------------------------------|-------------|
| April `202604*` migration SQL | **No** | Supabase dashboard history, backup, or reverse-engineer from live DDL dump |
| Exact CLI statements that created June 27 remote versions | **No** in BamSignal | Stankings migration files (canonical source of `stankings_*`) |

---

## Evidence that `0022`–`0037` were never deleted

```
git log --all --diff-filter=D -- migrations/
→ no deletes of 0022–0037

git rev-list --all --objects | rg 'migrations/00(2[2-9]|3[0-7])_'
→ only 0022 blob path (orphan/untracked snapshot), no 0023–0037 paths
```

Conclusion: **never committed** (as numbered app files), not deleted from history.

---

## Evidence that production already applied them

Live query (READ-ONLY): `schema_migrations` contains exactly:

`0022_row_level_security_hardening` … `0037_institutional_readiness_audit`

and does **not** contain `0040`–`0047`.

Table-level Sprint 1.0 diff: ~48 tables from those CLI SQL files exist live and are absent from current on-disk `migrations/` CREATE parse.

---

## Reconstruction procedure (documentation only — **do not run in Sprint 1.1**)

Intended for a future **repository hygiene** sprint (not schema apply):

1. Export blob `b4f9c61e` → `migrations/0022_row_level_security_hardening.sql`
2. For each `0023`–`0037`, copy CLI source to the exact applied ID filename
3. `git add` + commit with message stating **restore applied migration sources; do not re-run**
4. Verify: `ls migrations/` contiguous for applied set; `npm run migrate` is a **no-op** (all IDs already in `schema_migrations`)
5. Optionally demote `supabase/migrations/` to `supabase/migrations/_archive/` or stop adding new CLI files

**Do not** `supabase db push`, `migration repair`, or re-execute the SQL.

---

## Remaining repository incompleteness after file restore

Even after restoring `0022`–`0037` files, the repository is still incomplete as a **full** historical archive until:

1. April remote SQL is archived under `audit/remote-archive/` (or equivalent)
2. Stankings contamination is documented and product-owned (keep / migrate out / drop)
3. Full `pg_dump` DDL exists for column-level MODIFIED checks
4. Dual-track policy is written into CONTRIBUTING (CLI demoted)

---

## Gap analysis verdict

| Question | Answer |
|----------|--------|
| Are `0022`–`0037` genuinely missing? | **Yes** (as numbered files) |
| Can they be reconstructed? | **Yes** (all 16) |
| Is repository history internally complete today? | **No** |
| Blocker to file restore? | None technical — needs explicit “restore files only” sprint approval |
| Blocker to CLI history repair? | Yes — dual track + remote orphans + no full DDL dump |
