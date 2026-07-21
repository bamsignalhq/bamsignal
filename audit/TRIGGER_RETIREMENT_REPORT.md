# Trigger Retirement Report — Sprint 2.1

**Date:** 2026-07-21  
**Branch:** `feat/platform-freeze`  
**Migration:** `migrations/0055_retire_stankings_auth_trigger.sql`

---

## Preconditions (pre-deploy)

| Check | Status |
|-------|--------|
| Recovery Baseline July 2026 | Intact (`637fb3a` lineage) |
| App migrations before this change | 46 (+ this file → 47) |
| Live applied IDs before deploy | 46 (0055 applies on migrate/startup) |
| `verify:supabase-project --require-linked` | Run in validation |
| `npm run build` | Run in validation |
| `npm run test:server-import` | Run in validation |
| CLI repair | **Not performed** (NOT REQUIRED) |

---

## Objects removed (by migration 0055)

| Object | Action |
|--------|--------|
| Trigger `stankings_on_auth_user_created` on `auth.users` | `DROP TRIGGER IF EXISTS` |
| Function `public.stankings_handle_new_user()` | `DROP FUNCTION IF EXISTS` |

---

## Objects intentionally retained

| Object | Reason |
|--------|--------|
| All `stankings_*` tables | Separate product/cleanup decision |
| `stankings_set_updated_at()` | Table UPDATE triggers |
| `stankings_is_super_admin()` | RLS helpers |
| Data in `stankings_members` | No DELETE |
| CLI / `supabase_migrations` history | Untouched |
| Historical app migrations `0001`–`0054` | Untouched |

---

## Risk assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Auth signup fails after drop | Low | Function was side-effect only; BamSignal provisions `app_users` in app code |
| Orphaned dependents | Low | Dependency check: only this trigger used the function |
| Accidental table drop | N/A | Not in migration |
| Wrong Supabase project | Low | verify guard + linked ref `nswiwxmavuqpuzlsascs` |

---

## Expected deployment behavior

1. Coolify/redeploy (or `npm run migrate`) applies `0055_retire_stankings_auth_trigger`.
2. `schema_migrations` gains id `0055_retire_stankings_auth_trigger`.
3. New `auth.users` inserts no longer write `stankings_members`.
4. BamSignal PIN login / member flows unchanged.
5. No Supabase CLI history change.

---

## Rollback SQL

```sql
CREATE OR REPLACE FUNCTION public.stankings_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.stankings_members (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

CREATE TRIGGER stankings_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION stankings_handle_new_user();
```

Prefer rollback via a new forward migration if ever needed (do not rewrite 0055).

---

## Post-deploy verification checklist

```sql
-- Expect 0 rows
select trigger_name from information_schema.triggers
 where trigger_name = 'stankings_on_auth_user_created';

-- Expect 0 rows
select proname from pg_proc p
 join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname = 'stankings_handle_new_user';

select id from schema_migrations where id = '0055_retire_stankings_auth_trigger';
```

Also: smoke BamSignal signup/login on the deployed environment.
