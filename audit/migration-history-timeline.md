# Migration History Timeline

**Sprint:** 1.1  
**Date:** 2026-07-21  
**Repo:** `bamsignalhq/bamsignal`  
**Supabase:** `nswiwxmavuqpuzlsascs`

Reconstructed from `git log` / `git blame` (file introduction commits), CLI timestamps, and live tracking tables. No database mutations performed.

---

## Era overview

```
April 2026          June 15–21           June 25–26              June 27           July 4           July 19           July 21 (now)
Legacy product  →   CLI security +    →  Institutional dual   →  Stankings       → Boost IDs    →  Launch IDs    →  Audit / freeze
on same project     app baseline         track explosion         contamination      0038–0039       0048–0054         recovery docs
```

---

## April 2026 — Legacy / pre–app-track

| When | Who / path | What | Why (inferred) |
|------|------------|------|----------------|
| 2026-04-13/14 | Supabase CLI remote history only | Versions `202604130001`–`202604140004` recorded remotely | Early BamSignal (or predecessor) schema on this Supabase project |
| — | **Not in git** | No `202604*.sql` ever found in repository history | SQL applied via dashboard/CLI without committing files |
| Surviving objects | Live tables | `fixtures`, `tips`, `daily_games`, `users`, `matches`, `signals`, ledgers, settings, … (~20) | Product pivoted; tables left in place |

**Migration path:** Supabase CLI (remote-only) — **not** `migrations/`.

---

## June 15, 2026 — CLI track begins in git

| Commit | Author | Files | Path | Why |
|--------|--------|-------|------|-----|
| `eda4812` | bamsignalhq | `202606151800_fix_security_definer_views.sql` | CLI | Fix security definer views (`security_invoker`) |
| `70f58dc` | bamsignalhq | `202606152000_fix_function_security.sql` | CLI | Harden functions for Supabase linter |

**Later applied as app IDs:** `0023`, `0024` (files never added under `migrations/`).

---

## June 21, 2026 — App track born (canonical producer)

| Commit | Author | Files | Path | Why |
|--------|--------|-------|------|-----|
| `64e0adb` | bamsignalhq | `0001_schema_migrations`, `0002_baseline_bamsignal_schema` | **App** | Move runtime schema mutations into migrations; startup verify-only |
| `7a4654f` | bamsignalhq | `0003_rate_limit_retention_indexes` | App | Retention indexes |
| `75f3210` | bamsignalhq | `202606211200_saved_profiles` | CLI | Member experience (table also in baseline) |
| `8472c44` | bamsignalhq | `202606211300_payment_fulfillment_processing` | CLI | Paystack fulfillment race → later app ID `0025` |
| `24f4c69` | bamsignalhq | `202606211430_signup_provisioning_recovery` | CLI | Signup recovery |

**Architectural shift:** App numbered migrations become the operational write path for Coolify/`npm run migrate`. CLI folder continues to receive parallel copies for some features.

---

## June 22, 2026 — Concierge

| Commit | Files | Path |
|--------|-------|------|
| `10d3fca` | `0004_signal_concierge_persistence` | App only |

---

## June 25, 2026 — Institutional centers (dual write)

Same commits introduced **byte-identical** pairs into both `migrations/0005`–`0020` and `supabase/migrations/20260625*`.

| Commit | App | CLI | Why |
|--------|-----|-----|-----|
| `05b11e7` | 0005 | 202606251200 | Workforce |
| `8a64327` | 0006 | 202606251400 | Governance |
| `4f9e4b9` | 0007 | 202606251600 | Business continuity |
| `2225c70` | 0008 | 202606251800 | Finance |
| `5d14f10` | 0009 | 202606252000 | Documents |
| `c0b26fd` | 0010 | 202606252200 | Consultant quality |
| `000648c` | 0011 | 202606252400 | Configuration |
| `abea3aa` | 0012 | 202606252600 | Monitoring |
| `3774187` | 0013 | 202606252700 | Data governance |
| `014cb4b` | 0014 | 202606252800 | API platform |
| `4f1253c` | 0015 | 202606252900 | Disaster recovery v1 |
| `346f7c4` | 0016 | 202606253000 | Launch control |
| `1e3382d` | 0017 | 202606254000 | Performance |
| `0f6555e` | 0018 | 202606255000 | Workflow |
| `c9dedee` | 0019 | 202606256000 | Reporting |
| `39c8a6b` | 0020 | 202606257000 | Readiness verification |

**Path:** Hybrid dual-commit. **Producer of live apply:** app runner (`schema_migrations`). CLI remote history **never** recorded these versions (0 synced).

---

## June 26, 2026 — Feature flags + centers that skipped `migrations/`

