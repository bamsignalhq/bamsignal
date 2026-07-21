# Auth Trigger Replacement / Retirement Plan

**Sprint:** 2.0 — DESIGN ONLY — **DO NOT IMPLEMENT**  
**Date:** 2026-07-21

---

## Decision

**No BamSignal-native replacement trigger is required.**

Plan: **controlled retirement** of:

1. Trigger `auth.users` / `stankings_on_auth_user_created`
2. Function `public.stankings_handle_new_user()` (after trigger gone)
3. Later (separate change): remaining `stankings_*` objects + helpers, only after Stankings production confirmed

HQ integration continues via `STANKINGS_PLATFORM_URL` / service key — unchanged.

---

## Why not replace?

| Candidate replacement | Rejected because |
|-----------------------|------------------|
| BamSignal trigger → `app_users` | Signup/login already provision `app_users` in application code |
| BamSignal trigger → call HQ HTTP | Wrong layer (DB trigger + network); already have `stankingsPlatform.js` |
| Keep syncing `stankings_members` | Perpetuates wrong-project schema |

---

## Proposed future migration shape (Sprint 2.1+ execution — not now)

**File (example only, not created):** `migrations/0055_retire_stankings_auth_trigger.sql`

```sql
-- RETIRE wrong-project Auth hook (BamSignal does not own Stankings membership).
-- Rollback: recreate from audit/auth-trigger-analysis.md / Stankings migration SQL.

DROP TRIGGER IF EXISTS stankings_on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.stankings_handle_new_user();
```

**Out of scope for first retirement PR:**

- `DROP TABLE stankings_*`
- Dropping `stankings_set_updated_at` / `stankings_is_super_admin` (still used by table triggers/RLS until tables go)

---

## Preconditions before execute

1. Supabase project backup / PITR window confirmed.
2. `npm run verify:supabase-project -- --require-linked` PASS.
3. Confirm Stankings project `dfaqkrikdvohvvcuxoek` has its own Auth hook (not relying on BamSignal DB).
4. Optional: count recent inserts into `stankings_members` correlated with BamSignal signups (evidence of ongoing side effects).
5. Apply via **`npm run migrate` only** (canonical path) — never `db push`.

---

## Verification after execute (future)

1. `information_schema.triggers` — no `stankings_on_auth_user_created`.
2. Signup smoke (staging or controlled) — Auth user create succeeds; no new unintended `stankings_members` row requirement for BamSignal login.
3. BamSignal PIN login / onboarding unaffected.

---

## Rollback SQL (save verbatim)

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

---

## Sequencing relative to CLI metadata repair

Auth trigger retirement is **independent** of CLI `migration repair`. Prefer:

1. Keep CLI repair optional / deferred  
2. Schedule trigger retirement as its own app migration when approved  

Do not bundle with speculative `DROP TABLE`.
