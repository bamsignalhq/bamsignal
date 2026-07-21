# Dependency Scan

**Sprint:** 1.2  
**Date:** 2026-07-21  
**Patterns:** `stankings_`, `institution_`, `governance`, `workforce`  
**Scope:** Entire repository except `node_modules/`, `dist/`, `android/`, `.git/`

---

## Method

Case-insensitive scan. Classifications:

| Class | Meaning |
|-------|---------|
| active code | `.js/.ts/.tsx` runtime or UI source |
| comment | line primarily a comment |
| documentation | `docs/`, `audit/`, `*.md` |
| migration only | `migrations/`, `supabase/migrations/` |
| other | configs, seeds, misc |

**Important:** Pattern `stankings_` also matches env/constant names such as `STANKINGS_PLATFORM_URL`. Table-name scan is separate (Phase 3).

---

## Totals (all patterns)

| Pattern | Approx hits |
|---------|------------:|
| `governance` | 1612 |
| `workforce` | 627 |
| `stankings_` | 123 |
| `institution_` | 22 |

---

## `stankings_` — classification

| Class | Hits | Notes |
|-------|-----:|-------|
| documentation (`audit/`) | ~103 | Recovery/forensic docs |
| active code / tests / runbooks | ~20 | **Env vars & brand constants only** — see below |
| migration only | 0 | No BamSignal migration creates `stankings_*` tables |

### Non-audit occurrences (all reviewed)

| File | What it is | DB table? |
|------|------------|-----------|
| `server/services/stankingsPlatform.js` | HTTP client to HQ (`STANKINGS_PLATFORM_URL`) | **No** |
| `src/constants/corporate.ts` | `STANKINGS_COMPANY_NAME`, `STANKINGS_*_URL` | **No** |
| `src/constants/careers.ts` | Re-exports careers URLs | **No** |
| `src/components/careers/CareersLandingPage.tsx` | Displays company name | **No** |
| `scripts/test-careers.mjs` / `test-runbooks.mjs` | Asserts constant/env names | **No** |
| `docs/runbooks/*.md` | Documents platform env vars | **No** |

**Zero** matches for table identifiers:

`stankings_members`, `stankings_career_*`, `stankings_knowledge_*`, `stankings_library_*`, `stankings_lexicon_*`

in non-audit source.

---

## `institution_` / `governance` / `workforce`

| Pattern | Role in BamSignal |
|---------|-------------------|
| `workforce` | **Active** admin product — `server/services/workforceManagement.js`, admin UI, migration `0005` |
| `governance` | **Active** admin + institute product — multiple services and UI centers, migrations `0006`, `0013`, `0031`, etc. |
| `institution_` | Mostly naming inside institutional admin/institute features (active), not foreign schema |

These are **first-party BamSignal features**, not contamination.

---

## Dead code?

No evidence that workforce/governance admin surfaces are dead. They are wired through admin nav, permissions, and migrations present on disk and live.

`stankings_*` **tables** are unused by BamSignal application code (see Phase 3).

---

## Verdict for Phase 2

1. Do not confuse **Stankings HQ HTTP integration** (`STANKINGS_*` env) with **`stankings_*` Postgres tables**.
2. Workforce / governance / institutional centers are legitimate BamSignal surface area.
3. Table-level `stankings_*` usage in app code: **none found**.
