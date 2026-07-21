-- Sprint 2.1 — Retire wrong-project Stankings Auth provisioning hook.
-- BamSignal does not use stankings_members for product identity (app_users + username/PIN).
-- Do NOT drop stankings_* tables or other Stankings helper functions in this migration.
--
-- Rollback: see audit/TRIGGER_RETIREMENT_REPORT.md

DROP TRIGGER IF EXISTS stankings_on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.stankings_handle_new_user();
