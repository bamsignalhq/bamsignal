-- Supabase linter 0011: pin function search_path to public.
-- Supabase linter 0028/0029: revoke RPC execute on internal SECURITY DEFINER helpers.

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as func
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'prevent_prediction_mutation_after_publish',
        'lock_public_ledger_prediction_fields',
        'set_updated_at',
        'sync_public_ledger_from_prediction',
        'sync_truth_ledger_from_public_ledger',
        'sync_truth_ledger_from_transparency'
      )
  loop
    execute format('alter function %s set search_path = public', r.func);
  end loop;
end $$;

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as func
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('handle_auth_user_sync', 'rls_auto_enable')
  loop
    execute format('revoke all on function %s from public', r.func);
    execute format('revoke all on function %s from anon', r.func);
    execute format('revoke all on function %s from authenticated', r.func);
    execute format('grant execute on function %s to service_role', r.func);
  end loop;
end $$;
