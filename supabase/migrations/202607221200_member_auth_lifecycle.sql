-- Sprint 2 — Authentication & Account Lifecycle (mirror of 0058_member_auth_lifecycle.sql)

-- Append-only authentication security events
create table if not exists member_auth_security_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null,
  auth_user_id uuid null,
  profile_id uuid null references app_member_profiles(id) on delete set null,
  user_key text null,
  session_id text null,
  device_id text null,
  ip text null,
  user_agent text null,
  reason_code text null,
  summary text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint member_auth_security_events_event_id_key unique (event_id)
);

create index if not exists member_auth_security_events_profile_idx
  on member_auth_security_events (profile_id, occurred_at desc);
create index if not exists member_auth_security_events_type_idx
  on member_auth_security_events (event_type, occurred_at desc);
create index if not exists member_auth_security_events_auth_user_idx
  on member_auth_security_events (auth_user_id, occurred_at desc);

create table if not exists member_auth_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  auth_user_id uuid not null,
  profile_id uuid null references app_member_profiles(id) on delete set null,
  device_id text null,
  device_name text null,
  platform text null,
  browser text null,
  ip text null,
  approximate_location text null,
  refresh_token_hash text null,
  status text not null default 'active'
    check (status in ('active', 'expired', 'revoked')),
  server_session_status text not null default 'active'
    check (server_session_status in (
      'active', 'revoked', 'expired', 'compromised', 'admin_revoked', 'device_removed'
    )),
  last_activity_at timestamptz not null default now(),
  expires_at timestamptz null,
  revoked_at timestamptz null,
  revocation_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_auth_sessions_session_id_key unique (session_id)
);

create index if not exists member_auth_sessions_profile_idx
  on member_auth_sessions (profile_id, status, last_activity_at desc);
create index if not exists member_auth_sessions_auth_user_idx
  on member_auth_sessions (auth_user_id, status, last_activity_at desc);

create table if not exists member_auth_devices (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  auth_user_id uuid not null,
  profile_id uuid null references app_member_profiles(id) on delete set null,
  device_name text null,
  platform text null,
  browser text null,
  push_token text null,
  trusted boolean not null default false,
  revoked boolean not null default false,
  session_count integer not null default 0,
  current_session_id text null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_auth_devices_device_user_key unique (device_id, auth_user_id)
);

create index if not exists member_auth_devices_profile_idx
  on member_auth_devices (profile_id, last_seen_at desc);

create table if not exists member_account_lifecycle_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  profile_id uuid null references app_member_profiles(id) on delete set null,
  auth_user_id uuid null,
  previous_status text not null,
  new_status text not null,
  reason_code text not null default 'system',
  reason text not null default '',
  actor text not null default 'system',
  actor_role text not null default 'system'
    check (actor_role in ('member', 'admin', 'system')),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint member_account_lifecycle_log_log_id_key unique (log_id)
);

create index if not exists member_account_lifecycle_log_profile_idx
  on member_account_lifecycle_log (profile_id, occurred_at desc);

create table if not exists member_auth_recovery_tokens (
  id uuid primary key default gen_random_uuid(),
  token_id text not null,
  recovery_kind text not null
    check (recovery_kind in ('pin_reset', 'forgot_username', 'lost_device', 'email_recovery', 'admin_recovery')),
  auth_user_id uuid null,
  profile_id uuid null references app_member_profiles(id) on delete set null,
  contact_hash text not null,
  token_hash text not null,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'expired', 'revoked')),
  expires_at timestamptz not null,
  completed_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint member_auth_recovery_tokens_token_id_key unique (token_id)
);

create index if not exists member_auth_recovery_tokens_contact_idx
  on member_auth_recovery_tokens (contact_hash, recovery_kind, status);

create table if not exists member_account_retention (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references app_member_profiles(id) on delete cascade,
  retention_class text not null default 'soft_deleted'
    check (retention_class in ('soft_deleted', 'grace_period', 'permanently_deleted', 'archived')),
  retain_until timestamptz null,
  policy_label text not null default 'default',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_account_retention_profile_key unique (profile_id)
);

drop trigger if exists member_auth_sessions_touch on member_auth_sessions;
create trigger member_auth_sessions_touch
  before update on member_auth_sessions
  for each row execute function passport_touch_updated_at();

drop trigger if exists member_auth_devices_touch on member_auth_devices;
create trigger member_auth_devices_touch
  before update on member_auth_devices
  for each row execute function passport_touch_updated_at();

drop trigger if exists member_account_retention_touch on member_account_retention;
create trigger member_account_retention_touch
  before update on member_account_retention
  for each row execute function passport_touch_updated_at();

alter table member_auth_security_events enable row level security;
alter table member_auth_sessions enable row level security;
alter table member_auth_devices enable row level security;
alter table member_account_lifecycle_log enable row level security;
alter table member_auth_recovery_tokens enable row level security;
alter table member_account_retention enable row level security;
