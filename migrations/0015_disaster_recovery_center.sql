-- Business Continuity & Disaster Recovery Center™ — institutional resilience layer.

create table if not exists recovery_backup_records (
  id uuid primary key default gen_random_uuid(),
  backup_ref text not null unique,
  category_id text not null,
  status text not null default 'pending',
  last_backup_at timestamptz not null default now(),
  frequency_label text not null,
  retention_days integer not null,
  verified_at timestamptz,
  size_label text,
  next_scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists recovery_backup_records_category_idx on recovery_backup_records (category_id, status);

create table if not exists recovery_restore_history (
  id uuid primary key default gen_random_uuid(),
  restore_ref text not null unique,
  mode_id text not null,
  category_id text not null,
  status text not null default 'in-progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  verified_at timestamptz,
  initiated_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists recovery_restore_history_status_idx on recovery_restore_history (status, started_at desc);

create table if not exists recovery_playbook_records (
  id uuid primary key default gen_random_uuid(),
  playbook_ref text not null unique,
  playbook_id text not null,
  title text not null,
  owner_email text,
  status text not null default 'draft',
  rto_minutes integer not null,
  rpo_minutes integer not null,
  last_tested_at timestamptz,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists recovery_playbook_records_playbook_idx on recovery_playbook_records (playbook_id, status);

create table if not exists recovery_test_runs (
  id uuid primary key default gen_random_uuid(),
  test_ref text not null unique,
  playbook_id text not null,
  status text not null default 'scheduled',
  run_at timestamptz not null,
  duration_minutes integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists recovery_test_runs_playbook_idx on recovery_test_runs (playbook_id, run_at desc);

create table if not exists recovery_critical_systems (
  id uuid primary key default gen_random_uuid(),
  system_ref text not null unique,
  name text not null,
  tier text not null,
  rto_minutes integer not null,
  backup_category_id text not null,
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists recovery_critical_systems_tier_idx on recovery_critical_systems (tier, last_verified_at desc);

create table if not exists recovery_dependency_links (
  id uuid primary key default gen_random_uuid(),
  link_ref text not null unique,
  upstream text not null,
  downstream text not null,
  critical boolean not null default false,
  failover_available boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists recovery_dependency_links_critical_idx on recovery_dependency_links (critical, upstream);
