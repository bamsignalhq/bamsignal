-- Pass 1: Discover conversation unlock (one target profile, permanent).
-- Does not grant Premium or change daily Signal limits.

create table if not exists app_conversation_unlocks (
  id uuid primary key default gen_random_uuid(),
  buyer_user_key text not null,
  target_profile_id text not null,
  match_id text,
  source_payment_ref text,
  actor text not null default 'payment',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint app_conversation_unlocks_target_nonempty check (char_length(trim(target_profile_id)) > 0)
);

create unique index if not exists app_conversation_unlocks_buyer_target_uidx
  on app_conversation_unlocks (buyer_user_key, target_profile_id);

create unique index if not exists app_conversation_unlocks_payment_uidx
  on app_conversation_unlocks (source_payment_ref)
  where source_payment_ref is not null and source_payment_ref <> '';

create index if not exists app_conversation_unlocks_buyer_idx
  on app_conversation_unlocks (buyer_user_key, created_at desc);

create table if not exists discover_product_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null
    check (event_type in (
      'CONVERSATION_UNLOCKED',
      'PROFILE_BOOST_ACTIVATED',
      'PAYMENT_COMPLETED'
    )),
  buyer_user_key text,
  target_profile_id text,
  product_id text,
  source_payment_ref text,
  actor text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discover_product_events_buyer_idx
  on discover_product_events (buyer_user_key, created_at desc);

create unique index if not exists discover_product_events_payment_type_uidx
  on discover_product_events (source_payment_ref, event_type)
  where source_payment_ref is not null
    and source_payment_ref <> ''
    and event_type in ('CONVERSATION_UNLOCKED', 'PROFILE_BOOST_ACTIVATED');
