-- Row Level Security hardening — deny PostgREST/anon direct table access.
-- BamSignal member and admin APIs use server-side DATABASE_URL (table owner bypasses RLS).
-- No permissive policies: authenticated/anon roles cannot read or write sensitive tables.

do $$
declare
  tbl text;
begin
  for tbl in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename <> 'schema_migrations'
  loop
    execute format('alter table %I enable row level security', tbl);
  end loop;
end $$;
