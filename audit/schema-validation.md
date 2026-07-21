# Sprint 2.0 — Schema Validation

**Date:** 2026-07-21  
**Sources:** `migrations/*.sql` CREATE TABLE parse; live inventory (`audit/_compare_data.json` liveTables, 259 public); MCP spot checks

---

## Application schema: repository → production

| Metric | Value |
|--------|------:|
| Distinct `CREATE TABLE` targets in `migrations/` | 227 |
| Live public tables | 259 |
| App CREATE targets missing from live | **0** |
| Spot-check sample (baseline + restored + launch) | All present |

**Verdict:** Repository application SQL still represents the production **application** schema. No re-reconstruction needed.

---

## Live extras (not created by current app migrations)

| Class | Approx count | Examples |
|-------|-------------:|----------|
| **Legacy** | ~20 | `fixtures`, `tips`, `daily_games`, `users`, `matches`, `signals`, ledgers… |
| **Wrong-project** | 12 | `stankings_*` |
| Total extras vs app CREATE set | 32 | |

Classification:

| Kind | Meaning |
|------|---------|
| metadata only | CLI history rows without matching local CLI files / app IDs |
| schema (app) | Covered by app migrations — **MATCH** |
| legacy | April remote CLI era residue |
| wrong-project | June 27 Stankings migrations into BamSignal DB |

---

## Column-level MODIFIED

Still **not fully certified** without Docker `pg_dump` / `supabase db dump`. Table-level evidence is sufficient to state:

- No missing application tables relative to current `migrations/`
- Divergence outside app track is legacy/wrong-project **objects**, not missing BamSignal DDL

---

## Schema validation verdict

**Application track: VALID.**  
**CLI track: not the schema authority; history diverged (metadata).**  
**Extras: legacy + wrong-project (documented).**
