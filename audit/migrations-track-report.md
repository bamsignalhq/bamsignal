# BamSignal Migration Track Report

Generated: 2026-07-21T15:18:05.787Z
Project: `nswiwxmavuqpuzlsascs`
Mode: READ-ONLY forensic inventory

## Summary

| Track | Path | File count | Tracking table |
|-------|------|------------|----------------|
| App | `migrations/` | 30 | `schema_migrations` (via `npm run migrate`) |
| Supabase CLI | `supabase/migrations/` | 34 | `supabase_migrations.schema_migrations` |

## CLI history vs local (from `supabase migration list`)

| Category | Count |
|----------|------:|
| Synced (local + remote) | 0 |
| Remote-only | 10 |
| Local-only | 34 |

### Remote-only versions

- `202604130001`
- `202604130002`
- `202604140001`
- `202604140002`
- `202604140003`
- `202604140004`
- `20260627123631`
- `20260627144349`
- `20260627144405`
- `20260627152446`

### Local-only versions (CLI files not recorded remotely)

- `202606151800`
- `202606152000`
- `202606211200`
- `202606211300`
- `202606211430`
- `202606251200`
- `202606251400`
- `202606251600`
- `202606251800`
- `202606252000`
- `202606252200`
- `202606252400`
- `202606252600`
- `202606252700`
- `202606252800`
- `202606252900`
- `202606253000`
- `202606254000`
- `202606255000`
- `202606256000`
- `202606257000`
- `202606258000`
- `202606259000`
- `202606259100`
- `202606261100`
- `202606261200`
- `202606261300`
- `202606261400`
- `202606261500`
- `202606261600`
- `202606261700`
- `202606261800`
- `202606261900`
- `202606262000`

## App track (`migrations/`) — inventory

| # | File |
|---|------|
| 1 | `0001_schema_migrations.sql` |
| 2 | `0002_baseline_bamsignal_schema.sql` |
| 3 | `0003_rate_limit_retention_indexes.sql` |
| 4 | `0004_signal_concierge_persistence.sql` |
| 5 | `0005_workforce_management.sql` |
| 6 | `0006_institutional_governance.sql` |
| 7 | `0007_business_continuity.sql` |
| 8 | `0008_finance_operations.sql` |
| 9 | `0009_document_center.sql` |
| 10 | `0010_consultant_quality.sql` |
| 11 | `0011_configuration_platform.sql` |
| 12 | `0012_monitoring_center.sql` |
| 13 | `0013_data_governance_center.sql` |
| 14 | `0014_api_platform.sql` |
| 15 | `0015_disaster_recovery_center.sql` |
| 16 | `0016_launch_control_center.sql` |
| 17 | `0017_performance_center.sql` |
| 18 | `0018_workflow_engine.sql` |
| 19 | `0019_reporting_center.sql` |
| 20 | `0020_institutional_readiness_verification.sql` |
| 21 | `0021_feature_flag_platform.sql` |
| 22 | `0038_member_boost_entitlements.sql` |
| 23 | `0039_boost_activation_integrity.sql` |
| 24 | `0048_member_blocks.sql` |
| 25 | `0049_national_verification.sql` |
| 26 | `0050_experience_membership_billing.sql` |
| 27 | `0051_discreet_visibility_policy.sql` |
| 28 | `0052_membership_commerce_events.sql` |
| 29 | `0053_concierge_operations.sql` |
| 30 | `0054_discover_conversation_unlock.sql` |

## Supabase CLI track (`supabase/migrations/`) — inventory

| # | File |
|---|------|
| 1 | `202606151800_fix_security_definer_views.sql` |
| 2 | `202606152000_fix_function_security.sql` |
| 3 | `202606211200_saved_profiles.sql` |
| 4 | `202606211300_payment_fulfillment_processing.sql` |
| 5 | `202606211430_signup_provisioning_recovery.sql` |
| 6 | `202606251200_workforce_management.sql` |
| 7 | `202606251400_institutional_governance.sql` |
| 8 | `202606251600_business_continuity.sql` |
| 9 | `202606251800_finance_operations.sql` |
| 10 | `202606252000_document_center.sql` |
| 11 | `202606252200_consultant_quality.sql` |
| 12 | `202606252400_configuration_platform.sql` |
| 13 | `202606252600_monitoring_center.sql` |
| 14 | `202606252700_data_governance_center.sql` |
| 15 | `202606252800_api_platform.sql` |
| 16 | `202606252900_disaster_recovery_center.sql` |
| 17 | `202606253000_launch_control_center.sql` |
| 18 | `202606254000_performance_center.sql` |
| 19 | `202606255000_workflow_engine.sql` |
| 20 | `202606256000_reporting_center.sql` |
| 21 | `202606257000_institutional_readiness_verification.sql` |
| 22 | `202606258000_feature_flag_platform.sql` |
| 23 | `202606259000_platform_health_center.sql` |
| 24 | `202606259100_abuse_protection_center.sql` |
| 25 | `202606261100_notification_center.sql` |
| 26 | `202606261200_search_center.sql` |
| 27 | `202606261300_disaster_recovery_center.sql` |
| 28 | `202606261400_data_governance_privacy_center.sql` |
| 29 | `202606261500_launch_command_center.sql` |
| 30 | `202606261600_quality_assurance_center.sql` |
| 31 | `202606261700_security_operations_center.sql` |
| 32 | `202606261800_performance_engineering_center.sql` |
| 33 | `202606261900_enterprise_api_center.sql` |
| 34 | `202606262000_institutional_readiness_audit.sql` |

## Duplicate timestamps (CLI)

None.

