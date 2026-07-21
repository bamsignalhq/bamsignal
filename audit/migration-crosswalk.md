# Migration Crosswalk — App ↔ CLI ↔ Production

**Sprint:** 1.1  
**Date:** 2026-07-21  
**Sources:** `migrations/`, `supabase/migrations/`, live `schema_migrations`, live table inventory (Sprint 1.0)

---

## Legend

| Column | Meaning |
|--------|---------|
| Application | `migrations/<id>.sql` stem / live `schema_migrations.id` |
| CLI | `supabase/migrations/<version>_<name>.sql` |
| Objects | Primary `CREATE TABLE` targets (abbrev. for large baselines) |
| Equivalent | Whether SQL content is the same logical migration |
| Missing | What is missing where |
| Confidence | Evidence strength |

---

## Crosswalk table

| Application | CLI | Objects (primary) | Equivalent | Missing | Confidence |
|-------------|-----|-------------------|------------|---------|------------|
| `0001_schema_migrations` | — | `schema_migrations` | App-only | CLI | high |
| `0002_baseline_bamsignal_schema` | — | Core member schema (~40 tables: `app_users`, `app_member_profiles`, payments, …) | App-only baseline | CLI has no baseline dump | high |
| `0003_rate_limit_retention_indexes` | — | Indexes only | App-only | CLI | high |
| `0004_signal_concierge_persistence` | — | `concierge_*` (12) | App-only | CLI | high |
| `0005_workforce_management` | `202606251200_workforce_management` | Workforce tables | **Byte-identical** | Neither (both present) | high |
| `0006_institutional_governance` | `202606251400_institutional_governance` | Governance tables | **Byte-identical** | Neither | high |
| `0007_business_continuity` | `202606251600_business_continuity` | BC tables | **Byte-identical** | Neither | high |
| `0008_finance_operations` | `202606251800_finance_operations` | Finance tables | **Byte-identical** | Neither | high |
| `0009_document_center` | `202606252000_document_center` | Document tables | **Byte-identical** | Neither | high |
| `0010_consultant_quality` | `202606252200_consultant_quality` | Consultant QA tables | **Byte-identical** | Neither | high |
| `0011_configuration_platform` | `202606252400_configuration_platform` | Config tables | **Byte-identical** | Neither | high |
| `0012_monitoring_center` | `202606252600_monitoring_center` | Monitoring tables | **Byte-identical** | Neither | high |
| `0013_data_governance_center` | `202606252700_data_governance_center` | Data gov tables | **Byte-identical** | Neither | high |
| `0014_api_platform` | `202606252800_api_platform` | API platform tables | **Byte-identical** | Neither | high |
| `0015_disaster_recovery_center` | `202606252900_disaster_recovery_center` | DR center v1 | **Byte-identical** | Neither | high |
| `0016_launch_control_center` | `202606253000_launch_control_center` | Launch control | **Byte-identical** | Neither | high |
| `0017_performance_center` | `202606254000_performance_center` | Performance | **Byte-identical** | Neither | high |
| `0018_workflow_engine` | `202606255000_workflow_engine` | Workflow | **Byte-identical** | Neither | high |
| `0019_reporting_center` | `202606256000_reporting_center` | Reporting | **Byte-identical** | Neither | high |
| `0020_institutional_readiness_verification` | `202606257000_institutional_readiness_verification` | Readiness verify | **Byte-identical** | Neither | high |
| `0021_feature_flag_platform` | `202606258000_feature_flag_platform` | Feature flags | **Byte-identical** | Neither | high |
| `0022_row_level_security_hardening` | — | Enables RLS on all public tables except `schema_migrations` | No CLI twin | **App file missing**; blob recoverable | high (content), medium (apply path) |
| `0023_fix_security_definer_views` | `202606151800_fix_security_definer_views` | View `security_invoker` | Name-mapped | **App file missing** | high |
| `0024_fix_function_security` | `202606152000_fix_function_security` | Function search_path hardening | Name-mapped | **App file missing** | high |
| `0025_payment_fulfillment_processing` | `202606211300_payment_fulfillment_processing` | Payment fulfillment processing | Name-mapped | **App file missing** | high |
| `0026_platform_health_center` | `202606259000_platform_health_center` | `platform_health_*` | Name-mapped | **App file missing** | high |
| `0027_abuse_protection_center` | `202606259100_abuse_protection_center` | `abuse_*` | Name-mapped | **App file missing** | high |
| `0028_notification_center` | `202606261100_notification_center` | `notification_*` (center) | Name-mapped | **App file missing** | high |
| `0029_search_center` | `202606261200_search_center` | `search_*` | Name-mapped | **App file missing** | high |
| `0030_disaster_recovery_operations` | `202606261300_disaster_recovery_center` | `disaster_recovery_operations`, plans, reports, monitors | Name-mapped (filename collision with 0015) | **App file missing** | high |
| `0031_data_governance_privacy_center` | `202606261400_data_governance_privacy_center` | `legal_holds`, `governance_audit_log`, `audit_exports` | Name-mapped | **App file missing** | high |
| `0032_launch_command_center` | `202606261500_launch_command_center` | `launch_command_*` | Name-mapped | **App file missing** | high |
| `0033_quality_assurance_center` | `202606261600_quality_assurance_center` | `qa_*` | Name-mapped | **App file missing** | high |
| `0034_security_operations_center` | `202606261700_security_operations_center` | `security_ops_*` | Name-mapped | **App file missing** | high |
| `0035_performance_engineering_center` | `202606261800_performance_engineering_center` | `performance_*` eng | Name-mapped | **App file missing** | high |
| `0036_enterprise_api_center` | `202606261900_enterprise_api_center` | `enterprise_api_*` | Name-mapped | **App file missing** | high |
| `0037_institutional_readiness_audit` | `202606262000_institutional_readiness_audit` | `readiness_audit_*`, trends | Name-mapped | **App file missing** | high |
| `0038_member_boost_entitlements` | — | Boost entitlements | App-only | CLI | high |
| `0039_boost_activation_integrity` | — | Boost integrity | App-only | CLI | high |
| `0040`–`0047` | — | — | Unused numbers | Never filed / never applied | high |
| `0048_member_blocks` | — | Member blocks | App-only | CLI | high |
| `0049_national_verification` | — | National verification | App-only | CLI | high |
| `0050_experience_membership_billing` | — | Experience billing | App-only | CLI | high |
| `0051_discreet_visibility_policy` | — | Discreet visibility | App-only | CLI | high |
| `0052_membership_commerce_events` | — | Commerce events | App-only | CLI | high |
| `0053_concierge_operations` | — | Concierge ops | App-only | CLI | high |
| `0054_discover_conversation_unlock` | — | Discover unlock | App-only | CLI | high |

