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
  league text,
  prediction text not null,
  odds text not null,
  confidence integer,
  is_vip boolean not null default false,
  booking_codes jsonb not null default '{}'::jsonb,
  source text,
  status text not null default 'pending',
  starts_at timestamptz,
  settled_at timestamptz,
  result_payload jsonb,
  created_at timestamptz not null default now()
);

alter table tips add column if not exists league text;
alter table tips add column if not exists confidence integer;
alter table tips add column if not exists source text;

create table if not exists daily_games (
  id uuid primary key default gen_random_uuid(),
  game_date date not null,
  match_name text not null,
  league text,
  prediction text not null,
  odds numeric(8, 2) not null,
  confidence integer,
  is_vip boolean not null default false,
  booking_codes jsonb not null default '{}'::jsonb,
  source text,
  status text not null default 'pending',
  starts_at timestamptz,
  fixture_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_date, match_name, prediction, is_vip)
);

create index if not exists daily_games_game_date_idx on daily_games (game_date);
create index if not exists daily_games_visibility_idx on daily_games (game_date, is_vip);
alter table daily_games add column if not exists result_payload jsonb;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text unique,
  name text,
  referral_code text,
  is_premium boolean not null default false,
  premium_until timestamptz,
  telegram_vip_invite_link text,
  paystack_reference text,
  referral_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table app_users add column if not exists is_premium boolean not null default false;
alter table app_users add column if not exists premium_until timestamptz;
alter table app_users add column if not exists telegram_vip_invite_link text;
alter table app_users add column if not exists paystack_reference text;
alter table app_users add column if not exists referral_points integer not null default 0;

create unique index if not exists app_users_email_unique_idx
  on app_users (lower(email))
  where email is not null and email <> '';

create unique index if not exists app_users_phone_unique_idx
  on app_users (phone)
  where phone is not null and phone <> '';

create table if not exists platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
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
