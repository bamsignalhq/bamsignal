-- Backup & Disaster Recovery Center™ — operational disaster recovery tables.

create table if not exists public.disaster_backup_monitors (
  id text primary key,
  label text not null,
  status text not null check (status in ('healthy', 'warning', 'failed', 'pending')),
  last_backup_at timestamptz not null,
  last_verified_at timestamptz,
  size_label text not null,
  retention_days integer not null default 30,
  frequency_label text not null,
  next_scheduled_at timestamptz,
  snapshot_ref text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.disaster_recovery_operations (
  id uuid primary key default gen_random_uuid(),
  operation_id text not null,
  target text not null,
  status text not null check (status in ('queued', 'running', 'completed', 'failed')),
  initiated_by text not null,
  initiated_at timestamptz not null default now(),
  completed_at timestamptz,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists public.disaster_recovery_plans (
  id text primary key,
  label text not null,
  status text not null check (status in ('ready', 'draft', 'tested')),
  rto_minutes integer not null,
  rpo_minutes integer not null,
  owner text not null,
  last_tested_at timestamptz,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.disaster_recovery_reports (
  id uuid primary key default gen_random_uuid(),
  metric_id text not null,
  value text not null,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists disaster_recovery_operations_initiated_at_idx
  on public.disaster_recovery_operations (initiated_at desc);
