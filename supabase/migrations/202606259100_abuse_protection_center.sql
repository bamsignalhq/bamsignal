-- Abuse Protection Center™ — abuse monitoring, rate limits, blocks, and forensics.

create table if not exists public.abuse_monitor_snapshots (
  id uuid primary key default gen_random_uuid(),
  monitor_id text not null,
  event_count_24h integer not null default 0,
  blocked_count_24h integer not null default 0,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  trend text not null default 'flat' check (trend in ('up', 'down', 'flat')),
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.abuse_rate_limits (
  id uuid primary key default gen_random_uuid(),
  dimension text not null,
  endpoint text not null,
  limit_per_window integer not null,
  window_minutes integer not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.abuse_blocks (
  id uuid primary key default gen_random_uuid(),
  target text not null,
  target_type text not null,
  block_type text not null check (block_type in ('temporary', 'permanent')),
  reason text not null,
  monitor_id text not null,
  country text,
  blocked_at timestamptz not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.abuse_forensics (
  id uuid primary key default gen_random_uuid(),
  target text not null,
  risk_score integer not null default 0,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  linked_accounts jsonb not null default '[]'::jsonb,
  devices jsonb not null default '[]'::jsonb,
  sessions jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.abuse_reports (
  id uuid primary key default gen_random_uuid(),
  period text not null check (period in ('daily', 'weekly', 'monthly')),
  total_blocked integer not null default 0,
  total_suspicious integer not null default 0,
  top_monitor text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists abuse_blocks_target_idx on public.abuse_blocks (target);
create index if not exists abuse_blocks_block_type_idx on public.abuse_blocks (block_type);
create index if not exists abuse_rate_limits_endpoint_idx on public.abuse_rate_limits (endpoint);
create index if not exists abuse_forensics_target_idx on public.abuse_forensics (target);
