-- Institutional Readiness Verification Engine™ — continuous subsystem readiness authority.

create table if not exists readiness_subsystem_contracts (
  id uuid primary key default gen_random_uuid(),
  contract_ref text not null unique,
  subsystem_id text not null,
  label text not null,
  dependencies jsonb not null default '[]'::jsonb,
  exposed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists readiness_subsystem_contracts_subsystem_idx on readiness_subsystem_contracts (subsystem_id);

create table if not exists readiness_verification_checks (
  id uuid primary key default gen_random_uuid(),
  check_ref text not null unique,
  subsystem_id text not null,
  check_type text not null,
  status text not null,
  message text not null,
  passed boolean not null default false,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists readiness_verification_checks_subsystem_idx on readiness_verification_checks (subsystem_id, check_type);

create table if not exists readiness_dependency_links (
  id uuid primary key default gen_random_uuid(),
  dependency_ref text not null unique,
  upstream_id text not null,
  downstream_id text not null,
  critical boolean not null default true,
  surfaced boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists readiness_dependency_links_downstream_idx on readiness_dependency_links (downstream_id, critical);

create table if not exists readiness_critical_issues (
  id uuid primary key default gen_random_uuid(),
  issue_ref text not null unique,
  subsystem_id text not null,
  title text not null,
  detail text not null,
  severity text not null default 'critical',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists readiness_critical_issues_subsystem_idx on readiness_critical_issues (subsystem_id, severity);

create table if not exists readiness_verification_runs (
  id uuid primary key default gen_random_uuid(),
  run_ref text not null unique,
  institution_readiness_score integer not null default 0,
  go_no_go_verdict text not null,
  subsystem_count integer not null default 0,
  passed_check_count integer not null default 0,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists readiness_verification_runs_generated_idx on readiness_verification_runs (generated_at desc);

create table if not exists readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_ref text not null unique,
  label text not null,
  institution_readiness_score integer not null default 0,
  healthy_count integer not null default 0,
  critical_count integer not null default 0,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_uuid uuid,
  updated_by uuid
);

create index if not exists readiness_snapshots_created_idx on readiness_snapshots (created_at desc);
