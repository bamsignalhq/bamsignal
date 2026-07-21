-- Launch Command Center™ — operational command room for launch readiness.

create table if not exists launch_command_readiness_scores (
  id uuid primary key default gen_random_uuid(),
  score_domain text not null,
  label text not null,
  score integer not null,
  status text not null,
  evaluated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_command_readiness_scores_domain_idx
  on launch_command_readiness_scores (score_domain, evaluated_at desc);

create table if not exists launch_command_blockers (
  id uuid primary key default gen_random_uuid(),
  blocker_ref text not null unique,
  title text not null,
  severity text not null,
  domain text not null,
  status text not null default 'open',
  owner_email text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_command_blockers_severity_idx
  on launch_command_blockers (severity, status, opened_at desc);

create table if not exists launch_command_section_snapshots (
  id uuid primary key default gen_random_uuid(),
  section_id text not null,
  status text not null,
  headline text not null,
  metrics jsonb not null default '[]'::jsonb,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_command_section_snapshots_section_idx
  on launch_command_section_snapshots (section_id, captured_at desc);

create table if not exists launch_command_incidents (
  id uuid primary key default gen_random_uuid(),
  incident_ref text not null unique,
  title text not null,
  severity text not null,
  status text not null default 'active',
  service_name text not null,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_command_incidents_status_idx
  on launch_command_incidents (status, opened_at desc);

create table if not exists launch_command_deployments (
  id uuid primary key default gen_random_uuid(),
  deploy_ref text not null unique,
  environment text not null,
  version text not null,
  status text not null,
  deployed_at timestamptz not null default now(),
  deployed_by text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_command_deployments_env_idx
  on launch_command_deployments (environment, deployed_at desc);
