-- Boost activation integrity: server-only entitlement writes + repair audit trail.

-- Allow service_role / postgres to manage entitlements (server DATABASE_URL).
-- PostgREST anon/authenticated remain deny-by-default from 0022.
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'app_member_boosts' and policyname = 'boost_entitlement_server_all'
  ) then
    create policy boost_entitlement_server_all on app_member_boosts
      for all
      to postgres, service_role
      using (true)
      with check (true);
  end if;
exception
  when undefined_object then null;
end $$;

create table if not exists boost_activation_repairs (
  id uuid primary key default gen_random_uuid(),
  paystack_reference text not null,
  user_key text,
  product_id text not null,
  entitlement_id uuid,
  action text not null default 'created',
  dry_run boolean not null default false,
  source text not null default 'repair_command',
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists boost_activation_repairs_reference_idx
  on boost_activation_repairs (paystack_reference, created_at desc);

alter table payment_fulfillments
  add column if not exists entitlement_id uuid;

create index if not exists payment_fulfillments_entitlement_idx
  on payment_fulfillments (entitlement_id)
  where entitlement_id is not null;
