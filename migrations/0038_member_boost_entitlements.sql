-- Server-side shop boost entitlements (payment fortress grants; client hydrates on pull).

create table if not exists app_member_boosts (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  product_id text not null,
  activated_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'active',
  consumed boolean not null default false,
  paystack_reference text,
  city text,
  created_at timestamptz not null default now()
);

create unique index if not exists app_member_boosts_paystack_reference_uidx
  on app_member_boosts (paystack_reference)
  where paystack_reference is not null and paystack_reference <> '';

create index if not exists app_member_boosts_user_active_idx
  on app_member_boosts (user_key, status, expires_at desc);

-- Referral reward ledger (points / NGN credits for history; premium days remain primary reward)
alter table app_referral_events
  add column if not exists reward_points integer not null default 0;
