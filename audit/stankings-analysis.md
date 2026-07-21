# Stankings Object Analysis (in BamSignal DB)

**Sprint:** 1.1  
**Date:** 2026-07-21  
**Host project:** BamSignal Supabase `nswiwxmavuqpuzlsascs`  
**Correct home project:** Stankings Supabase `dfaqkrikdvohvvcuxoek`  
**Stankings repo:** `/Users/stanlex/Documents/stankings` (`bamsignalsm/stankings`)

---

## Verdict

The twelve `stankings_*` tables (plus related functions, triggers, and RLS policies) in the BamSignal database are **contamination from Stankings migrations applied against the wrong Supabase project** on **2026-06-27**. They do **not** belong in BamSignal product schema and have **no** BamSignal application code references.

---

## Inventory — tables

| Table | Origin migration (Stankings repo) | Approx rows (BamSignal live) | Current usage in BamSignal | Belongs in BamSignal? | Safe to archive? | Should migrate? | Should remove? |
|-------|-----------------------------------|-------------------------------:|----------------------------|-----------------------|------------------|-----------------|----------------|
| `stankings_members` | `20260627120000_stankings_members_and_careers.sql` | 4 | HQ member registry (wrong DB) | **No** — Stankings | Export then freeze | Out to Stankings DB if needed | After backup + confirm Stankings has copy |
| `stankings_career_posts` | same | 0 | Careers | No | Yes | No | After OK |
| `stankings_career_applications` | same | 0 | Careers | No | Yes | No | After OK |
| `stankings_library_volumes` | `20260627140000_library_engine_ls001.sql` | 1 | Library engine | No | Export (1 row) | No | After OK |
| `stankings_knowledge_objects` | same | 3 | Knowledge graph | No | Export | No | After OK |
| `stankings_knowledge_object_versions` | same | 0 | Knowledge | No | Yes | No | After OK |
| `stankings_knowledge_relationships` | same | 3 | Knowledge | No | Export | No | After OK |
| `stankings_knowledge_tags` | same | 0 | Knowledge | No | Yes | No | After OK |
| `stankings_knowledge_object_tags` | same | 0 | Knowledge | No | Yes | No | After OK |
| `stankings_knowledge_approvals` | same | 0 | Knowledge | No | Yes | No | After OK |
| `stankings_lexicon_terms` | `20260627150000_lexicon_engine_ls002.sql` | 0 | Lexicon | No | Yes | No | After OK |
| `stankings_lexicon_term_versions` | same | 0 | Lexicon | No | Yes | No | After OK |

---

## Inventory — functions

| Function | Origin | Purpose | Belongs in BamSignal? |
|----------|--------|---------|------------------------|
| `stankings_set_updated_at` | careers migration | `updated_at` trigger helper | No |
| `stankings_is_super_admin` | careers migration | RLS helper | No |
| `stankings_handle_new_user` | careers migration (auth hook pattern) | Provision member on signup | No |
| `set_updated_at` | Also present (shared name) | Generic; may be used beyond Stankings — **do not drop** without dependency check | Unknown / shared |

---

## Inventory — triggers (non-internal)

| Trigger | Table |
|---------|-------|
| `stankings_members_updated_at` | `stankings_members` |
| `stankings_career_posts_updated_at` | `stankings_career_posts` |
| `trg_vol_updated` | `stankings_library_volumes` |
| `trg_ko_updated` | `stankings_knowledge_objects` |
| `trg_lexicon_updated` | `stankings_lexicon_terms` |

All Stankings-scoped. Safe to drop **with** their tables after backup — not as part of migration repair.

---

## Inventory — RLS policies

| Table | Policy count |
|-------|-------------:|
| `stankings_members` | 3 |
| `stankings_career_posts` | 2 |
| `stankings_career_applications` | 4 |
| Each knowledge/lexicon/library table listed above | 2 |

Policies mirror Stankings repo SQL (member/super-admin checks). Not used by BamSignal member/admin Node APIs (server uses `DATABASE_URL` owner role).

---

## Which BamSignal migration created them?

**None.** Zero matches in:

- `migrations/*.sql`
- `supabase/migrations/*.sql` (BamSignal)

Linked evidence to BamSignal **CLI remote history** only:

```
20260627123631
20260627144349
20260627144405
20260627152446
```

Same calendar day as Stankings files `20260627120000`, `20260627140000`, `20260627150000`. Four remote version stamps are consistent with multiple `db push` / dashboard applies of that Stankings batch (exact version IDs are CLI-generated timestamps, not the Stankings filenames).

---

## Why it exists

Most likely sequence:

1. Developer worked on Stankings HQ/library/lexicon features (June 27).
2. Supabase CLI was **linked to BamSignal** (`nswiwxmavuqpuzlsascs`) instead of Stankings (`dfaqkrikdvohvvcuxoek`), **or** SQL was pasted into BamSignal SQL editor.
3. Objects created and CLI history recorded four remote versions.
4. BamSignal app continued unaffected (no code paths).

This matches the ecosystem risk that Sprint 0.5.1 guardrails (`verify:supabase-project`) were designed to prevent going forward.

---

## Classification

| Label | Apply? |
|-------|--------|
| Legacy | No (not BamSignal legacy product) |
| Launch | No |
| Experimental | No |
| Deprecated | N/A |
| Moved | **Should move / already belongs elsewhere** |
| Mirror | Accidental mirror of Stankings schema |
| **Contamination** | **Yes — primary label** |

---

## Recommendations

1. **Do not** add `stankings_*` to BamSignal `migrations/`.
2. **Do not** drop in Sprint 2.0 CLI repair — separate product/security ticket.
3. Confirm Stankings production (`dfaqkrikdvohvvcuxoek`) already has these objects + data.
4. If BamSignal holds unique rows (`stankings_members`×4, knowledge×3, etc.), export before drop.
5. Archive remote CLI versions under `audit/remote-archive/` when dump available.
6. Keep project-link verification mandatory before any future `supabase` DB command.

---

## Evidence checklist

| Check | Result |
|-------|--------|
| Tables match Stankings CREATE SQL | Yes (12/12) |
| BamSignal code references | None outside `audit/` |
| BamSignal migration SQL | None |
| Remote CLI Jun 27 | Present |
| Identity of correct Stankings ref | `dfaqkrikdvohvvcuxoek` (PROJECT_IDENTITY ecosystem table) |
