# Repository Consistency

**Sprint:** 1.2  
**Date:** 2026-07-21  
**Commit:** `5e2ebe8`

---

## Agreement matrix

| Artifact | Count / state | Agrees? |
|----------|---------------|---------|
| `migrations/*.sql` on disk | 46 | ✓ |
| Live `public.schema_migrations` | 46 | ✓ |
| Restored files `0022`–`0037` on disk | 16 | ✓ |
| Restored IDs present live | 16 | ✓ |
| Intentional number gap `0040`–`0047` | unused | ✓ |
| CLI mirrors (`supabase/migrations/`) | 34 files | ✓ (parallel archive) |
| App↔CLI identical content pairs | 32 | ✓ (expected dual-track) |
| CLI remote history synced | 0 / 10 remote-only / 34 local-only | ✓ (still diverged — documented) |
| Timeline docs | Sprint 1.1 files | ✓ with integrity re-check |

---

## Application migration count

```
disk files == live applied IDs == 46
```

File stems include all previously missing applied IDs. No disk file lacks a matching applied ID (Sprint 1.0 + restore).

---

## CLI mirrors

| Role | Path | Status |
|------|------|--------|
| Authoritative apply | `migrations/` | Consistent with live |
| Non-authoritative mirror | `supabase/migrations/` | Present; **not** recorded in remote CLI history |
| Remote orphans | April + Jun 27 versions | Documented; not in git SQL |

---

## Timeline consistency

| Era | Still valid after restore? |
|-----|----------------------------|
| April legacy remote | Yes — objects remain live, SQL still absent from app track |
| June app baseline | Yes |
| June dual institutional | Yes — identical pairs verified |
| June 26 centers | Yes — now also under `migrations/0022`–`0037` |
| June 27 Stankings | Yes — contamination claim refined: **SAFE** as app dependency (Phase 3) |
| July launch | Yes — `0038+` |

---

## Inconsistencies remaining (known, non-blocking for push of recovery)

1. Supabase CLI history still fully diverged (bookkeeping for Sprint 2.0).
2. Dual identical SQL in two folders (policy: demote CLI).
3. Legacy + `stankings_*` objects exist live without BamSignal app migrations (by design / contamination).
4. Full `pg_dump` DDL still unavailable for column-level MODIFIED.

None of these contradict “disk app track ↔ live `schema_migrations`” consistency after `5e2ebe8`.

---

## Consistency verdict

**Internally consistent for the authoritative app migration track.**
