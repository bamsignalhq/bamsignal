-- Business Continuity & Disaster Recovery Center™ — institutional resilience layer.

create table if not exists incident_reports (
  id uuid primary key default gen_random_uuid(),
  incident_ref text not null unique,
  title text not null,
  severity text not null,
  status text not null default 'active',
  owner_email text not null,
  affected_systems text[] not null default '{}',
  timeline jsonb not null default '[]'::jsonb,
  resolution text,
  postmortem text,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists incident_reports_status_idx
  on incident_reports (status, started_at desc);

create table if not exists recovery_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  domain_id text not null,
  status text not null default 'ready',
  procedure_steps jsonb not null default '[]'::jsonb,
  owner_email text,
  last_tested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists recovery_plans_domain_idx on recovery_plans (domain_id);

create table if not exists backup_jobs (
  id uuid primary key default gen_random_uuid(),
  job_ref text not null unique,
  area_id text not null,
  status text not null default 'pending',
  health text not null default 'healthy',
  duration_seconds integer,
  verified boolean not null default false,
  restore_point timestamptz,
  frequency text not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists backup_jobs_area_idx on backup_jobs (area_id, completed_at desc);

create table if not exists system_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_at timestamptz not null default now(),
  overall_status text not null,
  services jsonb not null default '[]'::jsonb,
  dependencies jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists system_health_snapshots_at_idx
  on system_health_snapshots (snapshot_at desc);

create table if not exists provider_status (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null,
  status text not null,
  latency_ms integer,
  last_checked_at timestamptz not null default now(),
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create unique index if not exists provider_status_provider_idx on provider_status (provider_id);

create table if not exists continuity_exercises (
  id uuid primary key default gen_random_uuid(),
  exercise_ref text not null unique,
  title text not null,
  scenario_id text not null,
  status text not null default 'scheduled',
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  findings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists continuity_exercises_scheduled_idx
  on continuity_exercises (scheduled_at desc);
