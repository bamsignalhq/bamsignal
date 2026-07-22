-- Sprint 4 — Messaging, Notifications, Presence & Realtime.
-- Extends app_messages / app_chat_threads; does not replace them.

-- Conversation lifecycle state machine (per member per conversation)
create table if not exists member_conversation_state (
  conversation_id text not null,
  member_id uuid not null references app_member_profiles(id) on delete cascade,
  peer_member_id uuid null references app_member_profiles(id) on delete set null,
  status text not null default 'active'
    check (status in (
      'pending', 'active', 'archived', 'muted', 'blocked', 'reported', 'closed', 'deleted'
    )),
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (conversation_id, member_id)
);

create index if not exists member_conversation_state_member_idx
  on member_conversation_state (member_id, updated_at desc);
create index if not exists member_conversation_state_status_idx
  on member_conversation_state (status, updated_at desc);

create table if not exists member_conversation_lifecycle_log (
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
  constraint member_conversation_lifecycle_log_log_id_key unique (log_id)
);

create index if not exists member_conversation_lifecycle_log_conv_idx
  on member_conversation_lifecycle_log (conversation_id, occurred_at desc);

-- Message lifecycle (extends app_messages by message id)
create table if not exists member_message_state (
  message_id text not null,
  conversation_id text not null,
  sender_member_id uuid null references app_member_profiles(id) on delete set null,
  idempotency_key text not null,
  status text not null default 'queued'
    check (status in (
      'queued', 'sending', 'sent', 'delivered', 'read', 'edited', 'deleted', 'failed', 'expired'
    )),
  body_preview text not null default '',
  retry_count integer not null default 0,
  created_at timestamptz not null default now(),
  delivered_at timestamptz null,
  read_at timestamptz null,
  edited_at timestamptz null,
  deleted_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  primary key (message_id, conversation_id),
  constraint member_message_state_idempotency_key unique (idempotency_key)
);

create index if not exists member_message_state_conv_idx
  on member_message_state (conversation_id, created_at desc);
create index if not exists member_message_state_status_idx
  on member_message_state (status, created_at desc);

create table if not exists member_message_lifecycle_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  message_id text not null,
  conversation_id text not null,
  previous_status text not null,
  new_status text not null,
  reason_code text not null default 'system',
  reason text not null default '',
  actor text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint member_message_lifecycle_log_log_id_key unique (log_id)
);

create index if not exists member_message_lifecycle_log_msg_idx
  on member_message_lifecycle_log (message_id, conversation_id, occurred_at desc);

-- Delivery / offline queue
create table if not exists member_message_delivery_queue (
  id uuid primary key default gen_random_uuid(),
  queue_id text not null,
  message_id text not null,
  conversation_id text not null,
  recipient_member_id uuid null references app_member_profiles(id) on delete set null,
  idempotency_key text not null,
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'delivered', 'failed', 'expired')),
  retry_count integer not null default 0,
  next_retry_at timestamptz null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_message_delivery_queue_queue_id_key unique (queue_id),
  constraint member_message_delivery_queue_idempotency_key unique (idempotency_key)
);

create index if not exists member_message_delivery_queue_status_idx
  on member_message_delivery_queue (status, next_retry_at);

-- Read receipts / last-read pointer
create table if not exists member_conversation_read_state (
  conversation_id text not null,
  member_id uuid not null references app_member_profiles(id) on delete cascade,
  last_read_message_id text null,
  last_read_at timestamptz null,
  unread_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (conversation_id, member_id)
);

