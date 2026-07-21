# Production Dependencies — `stankings_*`

**Sprint:** 1.2  
**Date:** 2026-07-21  
**Project:** `nswiwxmavuqpuzlsascs`  
**Mode:** READ ONLY (Supabase MCP catalog queries + repository scan)

---

## Questions

| # | Question | Answer |
|---|----------|--------|
| 1 | Are any BamSignal services still reading `stankings_*` tables? | **No** (no SQL/table identifiers in app/server code) |
| 2 | Are FKs / triggers / functions referencing them from BamSignal objects? | **FKs/triggers/functions exist only inside the `stankings_*` cluster** — no FK **from** BamSignal tables **to** `stankings_*` |
| 3 | Are production APIs depending on those tables? | **No** evidence in this repo; HQ integration uses HTTP env vars, not these tables |

---

## Repository evidence

- Grep for `stankings_(members|career_|knowledge_|library_|lexicon_)` outside `audit/`: **0 hits**
- Grep for SQL `from/into/join stankings_` in `server/`: **0 hits**
- Non-audit `stankings_` hits are exclusively `STANKINGS_PLATFORM_*` / `STANKINGS_CAREERS_*` constants (HTTP/branding)

`server/services/stankingsPlatform.js` calls Stankings **Platform HTTP APIs** (`/api/platform/bamsignal/...`). It does not query local `stankings_*` tables.

---

## Live database evidence (READ ONLY)

### Foreign keys

- **FK from `stankings_*` → `stankings_*`:** present (internal graph: members, careers, knowledge, lexicon)
- **FK from non-`stankings_*` → `stankings_*`:** **none** (`[]`)

### Functions

| Function | Scope |
|----------|-------|
| `stankings_handle_new_user` | Stankings auth provision helper |
| `stankings_is_super_admin` | Stankings RLS helper |
| `stankings_set_updated_at` | Stankings trigger helper |

No non-`stankings_*` routines found that embed `stankings_` table names in this audit pass.

### Triggers

Only on `stankings_*` tables (members, career_posts, library_volumes, knowledge_objects, lexicon_terms).

### Views

No public views whose definition references `stankings_%` (empty view list in scan).

### Policies

27 RLS policies on `stankings_*` tables (self-contained).

---

## Origin reminder

Objects align with Stankings repo migrations dated **2026-06-27**, and BamSignal remote CLI history has four `20260627*` versions — consistent with wrong-project apply. **Not** created by BamSignal `migrations/`.

---

## Conclusion

### **SAFE**

Safe to treat `stankings_*` **tables** as non-dependencies of BamSignal **application services/APIs** (no reads/writes from app SQL).

**Caveats (do not over-read SAFE):**

1. **SAFE ≠ “drop now.”** Removal needs backup + product approval + confirm Stankings production has its own copy.
2. **SAFE does not cover** intentional HQ HTTP integration (`STANKINGS_PLATFORM_URL`) — that must remain.
3. **Auth trigger is live:** `auth.users` → `stankings_on_auth_user_created` → `stankings_handle_new_user()`. Drop/disable that trigger **before** dropping functions/tables.

---

## Auth trigger (cleanup prerequisite — not an app query dependency)

Live catalog shows:

| Schema | Table | Trigger | Action |
|--------|-------|---------|--------|
| `auth` | `users` | `stankings_on_auth_user_created` | `EXECUTE FUNCTION stankings_handle_new_user()` |

**Meaning:** New Supabase Auth users in **this** project invoke Stankings provisioning. BamSignal member auth is username+PIN via app tables, but shared Auth infrastructure means this trigger is **live side-effect residue**.

| Concern | Impact on verdict |
|---------|-------------------|
| BamSignal Node APIs reading `stankings_*` tables | Still **none** |
| Safe to ignore forever | No — document for cleanup |
| Safe to DROP tables/functions without removing trigger first | **No** |

Updated residual: Auth trigger is **KNOWN**. Table-read dependency remains **SAFE** (none). Drop plan must disable/drop `stankings_on_auth_user_created` first.