| Commit | App file? | CLI file | Later live app ID |
|--------|-----------|----------|-------------------|
| `af251e7` | `0021_feature_flag_platform` | `202606258000_*` | 0021 (on disk) |
| `b3e64fc` | **No** | `202606259000_platform_health_center` | `0026_platform_health_center` |
| `f3ed220` | **No** | `202606259100_abuse_protection_center` | `0027_…` |
| `fd0986c` | **No** | `202606261100_notification_center` | `0028_…` |
| `b4685eb` | **No** | `202606261200_search_center` | `0029_…` |
| `25e5f01` | **No** | `202606261300_disaster_recovery_center` | `0030_disaster_recovery_operations` |
| `d9fba91` | **No** | `202606261400_data_governance_privacy_center` | `0031_…` |
| `25fd2ae` | **No** | `202606261500_launch_command_center` | `0032_…` |
| `d4e6a3d` | **No** | `202606261600_quality_assurance_center` | `0033_…` |
| `379cf9b` | **No** | `202606261700_security_operations_center` | `0034_…` |
| `ed64eb0` | **No** | `202606261800_performance_engineering_center` | `0035_…` |
| `f0e778c` | **No** | `202606261900_enterprise_api_center` | `0036_…` |
| `dc6a303` | **No** | `202606262000_institutional_readiness_audit` | `0037_…` |

**Pattern:** After `0021`, institutional “center” SQL was committed **only** under `supabase/migrations/`, then applied to production via the **app migrator** using numbered filenames that were **never pushed to git**. Live IDs `0022`–`0037` prove the apply; disk proves the omission.

`0022_row_level_security_hardening` content recovered from dangling blob `b4f9c61e` (local untracked snapshot `331e265`, 2026-07-21) — not part of any feature commit on `main`/`feat/platform-freeze`.

---

## June 27, 2026 — Stankings contamination day

| Evidence | Detail |
|----------|--------|
| BamSignal remote CLI | `20260627123631`, `20260627144349`, `20260627144405`, `20260627152446` |
| Stankings repo migrations (same calendar day) | `20260627120000_stankings_members_and_careers`, `20260627140000_library_engine_ls001`, `20260627150000_lexicon_engine_ls002` |
| Live BamSignal tables | Exactly the 12 `stankings_*` tables those three Stankings files create |
| BamSignal application code | **Zero** `stankings_` references outside `audit/` |

**Path:** Supabase CLI against **wrong project** (BamSignal ref) while working on Stankings — or equivalent ad-hoc apply. **Not** BamSignal product schema.

---

## July 4, 2026 — Launch commerce prep (app-only resumes)

| Commit | App IDs | Path |
|--------|---------|------|
| `be21009` | `0038_member_boost_entitlements` | App only |
| `948d080` | `0039_boost_activation_integrity` | App only |

Numbering jumps over the uncommitted `0022`–`0037` block already applied in production.

---

## July 19, 2026 — F&F / commercial launch

| Commit | App IDs | Notes |
|--------|---------|-------|
| `89a11fb` | `0048_member_blocks` | Skips `0040`–`0047` (unused) |
| `d702657` | `0049_national_verification` | |
| `d6e5cbe` | `0050`–`0053` | Membership / privacy / concierge |
| `ccbd33a` | `0054_discover_conversation_unlock` | RC2 |

**Path:** App track only. CLI folder frozen at June 26 content.

---

## July 21, 2026 — Platform freeze + forensic audit

| Event | Notes |
|-------|-------|
| Identity guards | `verify-supabase-project`, link to `nswiwxmavuqpuzlsascs` |
| Sprint 1.0 | Live inventory; divergence documented |
| Sprint 1.1 | Repository reconstruction docs under `audit/` |
| Snapshot commit `331e265` | Captured local untracked `migrations/0022_…sql` blob (not merged as product commit) |

---

## Who introduced each migration path?

| Path | Primary introducer | First commit | Role today |
|------|--------------------|--------------|------------|
| App `migrations/` | bamsignalhq | `64e0adb` (2026-06-21) | **Authoritative apply path** |
| CLI `supabase/migrations/` | bamsignalhq | `eda4812` (2026-06-15) | Mirror / archive; **not** remote-synced |
| Remote April CLI | Unknown (pre-git) | N/A | Legacy residue |
| Remote June 27 CLI | Stankings migrations mis-targeted | Stankings files 20260627* | Contamination |

---

## Timeline verdict

Production BamSignal schema is a **layered accretion**:

1. April legacy (CLI remote)  
2. June app baseline + institutional dual track  
3. June 26 centers applied as app IDs without committing numbered files  
4. June 27 Stankings objects  
5. July launch app migrations  

The repository’s `migrations/` folder is therefore an **incomplete ledger** of what production already ran.
