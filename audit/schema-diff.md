# BamSignal Schema Diff (READ-ONLY)

Generated: 2026-07-21T15:23:30.756Z
Project: `nswiwxmavuqpuzlsascs`

## Data sources

| Source | Method | Limitation |
|--------|--------|------------|
| Live schema | Supabase MCP `list_tables` + `execute_sql` (pg_catalog) | Full `pg_dump` DDL unavailable — Docker required for `supabase db dump` |
| App track | Parse `CREATE` statements in `migrations/*.sql` | 30 files on disk |
| CLI track | Parse `CREATE` statements in `supabase/migrations/*.sql` | 34 files on disk |

## Live object inventory

| Schema | Tables | Indexes | Views | Sequences |
|--------|-------:|--------:|------:|----------:|
| public | 259 | 671 | 4 | 1 |
| auth | 23 | 91 | — | 1 |
| storage | 8 | 17 | — | — |

**Extensions:** `uuid-ossp`, `pgcrypto`, `plpgsql`, `pg_stat_statements`, `supabase_vault`

**Storage buckets:** `cover-photos`, `profile-photos`

**Public views (all `security_invoker=true`):** `match_master`, `signals_vault`, `truth_evidence_feed`, `user_subscriptions`

---

## A. Live vs `migrations/` (app track)

| Classification | Count | Meaning |
|----------------|------:|---------|
| **MATCH** | undefined | Tables created by current `migrations/*.sql` and present live |
| **MISSING** (in track, not live) | 0 | Track defines table absent from live |
| **EXTRA** (live, not in current track SQL) | 80 | Live tables with no `CREATE TABLE` in current `migrations/` files |
| **MODIFIED** | unknown | Column-level comparison requires full DDL dump |

### MATCH

All undefined tables defined by current app-track SQL exist in production.

### MISSING

None. Every `CREATE TABLE` in current `migrations/` is present live.

### EXTRA (live-only relative to current `migrations/` SQL) — 80

#### Bucket 1 — Present in CLI track SQL (applied via removed/renumbered app IDs 0022–0037) — 48

These tables are created by SQL that still exists under `supabase/migrations/`, and corresponding IDs appear in live `public.schema_migrations` (`0022`–`0037`) **but those numbered files are not in the current `migrations/` directory**.

- `abuse_blocks`
- `abuse_forensics`
- `abuse_monitor_snapshots`
- `abuse_rate_limits`
- `abuse_reports`
- `audit_exports`
- `disaster_backup_monitors`
- `disaster_recovery_operations`
- `disaster_recovery_plans`
- `disaster_recovery_reports`
- `enterprise_api_endpoints`
- `enterprise_api_failed_jobs`
- `enterprise_api_operations_snapshots`
- `enterprise_api_tool_runs`
- `governance_audit_log`
- `launch_command_blockers`
- `launch_command_deployments`
- `launch_command_incidents`
- `launch_command_readiness_scores`
- `launch_command_section_snapshots`
- `legal_holds`
- `notification_audit_log`
- `notification_dead_letter`
- `notification_messages`
- `notification_templates`
- `performance_engineering_reports`
- `performance_tool_runs`
- `performance_track_snapshots`
- `platform_health_acknowledgements`
- `platform_health_alerts`
- `platform_health_incidents`
- `platform_health_snapshots`
- `qa_automated_test_runs`
- `qa_certification_records`
- `qa_certification_reports`
- `qa_manual_qa_runs`
- `qa_release_gates`
- `readiness_audit_domains`
- `readiness_audit_exports`
- `readiness_trend_snapshots`
- `search_index_snapshots`
- `search_recent_queries`
- `search_saved_queries`
- `security_ops_actions`
- `security_ops_events`
- `security_ops_incidents`
- `security_ops_scores`
- `security_ops_timeline`

#### Bucket 2 — Legacy / pre-dating-app tables (not in either current track) — 20