---

## CLI-only files (no app number)

| CLI | Objects / purpose | Live? | App equivalent | Confidence |
|-----|-------------------|-------|----------------|------------|
| `202606211200_saved_profiles` | Likely alter/index on `saved_profiles` | Objects in baseline `0002` | Absorbed into baseline / no separate app ID | medium |
| `202606211430_signup_provisioning_recovery` | Signup recovery hardening | Table in `0002` | No separate app ID | medium |

Neither appears in `public.schema_migrations`. They were never recorded on the app track; effects may already be in `0002` or applied only via ad-hoc / CLI (CLI remote history does **not** list these versions).

---

## Remote-only CLI versions (no local file, not in app track)

| Remote CLI version | Likely production objects | App migration | Confidence |
|--------------------|---------------------------|---------------|------------|
| `202604130001`–`202604140004` | Legacy sports/betting tables (`fixtures`, `tips`, `daily_games`, `users`, `matches`, `signals`, …) | None | medium–high |
| `20260627123631`–`20260627152446` | Twelve `stankings_*` tables + functions/policies | None (wrong-project apply) | high |

---

## Production object coverage (table-level)

| Bucket | Count | Covered by |
|--------|------:|------------|
| Created by current app files | ~179 CREATE TABLE statements | `0001`–`0021`, `0038`–`0039`, `0048`–`0054` |
| Created by missing app IDs / CLI SQL | ~48 | `0022`–`0037` ↔ CLI Jun 15–26 |
| Legacy (neither track) | ~20 | Remote April CLI |
| Stankings contamination | 12 | Remote Jun 27 CLI / Stankings repo |

**MISSING from live among current track CREATE TABLEs:** 0 (Sprint 1.0).

---

## Notes on “Equivalent”

- **Byte-identical** = SHA-256 of app file equals CLI file (verified 2026-07-21).
- **Name-mapped** = applied app ID string matches logical suffix of CLI file; SQL lives only under CLI path today; not byte-compared to a missing app file (file absent).
- `0015` (`202606252900`) ≠ `0030` (`202606261300`) — different SQL; do not treat as duplicates.
