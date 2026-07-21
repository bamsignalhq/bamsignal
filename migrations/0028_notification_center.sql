-- Enterprise Notification Center™ — unified outbound communication tables.

create table if not exists public.notification_messages (
  id uuid primary key default gen_random_uuid(),
  message_ref text not null unique,
  channel text not null,
  queue text not null,
  status text not null check (status in ('queued', 'sending', 'delivered', 'read', 'failed', 'retried', 'cancelled')),
  template_id text not null,
  recipient_ref text not null,
  recipient_name text not null,
  subject text,
  preview text not null,
  triggered_by text not null,
  provider_response text,
  retry_count integer not null default 0,
  delivery_time_ms integer,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_templates (
  id text primary key,
  label text not null,
  channels jsonb not null default '[]'::jsonb,
  subject text,
  preview text not null,
  enabled boolean not null default true,
  sent_count integer not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_audit_log (
  id uuid primary key default gen_random_uuid(),
  message_ref text not null,
  triggered_by text not null,
  triggered_at timestamptz not null default now(),
  template_id text not null,
  channel text not null,
  recipient text not null,
  duration_ms integer not null default 0,
  provider_response text,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_dead_letter (
  id uuid primary key default gen_random_uuid(),
  message_ref text not null,
  channel text not null,
  failure_reason text not null,
  retry_count integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  moved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists notification_messages_status_idx on public.notification_messages (status);
create index if not exists notification_messages_channel_idx on public.notification_messages (channel);
create index if not exists notification_audit_log_triggered_at_idx on public.notification_audit_log (triggered_at desc);