## Logical name collisions / parallels

### Parallel (same logical suffix in both tracks) — 17

- `workforce_management`: `0005_workforce_management.sql` ↔ `202606251200_workforce_management.sql`
- `institutional_governance`: `0006_institutional_governance.sql` ↔ `202606251400_institutional_governance.sql`
- `business_continuity`: `0007_business_continuity.sql` ↔ `202606251600_business_continuity.sql`
- `finance_operations`: `0008_finance_operations.sql` ↔ `202606251800_finance_operations.sql`
- `document_center`: `0009_document_center.sql` ↔ `202606252000_document_center.sql`
- `consultant_quality`: `0010_consultant_quality.sql` ↔ `202606252200_consultant_quality.sql`
- `configuration_platform`: `0011_configuration_platform.sql` ↔ `202606252400_configuration_platform.sql`
- `monitoring_center`: `0012_monitoring_center.sql` ↔ `202606252600_monitoring_center.sql`
- `data_governance_center`: `0013_data_governance_center.sql` ↔ `202606252700_data_governance_center.sql`
- `api_platform`: `0014_api_platform.sql` ↔ `202606252800_api_platform.sql`
- `disaster_recovery_center`: `0015_disaster_recovery_center.sql` ↔ `202606261300_disaster_recovery_center.sql`
- `launch_control_center`: `0016_launch_control_center.sql` ↔ `202606253000_launch_control_center.sql`
- `performance_center`: `0017_performance_center.sql` ↔ `202606254000_performance_center.sql`
- `workflow_engine`: `0018_workflow_engine.sql` ↔ `202606255000_workflow_engine.sql`
- `reporting_center`: `0019_reporting_center.sql` ↔ `202606256000_reporting_center.sql`
- `institutional_readiness_verification`: `0020_institutional_readiness_verification.sql` ↔ `202606257000_institutional_readiness_verification.sql`
- `feature_flag_platform`: `0021_feature_flag_platform.sql` ↔ `202606258000_feature_flag_platform.sql`

### App-only (no CLI mirror) — 13

- `0001_schema_migrations.sql`
- `0002_baseline_bamsignal_schema.sql`
- `0003_rate_limit_retention_indexes.sql`
- `0004_signal_concierge_persistence.sql`
- `0038_member_boost_entitlements.sql`
- `0039_boost_activation_integrity.sql`
- `0048_member_blocks.sql`
- `0049_national_verification.sql`
- `0050_experience_membership_billing.sql`
- `0051_discreet_visibility_policy.sql`
- `0052_membership_commerce_events.sql`
- `0053_concierge_operations.sql`
- `0054_discover_conversation_unlock.sql`

### CLI-only (no app mirror) — 16

- `202606151800_fix_security_definer_views.sql`
- `202606152000_fix_function_security.sql`
- `202606211200_saved_profiles.sql`
- `202606211300_payment_fulfillment_processing.sql`
- `202606211430_signup_provisioning_recovery.sql`
- `202606259000_platform_health_center.sql`
- `202606259100_abuse_protection_center.sql`
- `202606261100_notification_center.sql`
- `202606261200_search_center.sql`
- `202606261400_data_governance_privacy_center.sql`
- `202606261500_launch_command_center.sql`
- `202606261600_quality_assurance_center.sql`
- `202606261700_security_operations_center.sql`
- `202606261800_performance_engineering_center.sql`
- `202606261900_enterprise_api_center.sql`
- `202606262000_institutional_readiness_audit.sql`

### Same logical name, multiple CLI files

- `202606252900_disaster_recovery_center.sql`
- `202606261300_disaster_recovery_center.sql`

## Timeline (evidence-based)

| Date | Event | Evidence |
|------|-------|----------|
| 2026-04-13/14 | Remote CLI versions recorded; no matching files in git | `supabase migration list` remote-only `202604*` |
| 2026-06-15 | First `supabase/migrations/` files committed (security linter) | git: `eda4812` `202606151800_*` |
| 2026-06-21 | App track created: baseline + migrate runner | git: `64e0adb` `migrations/0001`, `0002` |
| 2026-06-21–26 | Institutional centers mirrored into both tracks | file inventories |
| 2026-06-27 | Four remote-only CLI versions; no files in git | `20260627123631` … `20260627152446` |

## Missing versions

- Remote `202604130001`–`202604140004`: **missing from repository** (never in git history).
- Remote `20260627123631`–`20260627152446`: **missing from repository**.
- All 34 local CLI files: **missing from remote** `supabase_migrations` history.

## Conclusion (inventory only)

Complete divergence between CLI local files and remote CLI history (0 synced).
App track is a separate numbering system not visible to `supabase migration list`.

## Live `public.schema_migrations` vs disk (forensic)

Queried live (READ-ONLY): **46** applied IDs.

### Applied in production but missing from `migrations/` directory

- `0022_row_level_security_hardening`
- `0023_fix_security_definer_views`
- `0024_fix_function_security`
- `0025_payment_fulfillment_processing`
- `0026_platform_health_center`
- `0027_abuse_protection_center`
- `0028_notification_center`
- `0029_search_center`
- `0030_disaster_recovery_operations`
- `0031_data_governance_privacy_center`
- `0032_launch_command_center`
- `0033_quality_assurance_center`
- `0034_security_operations_center`
- `0035_performance_engineering_center`
- `0036_enterprise_api_center`
- `0037_institutional_readiness_audit`

### Local `migrations/` files not applied

None (all 30 on-disk files are applied).

### Live `supabase_migrations.schema_migrations`

Exactly the 10 remote-only versions from \`supabase migration list\` (no local CLI filenames).

