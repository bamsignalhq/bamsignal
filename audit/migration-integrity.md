# Migration Integrity Report

**Sprint:** 1.2  
**Date:** 2026-07-21  
**Commit under review:** `5e2ebe8`  
**Mode:** READ ONLY

---

## Summary

| Check | Result |
|-------|--------|
| Disk migration files | **46** |
| Live `schema_migrations` count | **46** |
| Duplicate numeric IDs | **none** |
| Duplicate filenames | **none** |
| Duplicate SQL within `migrations/` | **none** |
| Numbering strictly increasing | **yes** |
| Missing numbers | `0040`–`0047` only (intentional unused) |
| Restored `0022`–`0037` present | **yes (16/16)** |
| Applied restored IDs live | **16/16** |

---

## Every applied migration exists

Live applied count = 46. Disk file count = 46.

Restored set verified on disk:

`0022` … `0037` (exact stems matching live `schema_migrations.id`).

Live query: `restored_present = 16` for IDs matching `^(002[2-9]|003[0-7])_`.

---

## Unique numbering

| Prefix | Files |
|--------|------:|
| Unique `NNNN` prefixes | 46 |
| Collisions | 0 |

Filenames are unique. IDs = filename stem (runner contract in `server/migrationRunner.js`).

---

## Predecessor / sequence

Ordered numeric sequence:

```
0001 → … → 0039 → [0040–0047 unused] → 0048 → … → 0054
```

- Strictly increasing on disk: **yes**
- Gap `0040`–`0047`: **documented intentional skip** (never applied, never filed)
- No broken predecessor references inside SQL (migrations are independent files keyed by ID, not by FK to prior files)

---

## Duplicate SQL

### Within `migrations/`

**0** byte-identical pairs.

### Across app ↔ CLI (expected dual-track mirrors)

**32** identical pairs between `migrations/` and `supabase/migrations/` (institutional + restored centers). This is **parallel history**, not duplicate app IDs.

`0022_row_level_security_hardening` has **no** CLI twin (blob-only recover).

---

## Issues

None blocking integrity of the app track.

**Non-blocking:** Dual-track identical copies remain under `supabase/migrations/` (policy documented in canonical architecture).