-- Presence
create table if not exists member_presence_state (
  member_id uuid primary key references app_member_profiles(id) on delete cascade,
  status text not null default 'offline'
    check (status in ('online', 'offline', 'invisible')),
  last_seen_at timestamptz null,
  active_device_id text null,
  last_activity_at timestamptz null,
  heartbeat_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Typing (short-lived; DB for observability/replay)
create table if not exists member_typing_state (
  conversation_id text not null,
  member_id uuid not null references app_member_profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (conversation_id, member_id)
);

create index if not exists member_typing_state_expires_idx
  on member_typing_state (expires_at);

-- Member notification outbox (backend; distinct from enterprise notification_messages)
create table if not exists member_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  notification_id text not null,
  member_id uuid not null references app_member_profiles(id) on delete cascade,
  category text not null
    check (category in (
      'message', 'match', 'subscription', 'payment', 'safety', 'moderation', 'system', 'referral'
    )),
  channel text not null default 'in_app'
    check (channel in ('in_app', 'push', 'email', 'sms')),
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed')),
  idempotency_key text not null,
  title text not null default '',
  body text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz null,
  constraint member_notification_outbox_notification_id_key unique (notification_id),
  constraint member_notification_outbox_idempotency_key unique (idempotency_key)
);

create index if not exists member_notification_outbox_member_idx
  on member_notification_outbox (member_id, created_at desc);

create table if not exists member_notification_preferences (
  member_id uuid not null references app_member_profiles(id) on delete cascade,
  category text not null,
  channel text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (member_id, category, channel)
);

-- Media upload reliability
create table if not exists member_message_media_uploads (
  id uuid primary key default gen_random_uuid(),
  upload_id text not null,
  message_id text null,
  member_id uuid null references app_member_profiles(id) on delete set null,
  storage_path text null,
  content_type text null,
  status text not null default 'pending'
    check (status in ('pending', 'uploading', 'verified', 'failed')),
  idempotency_key text not null,
  retry_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  verified_at timestamptz null,
  constraint member_message_media_uploads_upload_id_key unique (upload_id),
  constraint member_message_media_uploads_idempotency_key unique (idempotency_key)
);

-- Moderation hooks (no AI — pipeline ready)
create table if not exists member_messaging_moderation_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  kind text not null
    check (kind in (
      'report_message', 'block_conversation', 'safety_review', 'spam_hook', 'ai_hook_placeholder'
    )),
  conversation_id text null,
  message_id text null,
  reporter_member_id uuid null references app_member_profiles(id) on delete set null,
  target_member_id uuid null references app_member_profiles(id) on delete set null,
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint member_messaging_moderation_events_event_id_key unique (event_id)
);

create index if not exists member_messaging_moderation_events_status_idx
  on member_messaging_moderation_events (status, created_at desc);

-- Realtime event bus (internal publisher)
create table if not exists member_realtime_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null,
  idempotency_key text null,
  conversation_id text null,
  message_id text null,
  member_id uuid null references app_member_profiles(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint member_realtime_events_event_id_key unique (event_id)
);

create index if not exists member_realtime_events_type_idx
  on member_realtime_events (event_type, occurred_at desc);
create index if not exists member_realtime_events_conv_idx
  on member_realtime_events (conversation_id, occurred_at desc);

drop trigger if exists member_conversation_state_touch on member_conversation_state;
create trigger member_conversation_state_touch
  before update on member_conversation_state
  for each row execute function passport_touch_updated_at();

drop trigger if exists member_message_delivery_queue_touch on member_message_delivery_queue;
create trigger member_message_delivery_queue_touch
  before update on member_message_delivery_queue
  for each row execute function passport_touch_updated_at();

drop trigger if exists member_presence_state_touch on member_presence_state;
create trigger member_presence_state_touch
  before update on member_presence_state
  for each row execute function passport_touch_updated_at();

alter table member_conversation_state enable row level security;
alter table member_conversation_lifecycle_log enable row level security;
alter table member_message_state enable row level security;
alter table member_message_lifecycle_log enable row level security;
alter table member_message_delivery_queue enable row level security;
alter table member_conversation_read_state enable row level security;
alter table member_presence_state enable row level security;
alter table member_typing_state enable row level security;
alter table member_notification_outbox enable row level security;
alter table member_notification_preferences enable row level security;
alter table member_message_media_uploads enable row level security;
alter table member_messaging_moderation_events enable row level security;
alter table member_realtime_events enable row level security;
