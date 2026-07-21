# Auth Trigger Analysis — `stankings_on_auth_user_created`

**Sprint:** 2.0  
**Date:** 2026-07-21  
**Mode:** READ ONLY catalog inspection

---

## Objects

| Object | Type | Definition summary |
|--------|------|--------------------|
| `stankings_on_auth_user_created` | `AFTER INSERT` trigger on `auth.users` | `EXECUTE FUNCTION stankings_handle_new_user()` |
| `stankings_handle_new_user()` | `SECURITY DEFINER` plpgsql | Inserts into `public.stankings_members (id, email, full_name)` from `NEW.id`, `NEW.email`, `raw_user_meta_data.full_name`; `ON CONFLICT DO NOTHING` |
| `stankings_set_updated_at()` | Trigger helper | Used by `stankings_*` table UPDATE triggers (not Auth) |
| `stankings_is_super_admin()` | RLS helper | Reads `stankings_members` |

---

## Purpose

Provision a **Stankings HQ member row** whenever a Supabase Auth user is created. Origin: Stankings migration `20260627120000_stankings_members_and_careers` (remote CLI name `stankings_members_and_careers`), applied into BamSignal project by mistake / wrong link.

---

## Dependencies

```
auth.users INSERT
    → stankings_on_auth_user_created
    → stankings_handle_new_user()
    → INSERT public.stankings_members
         ↑ FK target for careers/knowledge reviewers, etc.
```

RLS policies on `stankings_*` may call `stankings_is_super_admin()` → reads `stankings_members`.

**No BamSignal `migrations/` file owns these objects.**

---

## Execution path / runtime usage

BamSignal **does** create/update rows in `auth.users` (signup / PIN login / provisioning paths under `server/services/*`, `server/provisionPlayReviewer.js`).

Therefore the trigger is **live side-effect residue**: BamSignal Auth user creation can populate `stankings_members` in the BamSignal database. That is **not** a BamSignal product feature; it is contamination continuing at runtime.

BamSignal member identity for the product is `app_users` / related app tables + username+PIN — **not** `stankings_members`.

---

## Does BamSignal application code depend on the trigger?

| Question | Answer |
|----------|--------|
| App SQL reads `stankings_members`? | **No** |
| APIs require trigger success? | **No** (trigger failure could still break Auth insert if function errors — currently `ON CONFLICT DO NOTHING` is soft) |
| HQ HTTP `STANKINGS_PLATFORM_*`? | Separate path — **keep** |

---

## Replacement vs retirement

**Replacement with a BamSignal-native Stankings-member sync: NOT REQUIRED.**

BamSignal should not maintain Stankings HQ membership tables in this database.

**Safe direction: RETIRE** trigger (and later function / tables in a dedicated cleanup), after backup.

---

## Rollback strategy (for a future execution sprint)

1. Keep SQL text of function + `CREATE TRIGGER` (from this audit / Stankings repo migration).
2. If retirement causes unexpected Auth issues (unlikely): re-create function + trigger from saved SQL.
3. Do not drop `stankings_members` in the same change as trigger drop without confirming no pending FK writers.

---

## Risk if left forever

- Continues writing HQ-shaped rows into BamSignal DB on every Auth signup.
- Confuses future audits and increases blast radius of any accidental DROP.
- Does not block BamSignal app correctness today.
