create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  telegram_user_id text unique,
  is_premium boolean not null default false,
  premium_until timestamptz,
  telegram_vip_invite_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  match_name text not null,
  prediction text not null,
  odds text not null,
  is_vip boolean not null default false,
  booking_codes jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  starts_at timestamptz,
  settled_at timestamptz,
  result_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists affiliate_clicks (
  id bigserial primary key,
  tip_id text not null,
  bookie text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists subscription_events (
  id bigserial primary key,
  provider text not null,
  event_type text not null,
  user_email text,
  user_id text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
