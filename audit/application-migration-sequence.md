# Application Migration Sequence Audit

**Sprint:** 1.1 (READ ONLY + repository reconstruction docs)  
**Date:** 2026-07-21  
**Track:** `migrations/` → `npm run migrate` → `public.schema_migrations`  
**Project:** `nswiwxmavuqpuzlsascs`

---

## Summary

| Metric | Value |
|--------|------:|
| Files on disk | 30 |
| Applied IDs live | 46 |
| Contiguous expected range | `0001`–`0054` |
| Missing numbers (no file) | **24** (`0022`–`0037`, `0040`–`0047`) |
| Applied but missing files | **16** (`0022`–`0037`) |
| Gap never applied / never filed | **8** (`0040`–`0047`) |
| Duplicate numbers on disk | **0** |

---

## Existing (on disk)

| # | Filename | Introduced | Author | Commit subject |
|---|----------|------------|--------|----------------|
| 0001 | `0001_schema_migrations.sql` | 2026-06-21 | bamsignalhq | `64e0adb` Move runtime schema mutations into migrations… |
| 0002 | `0002_baseline_bamsignal_schema.sql` | 2026-06-21 | bamsignalhq | `64e0adb` |
| 0003 | `0003_rate_limit_retention_indexes.sql` | 2026-06-21 | bamsignalhq | `7a4654f` |
| 0004 | `0004_signal_concierge_persistence.sql` | 2026-06-22 | bamsignalhq | `10d3fca` |
| 0005 | `0005_workforce_management.sql` | 2026-06-25 | bamsignalhq | `05b11e7` |
| 0006 | `0006_institutional_governance.sql` | 2026-06-25 | bamsignalhq | `8a64327` |
| 0007 | `0007_business_continuity.sql` | 2026-06-25 | bamsignalhq | `4f9e4b9` |
| 0008 | `0008_finance_operations.sql` | 2026-06-25 | bamsignalhq | `2225c70` |
| 0009 | `0009_document_center.sql` | 2026-06-25 | bamsignalhq | `5d14f10` |
| 0010 | `0010_consultant_quality.sql` | 2026-06-25 | bamsignalhq | `c0b26fd` |
| 0011 | `0011_configuration_platform.sql` | 2026-06-25 | bamsignalhq | `000648c` |
| 0012 | `0012_monitoring_center.sql` | 2026-06-25 | bamsignalhq | `abea3aa` |
| 0013 | `0013_data_governance_center.sql` | 2026-06-25 | bamsignalhq | `3774187` |
| 0014 | `0014_api_platform.sql` | 2026-06-25 | bamsignalhq | `014cb4b` |
| 0015 | `0015_disaster_recovery_center.sql` | 2026-06-25 | bamsignalhq | `4f1253c` |
| 0016 | `0016_launch_control_center.sql` | 2026-06-25 | bamsignalhq | `346f7c4` |
| 0017 | `0017_performance_center.sql` | 2026-06-25 | bamsignalhq | `1e3382d` |
| 0018 | `0018_workflow_engine.sql` | 2026-06-25 | bamsignalhq | `0f6555e` |
| 0019 | `0019_reporting_center.sql` | 2026-06-25 | bamsignalhq | `c9dedee` |
| 0020 | `0020_institutional_readiness_verification.sql` | 2026-06-25 | bamsignalhq | `39c8a6b` |
| 0021 | `0021_feature_flag_platform.sql` | 2026-06-26 | bamsignalhq | `af251e7` |
| 0038 | `0038_member_boost_entitlements.sql` | 2026-07-04 | bamsignalhq | `be21009` |
| 0039 | `0039_boost_activation_integrity.sql` | 2026-07-04 | bamsignalhq | `948d080` |
| 0048 | `0048_member_blocks.sql` | 2026-07-19 | bamsignalhq | `89a11fb` |
| 0049 | `0049_national_verification.sql` | 2026-07-19 | bamsignalhq | `d702657` |
| 0050 | `0050_experience_membership_billing.sql` | 2026-07-19 | bamsignalhq | `d6e5cbe` |
| 0051 | `0051_discreet_visibility_policy.sql` | 2026-07-19 | bamsignalhq | `d6e5cbe` |
| 0052 | `0052_membership_commerce_events.sql` | 2026-07-19 | bamsignalhq | `d6e5cbe` |
| 0053 | `0053_concierge_operations.sql` | 2026-07-19 | bamsignalhq | `d6e5cbe` |
| 0054 | `0054_discover_conversation_unlock.sql` | 2026-07-19 | bamsignalhq | `ccbd33a` |

All 30 on-disk IDs are present in live `public.schema_migrations`.

---

## Missing

### A. Applied live, no file in `migrations/` (`0022`–`0037`)

