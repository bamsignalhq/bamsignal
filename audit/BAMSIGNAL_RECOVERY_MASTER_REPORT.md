# BamSignal Recovery Master Report

**Sprint:** 1.1 — Repository Recovery & Canonical Migration Reconstruction  
**Mode:** READ ONLY + documentation under `audit/` only  
**Date:** 2026-07-21  
**Repository:** `bamsignalhq/bamsignal`  
**Supabase project:** `nswiwxmavuqpuzlsascs`  
**Branch observed:** `feat/platform-freeze` @ `ce08778`

---

## Executive summary

BamSignal production schema was built by **multiple writers** (April CLI, June app migrator, June CLI file mirrors, June 27 Stankings mis-apply). The **operational authority** for today’s member product is the **app track** (`migrations/` + `public.schema_migrations`). The repository’s `migrations/` folder is **missing 16 applied files** (`0022`–`0037`); **all 16 are reconstructible** from git (blob for `0022`) and `supabase/migrations/` (for `0023`–`0037`). Supabase CLI history remains **fully diverged** (0 synced). Full column-level DDL dump is still unavailable (no Docker).

**This sprint does not repair the database.** It makes future repair evidence-based.

---

## Root cause

1. **Dual migration systems** without a single owner: app numbered SQL and Supabase CLI timestamped SQL were both written; only the app runner consistently recorded applies in `schema_migrations`.
2. **June 26 process break:** institutional “center” features committed SQL under `supabase/migrations/` only, then applied via temporary numbered `migrations/00NN_*` files that were **never committed**.
3. **Historical CLI-only April era** left legacy tables without SQL in git.
4. **Wrong-project apply (June 27)** introduced `stankings_*` into BamSignal.
5. **CLI remote history** therefore reflects orphans, not the local CLI folder (0 overlap).

---

## Timeline

See `audit/migration-history-timeline.md`.

| Era | Path | Outcome |
|-----|------|---------|
| April 2026 | Remote CLI only | ~20 legacy tables; SQL not in git |
| June 15 | CLI in git | Security fixes → later app IDs 0023–0024 |
| June 21 | **App track created** | Baseline + migrate runner (canonical) |
| June 25 | Dual identical files | 0005–0020 ↔ CLI mirrors |
| June 26 | CLI-only centers + uncommitted app IDs | Live 0022–0037; files missing |
| June 27 | Stankings → BamSignal DB | 12 `stankings_*` tables |
| July 4–19 | App-only launch | 0038–0039, 0048–0054 (skip 0040–0047) |

---

## Gap analysis

See `audit/repository-gap-analysis.md` and `audit/application-migration-sequence.md`.

| Gap | Status |
|-----|--------|
| `0022`–`0037` files | Missing on disk; **reconstructible** |
| `0040`–`0047` | Unused numbers; no SQL |
| April remote SQL | Not in BamSignal git |
| Stankings SQL | In Stankings repo, not BamSignal track |
| Full `pg_dump` | Still missing |

---

## Migration crosswalk

See `audit/migration-crosswalk.md`.

- **17** institutional pairs (`0005`–`0021` ↔ CLI): **byte-identical** (except `0015` vs Jun-26 DR ops file).
- **15** name-mapped recovers (`0023`–`0037` ← CLI).
- **1** blob recover (`0022`).
- **10** remote-only CLI versions: April legacy + June 27 Stankings.

---

## Repository health

| Check | Status |
|-------|--------|
| Identity linked to BamSignal ref | PASS (prior sprint) |
| App track contiguous on disk | **FAIL** (0022–0037, 0040–0047) |
| App track matches live applied set | **FAIL** (16 applied IDs without files) |
| CLI local ↔ remote sync | **FAIL** (0 synced) |
| Stankings contamination documented | PASS (this sprint) |
| Legacy objects documented | PASS (this sprint) |
| Column-level schema fidelity | **UNKNOWN** (no full DDL) |

---

## Risk assessment

| Risk | Level | Notes |
|------|-------|-------|
| `supabase db push` of 34 local files | **Critical** | Would fight existing schema |
| `migration repair` without archive + dump | **High** | Bookkeeping errors / false confidence |
| Dropping legacy / `stankings_*` | **High** | Needs product + backup |
| Restoring `0022`–`0037` files then re-running migrate | **Low** if IDs match | Runner should no-op |
| Leaving dual tracks | **Medium** | Future wrong-path applies |

---

## Recommended architecture (ONE)

### Option A — **RECOMMENDED**

```
migrations/  →  npm run migrate  →  Production (schema_migrations)
```

**Demote** `supabase/migrations/` to non-authoritative archive / stop new writes.  
**Forbid** `supabase db push` for BamSignal schema changes.

### Option B — rejected

Supabase CLI alone cannot become authority without inventing history for baseline + all app-only launch migrations and erasing remote orphans safely — high risk, low benefit.

