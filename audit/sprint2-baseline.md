# Sprint 2.0 — Recovery Baseline Verification

**Date:** 2026-07-21  
**Branch:** `feat/platform-freeze` @ `637fb3a`  
**Baseline label:** Recovery Baseline — July 2026 — Canonical Repository Restored  
**Mode:** READ ONLY

---

## Checks

| Check | Expected | Observed | Pass |
|-------|----------|----------|------|
| Application migration files | 46 | **46** | ✓ |
| Live `public.schema_migrations` | 46 | **46** (IDs match disk stems) | ✓ |
| Restored IDs `0022`–`0037` | 16 on disk + live | Present | ✓ |
| Identity verify `--require-linked` | PASS | **PASS** (`nswiwxmavuqpuzlsascs`) | ✓ |
| Recovery commits on remote | Pushed | `5e2ebe8`, `69b2efc`, `a3d21b0`, `637fb3a` | ✓ |
| Working tree “clean for recovery” | No recovery drift | Only local generated: sitemap/sw/buildInfo + `supabase/.temp/` | ✓ |

---

## Applied IDs (live = disk)

All 46 live IDs match current `migrations/*.sql` stems, including restored `0022`–`0037` and launch `0048`–`0054` (gap `0040`–`0047` intentional).

---

## Repository cleanliness note

Uncommitted local noise is **generated / link state only** — not recovery regression:

- `public/sitemap.xml`, `public/sw.js`, `src/buildInfo.ts`
- `supabase/.temp/`

---

## Baseline verdict

**INTACT.** Repository remains canonical for the app migration track. Sprint 2.0 may proceed to metadata/auth-trigger analysis without revisiting reconstruction.