- `affiliate_logs`
- `daily_games`
- `fixtures`
- `global_settings`
- `matches`
- `notification_outbox`
- `payments`
- `predictions`
- `profiles`
- `public_ledger`
- `signals`
- `site_settings`
- `subscriptions`
- `system_settings`
- `tips`
- `transparency_ledger`
- `truth_ledger`
- `user_profiles`
- `users`
- `vip_payments`

Evidence: no `CREATE TABLE` for these names in `migrations/` or `supabase/migrations/`. Compatible with remote-only April CLI versions `20260413*` / `20260414*`.

#### Bucket 3 — `stankings_*` tables (not in either BamSignal track) — 12

- `stankings_career_applications`
- `stankings_career_posts`
- `stankings_knowledge_approvals`
- `stankings_knowledge_object_tags`
- `stankings_knowledge_object_versions`
- `stankings_knowledge_objects`
- `stankings_knowledge_relationships`
- `stankings_knowledge_tags`
- `stankings_lexicon_term_versions`
- `stankings_lexicon_terms`
- `stankings_library_volumes`
- `stankings_members`

Evidence: zero matches in BamSignal git migration SQL. Compatible with remote-only June 27 CLI versions `20260627123631`–`20260627152446` (HQ/library objects applied into BamSignal DB).

### MODIFIED

**Not determined.** Dockerless environment could not produce full `pg_dump` DDL. Views were spot-checked: all four public views have `security_invoker=true` (matches intent of `202606151800_fix_security_definer_views.sql` / applied `0023_fix_security_definer_views`).

---

## B. Live vs `supabase/migrations/` (CLI track)

| Classification | Count | Meaning |
|----------------|------:|---------|
| **MATCH** | undefined | Tables created by CLI-track SQL and present live |
| **MISSING** | 0 | |
| **EXTRA** | 103 | Live tables not created by current CLI-track SQL |
| **MODIFIED** | unknown | Needs full DDL |

### MATCH

All undefined tables defined by current CLI-track SQL exist live.

### MISSING

None.

### EXTRA (live-only relative to CLI-track SQL) — 103

Includes: full member/core baseline (`app_users`, `app_member_profiles`, …), concierge, payments, legacy sports tables, and `stankings_*` — i.e. most production schema was **not** applied through the Supabase CLI migration history.

---

## Tracking-table evidence

### `public.schema_migrations` (app runner) — 46 applied IDs

All local `migrations/*.sql` IDs are applied. Additionally applied but **absent from disk**:

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

### `supabase_migrations.schema_migrations` (CLI) — 10 versions only

```
202604130001, 202604130002,
202604140001, 202604140002, 202604140003, 202604140004,
20260627123631, 20260627144349, 20260627144405, 20260627152446
```

**Zero** overlap with local `supabase/migrations/` filenames.

---

## Indexes / functions / triggers / RLS / storage

| Object class | Live (public) | App-track CREATE count | CLI-track CREATE count | Diff quality |
|--------------|--------------:|-----------------------:|-----------------------:|--------------|
| Tables | 259 | 179 | 156 | Compared above |
| Indexes | 671 | 205 | 153 | Presence-only; not 1:1 named |
| Functions | (query aggregated) | 4 | 0 | Not fully mapped |
| Triggers | (query aggregated) | 4 | 0 | Not fully mapped |
| Policies | (query aggregated) | 1 | 0 | Not fully mapped |
| Views | 4 | 0 | 0 | MATCH intent (security_invoker) |
| Storage buckets | 2 | — | — | `cover-photos`, `profile-photos` |

**RLS:** All listed public application tables report `rls_enabled: true` via MCP `list_tables`.

---

## Summary verdict for Phase 2

1. Current `migrations/` SQL is a **subset** of live schema; everything it defines is present (**no MISSING**).
2. Current `supabase/migrations/` SQL is also a **subset**; everything it defines is present (**no MISSING**).
3. Live schema is a **superset** containing: (a) legacy April-era tables, (b) `stankings_*` (June 27-era), (c) tables from applied app IDs `0022`–`0037` whose numbered files are no longer in `migrations/`.
4. Column-level **MODIFIED** detection is blocked until a full schema dump is obtained with Docker.
