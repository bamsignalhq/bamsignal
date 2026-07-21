# Trigger Final Dependency Check

**Sprint:** 2.1  
**Date:** 2026-07-21  
**Objects:** `stankings_on_auth_user_created`, `stankings_handle_new_user()`

---

## Application code

| Check | Result |
|-------|--------|
| Invocations of `stankings_handle_new_user` outside `audit/` | **None** |
| References in `migrations/` / `supabase/migrations/` | **None** (objects never in BamSignal app track) |
| RPC / route handlers calling the function | **None** |

---

## Live database

| Check | Result |
|-------|--------|
| Triggers executing `stankings_handle_new_user()` | **Only** `stankings_on_auth_user_created` on `auth.users` |
| Other `pg_trigger` rows using that function OID | **Only** that Auth trigger |
| Other public functions whose body references the name | Not exhaustively re-parsed (MCP `pg_get_functiondef` scan error on bulk); no dependents via `pg_depend` on the function besides the trigger |

---

## Intentionally unrelated (retain)

| Object | Why retain |
|--------|------------|
| `stankings_*` tables | Separate cleanup; not this sprint |
| `stankings_set_updated_at()` | Still used by table UPDATE triggers |
| `stankings_is_super_admin()` | Still used by RLS on `stankings_*` |
| `STANKINGS_PLATFORM_*` HTTP client | Product integration |

---

## Go / no-go

**GO** — safe to drop Auth trigger then function only.
