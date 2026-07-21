-- Supabase linter 0010: views must use security_invoker, not security_definer.
-- Safe to run multiple times.

alter view if exists public.signals_vault set (security_invoker = true);
alter view if exists public.truth_evidence_feed set (security_invoker = true);
alter view if exists public.user_subscriptions set (security_invoker = true);
alter view if exists public.match_master set (security_invoker = true);
