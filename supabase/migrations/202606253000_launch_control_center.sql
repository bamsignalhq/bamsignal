-- Institutional Launch Control Center™ — final operational cockpit before public launch.

create table if not exists launch_readiness_items (
  id uuid primary key default gen_random_uuid(),
  readiness_ref text not null unique,
  domain_id text not null,
  status text not null default 'not-started',
  score integer not null default 0,
  owner_email text,
  last_reviewed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_readiness_items_domain_idx on launch_readiness_items (domain_id, status);

create table if not exists launch_checklist_entries (
  id uuid primary key default gen_random_uuid(),
  checklist_ref text not null unique,
  system_name text not null,
  domain_id text not null,
  status text not null default 'not-started',
  owner_email text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_checklist_entries_status_idx on launch_checklist_entries (status, domain_id);

create table if not exists launch_blockers (
  id uuid primary key default gen_random_uuid(),
  blocker_ref text not null unique,
  title text not null,
  severity text not null,
  domain_id text not null,
  status text not null default 'open',
  owner_email text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_blockers_status_idx on launch_blockers (status, severity, opened_at desc);

create table if not exists launch_risks (
  id uuid primary key default gen_random_uuid(),
  risk_ref text not null unique,
  title text not null,
  severity text not null,
  domain_id text not null,
  status text not null default 'open',
  mitigation text,
  owner_email text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_risks_status_idx on launch_risks (status, severity, opened_at desc);

create table if not exists launch_dependencies (
  id uuid primary key default gen_random_uuid(),
  dependency_ref text not null unique,
  name text not null,
  upstream text not null,
  downstream text not null,
  critical boolean not null default false,
  status text not null default 'not-started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_dependencies_critical_idx on launch_dependencies (critical, status);

create table if not exists launch_timeline_events (
  id uuid primary key default gen_random_uuid(),
  event_ref text not null unique,
  title text not null,
  phase text not null,
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  owner_email text,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists launch_timeline_events_schedule_idx on launch_timeline_events (scheduled_at, status);
