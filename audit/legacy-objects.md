# Legacy Objects Analysis

**Sprint:** 1.1  
**Date:** 2026-07-21  
**Definition:** Tables present in production (`nswiwxmavuqpuzlsascs`) with **no** `CREATE TABLE` in current BamSignal `migrations/` or `supabase/migrations/`.

Excludes: (a) tables from missing app IDs `0022`–`0037` / CLI Jun 15–26 SQL (those are **Launch/institutional**, reconstructible — see crosswalk); (b) `stankings_*` (see `stankings-analysis.md`).

Row counts from `pg_stat_user_tables` (approximate, READ-ONLY).

---

## Inventory

| Table | Origin class | Approx rows | Current usage (evidence) | Safe to archive? | Should migrate? | Should remove? | Evidence |
|-------|--------------|------------:|--------------------------|------------------|-----------------|----------------|----------|
| `affiliate_logs` | Legacy | 0 | No BamSignal app-track SQL; unused | Yes (export then freeze) | No | Only after product OK + backup | Not in either migration folder; April-era pattern |
| `daily_games` | Legacy | 1361 | Historical sports product data | Export first | No (not BamSignal member product) | Later, after archival | Large residual dataset |
| `fixtures` | Legacy | 14 | Sports fixtures remnant | Export first | No | Later | Same |
| `global_settings` | Legacy / Deprecated | 0 | Superseded by `platform_settings` | Yes | No | Candidate drop after code grep | Empty |
| `matches` | Legacy | 14 | Sports matches remnant | Export first | No | Later | Same as fixtures |
| `notification_outbox` | Legacy / Moved | 0 | Modern notification center uses different tables | Yes | No | Candidate | Empty; superseded by `notification_*` centers |
| `payments` | Legacy / Mirror | 0 | Modern: `payment_events` / `payment_fulfillments` | Yes | No | Candidate after confirming no readers | Empty legacy name |
| `predictions` | Legacy | 0 | Sports predictions | Yes | No | Candidate | Empty |
| `profiles` | Legacy / Mirror | 1 | Modern: `app_member_profiles` | Caution | No | Not until zero refs | 1 row residual |
| `public_ledger` | Legacy / Experimental | 0 | Transparency/ledger experiment | Yes | No | Candidate | Empty |
| `signals` | Legacy / Mirror | 3 | Modern: `app_signals` | Caution | No | Not until zero refs | Name collision risk with product “signals” |
| `site_settings` | Legacy | 7 | Possibly still read by old paths | **No** until code audit | Maybe extract values | Not yet | Non-zero rows |
| `subscriptions` | Legacy / Mirror | 0 | Modern subscription/payment tables | Yes | No | Candidate | Empty |
| `system_settings` | Legacy / Deprecated | 0 | Superseded | Yes | No | Candidate | Empty |
| `tips` | Legacy | 938 | Sports tips dataset | Export first | No | Later | Large residual |
| `transparency_ledger` | Legacy / Experimental | 0 | Ledger experiment | Yes | No | Candidate | Empty |
| `truth_ledger` | Legacy / Experimental | 0 | Ledger experiment | Yes | No | Candidate | Empty |
| `user_profiles` | Legacy / Mirror | 0 | Modern member profiles | Yes | No | Candidate | Empty |
| `users` | Legacy / Mirror | 6 | Modern: `app_users` | Caution | No | Not until zero refs | 6 residual rows |
| `vip_payments` | Legacy | 0 | VIP payment remnant | Yes | No | Candidate | Empty |

**Views (legacy-named, still live):** `match_master`, `signals_vault`, `truth_evidence_feed`, `user_subscriptions` — all `security_invoker=true` (consistent with `0023` / CLI Jun 15 fix). Treat as **Legacy/Launch hybrid**; do not drop without view dependency audit.

---

## Classification legend

| Class | Meaning |
|-------|---------|
| Legacy | Pre–June-21 app-track / April CLI era |
| Launch | Current BamSignal product (not in this file) |
| Experimental | Ledger / transparency experiments |
| Deprecated | Replaced by newer tables |
| Moved | Responsibility shifted to another table family |
| Mirror | Old name parallel to `app_*` / payment tables |

---

## Aggregate recommendations

1. **Do not DROP** any legacy table in Sprint 2.0 migration repair.
2. **Archive candidates (empty + superseded):** `affiliate_logs`, `global_settings`, `notification_outbox`, `payments`, `predictions`, `public_ledger`, `subscriptions`, `system_settings`, `transparency_ledger`, `truth_ledger`, `user_profiles`, `vip_payments`.
3. **Data export required before any removal:** `daily_games`, `tips`, `fixtures`, `matches`.
4. **Code-audit first:** `site_settings`, `profiles`, `users`, `signals`.
5. **Origin hypothesis:** remote-only CLI versions `202604130001`–`202604140004` — SQL absent from BamSignal git.

---

## Safe to archive?

**Archive** here means: dump DDL+data to `audit/remote-archive/`, mark deprecated in docs — **not** drop from production.

| Safe to archive (docs + dump) without product feature loss? | Tables |
|-------------------------------------------------------------|--------|
| Likely yes | Empty superseded list above |
| Only after export | `daily_games`, `tips`, `fixtures`, `matches` |
| Not yet | `site_settings`, `profiles`, `users`, `signals` |

---

## Should migrate into `migrations/`?

**No** for legacy sports/ledger tables — they are not part of the BamSignal member product canonical schema. Optionally add a **documentation-only** stub migration is discouraged (would imply ownership). Prefer `audit/remote-archive/*.sql` after dump.