### Option C — rejected as ongoing practice

Hybrid dual-write is exactly what produced divergence. Temporary hybrid existed historically; it must not continue.

**Justification:** Coolify/production already runs the app migrator; live `schema_migrations` has 46 IDs vs CLI’s 10; member/launch SQL after July is app-only.

---

## Canonical migration path (future)

1. Author SQL only in `migrations/00NN_description.sql`.
2. `npm run verify:supabase-project -- --require-linked`.
3. `npm run migrate` (wrapped).
4. Commit the numbered file with the feature.
5. Do not add parallel CLI copies.
6. Optional: generate types / docs from live schema — never the reverse for applies.

---

## Repair readiness

### Conclusion: **NOT READY**

(Allowed values: READY | NOT READY | READY WITH CONDITIONS)

**Blockers:**

1. Missing numbered files `0022`–`0037` not yet restored into `migrations/` (content known; restore not executed this sprint by design).
2. No full Docker `pg_dump` / `supabase db dump` for MODIFIED column-level proof.
3. Dual-track policy not yet enforced in CONTRIBUTING (docs-only recommendation here).
4. April remote SQL not archived.
5. Product decision pending on `stankings_*` and legacy sports tables (must not be part of blind repair).
6. CLI remote history still diverged — any repair command list would be premature.

**READY WITH CONDITIONS** would apply only to a **narrow repo hygiene PR** (copy files; no DB commands). That is not “reconciliation / repair.”

---

## Rollback strategy

| Action | Rollback |
|--------|----------|
| Future file restore commit | `git revert` — no DB impact |
| Accidental migrate re-run | No-op if IDs exist; if someone renames IDs, restore from backup |
| Accidental `db push` | Supabase project backup restore only |
| Accidental DROP legacy/stankings | Backup restore only |
| Future CLI `migration repair` | Opposite `--status` repair (metadata only) |

Always take a Supabase dashboard backup before any Sprint 2.0 DB metadata work.

---

## Open questions

1. Confirm Stankings production already contains the same `stankings_*` rows (4 members, etc.).
2. Is any production feature still reading `site_settings` / legacy `users` / `signals`?
3. Should April remote SQL be recovered from Supabase support/dashboard before any cleanup?
4. Leadership preference: leave CLI history permanently divergent vs bookkeeping repair after archive?
5. When will Docker be available for `supabase db dump`?

---

## Sprint 2.0 — exact command intent (NOT TO RUN until blockers clear)

### Phase 2.0-A — Repository hygiene only (no DB)

```bash
# After approval — restore sources only
git cat-file -p b4f9c61e603c8fa3b04c33fcd85c7fe3f43582cf \
  > migrations/0022_row_level_security_hardening.sql
cp supabase/migrations/202606151800_fix_security_definer_views.sql \
  migrations/0023_fix_security_definer_views.sql
# … repeat mapping from audit/repository-gap-analysis.md for 0024–0037 …
npm run verify:supabase-project -- --require-linked
# migrate should insert nothing:
npm run migrate
npm run build
npm run test:server-import
```

### Phase 2.0-B — Evidence dump (still no repair)

```bash
# Requires Docker
supabase db dump --linked --schema public,auth,storage \
  --file audit/live_schema.full.sql
```

### Phase 2.0-C — CLI history (optional bookkeeping ONLY)

Only after 2.0-A + 2.0-B + backup + written command list review:

```bash
# DO NOT RUN NOW — shape only
# supabase migration repair --status …   # per audited version list
```

**Forbidden until further notice:** `supabase db push`, `db reset`, `migration up`, DDL/DML cleanup of legacy/stankings.

---

## Deliverables (Sprint 1.1)

| File | Phase |
|------|-------|
| `audit/application-migration-sequence.md` | 1 |
| `audit/migration-crosswalk.md` | 2 |
| `audit/migration-history-timeline.md` | 3 |
| `audit/repository-gap-analysis.md` | 4 |
| `audit/legacy-objects.md` | 5 |
| `audit/stankings-analysis.md` | 6 |
| This report (architecture + readiness) | 7–9 |

---

## Answers to success criteria

| # | Question | Answer |
|---|----------|--------|
| 1 | Where did every migration originate? | Timeline + per-file introduction commits; April/Stankings remote-only noted |
| 2 | Which system is authoritative? | **App track** (`migrations/` + `schema_migrations`) |
| 3 | Which files are genuinely missing? | **`0022`–`0037`** (applied); `0040`–`0047` unused |
| 4 | Can they be reconstructed? | **Yes** (all 16 applied missing files) |
| 5 | Is repository history internally complete? | **No** (until files restored + remote archives) |
| 6 | Can migration repair be safely attempted? | **No** (NOT READY) |
| 7 | Sprint 2.0 commands? | Listed above — hygiene first, dump second, repair optional last |

---

## Final verdict

**MORE REPOSITORY RECOVERY REQUIRED**
