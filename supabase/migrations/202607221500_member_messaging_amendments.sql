-- Sprint 4 amendments — membership, sequence numbers, notification event bus.

-- Per-participant conversation membership (never global conversation state)
create table if not exists member_conversation_membership (
  conversation_id text not null,
  member_id uuid not null references app_member_profiles(id) on delete cascade,
  peer_member_id uuid null references app_member_profiles(id) on delete set null,
  member_status text not null default 'joined'
    check (member_status in (
      'joined', 'left', 'removed', 'blocked', 'muted', 'hidden', 'archived'
    )),
  unread_count integer not null default 0,
  last_read_message_id text null,
  last_read_seq bigint null,
  last_read_at timestamptz null,
  notification_enabled boolean not null default true,
  pinned boolean not null default false,
  favourited boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (conversation_id, member_id)
);

create index if not exists member_conversation_membership_member_idx
  on member_conversation_membership (member_id, updated_at desc);
create index if not exists member_conversation_membership_status_idx
  on member_conversation_membership (member_status, updated_at desc);

create table if not exists member_conversation_membership_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  conversation_id text not null,
  member_id uuid null references app_member_profiles(id) on delete set null,
  previous_status text not null,
  new_status text not null,
  reason_code text not null default 'system',
  reason text not null default '',
  actor text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint member_conversation_membership_log_log_id_key unique (log_id)
);

create index if not exists member_conversation_membership_log_conv_idx
  on member_conversation_membership_log (conversation_id, member_id, occurred_at desc);

-- Monotonic message sequence per conversation
create table if not exists member_conversation_sequence (
  conversation_id text primary key,
  next_seq bigint not null default 1,
  updated_at timestamptz not null default now()
);

alter table member_message_state
  add column if not exists sequence_number bigint null;

create unique index if not exists member_message_state_conv_seq_idx
  on member_message_state (conversation_id, sequence_number)
  where sequence_number is not null;

create index if not exists member_message_state_seq_lookup_idx
  on member_message_state (conversation_id, sequence_number desc);

-- Notification event bus (independent from messaging realtime events)
create table if not exists member_notification_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null,
  idempotency_key text null,
  notification_id text null,
  member_id uuid null references app_member_profiles(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint member_notification_events_event_id_key unique (event_id)
);

create index if not exists member_notification_events_type_idx
  on member_notification_events (event_type, occurred_at desc);
create index if not exists member_notification_events_member_idx
  on member_notification_events (member_id, occurred_at desc);

drop trigger if exists member_conversation_membership_touch on member_conversation_membership;
create trigger member_conversation_membership_touch
  before update on member_conversation_membership
  for each row execute function passport_touch_updated_at();

alter table member_conversation_membership enable row level security;
alter table member_conversation_membership_log enable row level security;
alter table member_conversation_sequence enable row level security;
alter table member_notification_events enable row level security;