| Applied ID | Classification | Reconstructible? | Evidence |
|------------|----------------|------------------|----------|
| `0022_row_level_security_hardening` | **Never committed** to branch history; dangling blob only | **Yes** (blob `b4f9c61e`) | `git rev-list --all --objects`; not in any proper tree until local snapshot `331e265` (2026-07-21 untracked snapshot) |
| `0023_fix_security_definer_views` | **Never committed** as numbered app file | **Yes** via CLI mirror | SQL in `supabase/migrations/202606151800_*.sql` (`eda4812`) |
| `0024_fix_function_security` | Never committed as numbered app file | **Yes** | `202606152000_*` (`70f58dc`) |
| `0025_payment_fulfillment_processing` | Never committed as numbered app file | **Yes** | `202606211300_*` (`8472c44`) |
| `0026_platform_health_center` | Never committed as numbered app file | **Yes** | `202606259000_*` (`b3e64fc`) — commit shipped CLI SQL + UI only |
| `0027_abuse_protection_center` | Never committed as numbered app file | **Yes** | `202606259100_*` (`f3ed220`) |
| `0028_notification_center` | Never committed as numbered app file | **Yes** | `202606261100_*` (`fd0986c`) |
| `0029_search_center` | Never committed as numbered app file | **Yes** | `202606261200_*` (`b4685eb`) |
| `0030_disaster_recovery_operations` | Never committed as numbered app file | **Yes** | `202606261300_*` (`25e5f01`) — note name differs from `0015` |
| `0031_data_governance_privacy_center` | Never committed as numbered app file | **Yes** | `202606261400_*` (`d9fba91`) |
| `0032_launch_command_center` | Never committed as numbered app file | **Yes** | `202606261500_*` (`25fd2ae`) |
| `0033_quality_assurance_center` | Never committed as numbered app file | **Yes** | `202606261600_*` (`d4e6a3d`) |
| `0034_security_operations_center` | Never committed as numbered app file | **Yes** | `202606261700_*` (`379cf9b`) |
| `0035_performance_engineering_center` | Never committed as numbered app file | **Yes** | `202606261800_*` (`ed64eb0`) |
| `0036_enterprise_api_center` | Never committed as numbered app file | **Yes** | `202606261900_*` (`f0e778c`) |
| `0037_institutional_readiness_audit` | Never committed as numbered app file | **Yes** | `202606262000_*` (`dc6a303`) |

**Deleted?** No. `git log --all --diff-filter=D -- migrations/` shows **no** deletes of `0022`–`0037`.

**Renamed?** No numbered → numbered rename in git history. Content was authored under `supabase/migrations/202606*` and applied under temporary / uncommitted `migrations/00NN_*` names (runner uses filename stem as `schema_migrations.id`).

**Merged?** Not merged into another numbered file. Parallel mirrors for `0005`–`0021` are byte-identical dual copies (see crosswalk), not merges of `0022`–`0037`.

**Never committed?** **Yes** — for all 16 as `migrations/00NN_*.sql` paths in reachable branch history. Only `0022` exists as an orphan/untracked snapshot blob.

### B. Numbering gap never applied (`0040`–`0047`)

| Numbers | Live applied? | File ever in git? | Classification |
|---------|---------------|-------------------|----------------|
| 0040–0047 | **No** | **No** | Intentional skip / reserved block — sequence jumped `0039` → `0048` at F&F launch (`89a11fb`) |

These are **not** recoverable content gaps; they are unused IDs.

---

## Duplicate

| Check | Result |
|-------|--------|
| Duplicate numeric prefixes on disk | None |
| Duplicate applied IDs live | None observed |
| Same logical name, two app files | None |

---

## Renamed

No evidence of `git mv` from `migrations/0022…0037` to another path. Equivalent content for `0023`–`0037` lives under **different path namespace** (`supabase/migrations/`) with timestamp prefixes — parallel track, not rename.

Special case:

| App ID | Logical name on CLI | Notes |
|--------|---------------------|-------|
| `0030_disaster_recovery_operations` | `202606261300_disaster_recovery_center` | Applied ID uses `_operations`; CLI filename reuses `_center` (collides semantically with `0015` / `202606252900`) |

---

## Merged

| Pair | Status |
|------|--------|
| `0005`–`0021` ↔ matching `20260625*` / `202606258000` | **Dual identical copies** (not merged): SHA-256 match for all 17 parallel institutional files vs their CLI twins (except `0015` vs later `202606261300`, which is a **different** migration → maps to `0030`) |
| Baseline `0002` vs early CLI security/payment files | Baseline already contains `saved_profiles` / `signup_provisioning_attempts`; CLI `202606211200` / `202606211430` are additive/hardening that were never given app numbers |

---

## Sequence diagram (numbers only)

```
0001──0002──…──0021──[0022…0037 MISSING FILES]──0038──0039──[0040…0047 UNUSED]──0048──…──0054
         ▲                         ▲                              ▲
    on disk + live           live only (SQL mostly in CLI)   never filed / never applied
```

---

## Verdict for Phase 1

1. The app track is **not contiguous on disk**.
2. Gaps `0022`–`0037` are **genuine missing files** that were applied in production.
3. Gaps `0040`–`0047` are **unused numbers**, not lost SQL.
4. Classification of `0022`–`0037`: **never committed** as numbered app migrations (not deleted, not renamed in-tree).
