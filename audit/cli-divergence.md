# Sprint 2.0 — Supabase CLI Divergence

**Date:** 2026-07-21  
**Command:** `npx supabase migration list` (inspect only)  
**Project:** `nswiwxmavuqpuzlsascs`

---

## Summary

| Category | Count |
|----------|------:|
| Synced (local + remote) | **0** |
| Remote-only | **10** |
| Local-only (`supabase/migrations/`) | **34** |

**Divergence is CLI history metadata relative to the demoted CLI folder.**  
Application schema authority remains `migrations/` + `public.schema_migrations` (46/46 aligned).

---

## Remote-only (in `supabase_migrations.schema_migrations`, no local file)

| Version | Name (live) | Classification |
|---------|-------------|----------------|
| `202604130001` | `initial_platform` | **Legacy** (pre–app-track) |
| `202604130002` | `gbam_betvantage_core` | **Legacy** |
| `202604140001` | `legacy_engine_compat` | **Legacy** |
| `202604140002` | `user_subscriptions_created_at` | **Legacy** |
| `202604140003` | `truth_ledger_table` | **Legacy** |
| `202604140004` | `match_master_signal_tags` | **Legacy** |
| `20260627123631` | `stankings_members_and_careers` | **Wrong-project** |
| `20260627144349` | `library_engine_ls001` | **Wrong-project** |
| `20260627144405` | `library_engine_seed` | **Wrong-project** |
| `20260627152446` | `lexicon_engine_ls002` | **Wrong-project** |

These remote names now confirm Sprint 1.x hypotheses with evidence from the CLI ledger itself.

---

## Local-only (34 files under `supabase/migrations/`)

All June 15–26 timestamps (`202606151800` … `202606262000`).  
**None** appear in remote CLI history. Their DDL was applied via the **app track** (and/or dual-write period), not via recorded `supabase db push`.

---

## Is divergence purely metadata?

| Layer | Assessment |
|-------|------------|
| CLI `schema_migrations` vs local CLI files | **Metadata mismatch** (0 synced) |
| App `migrations/` vs live app schema | **Aligned** (46/46; 0 missing CREATE TABLE from app SQL vs live inventory) |
| Live extras vs app SQL | **Legacy + wrong-project objects** (not CLI-local file drift) |

**Conclusion:** Remaining CLI list divergence is **metadata (and intentional remote orphans)**, not evidence that BamSignal’s canonical app migrations are out of sync with production application schema.

---

## Risk of `db push` (still forbidden)

Pushing 34 local-only files would attempt to re-apply SQL already present → errors / partial applies. Remote orphans would remain. **Do not push.**
