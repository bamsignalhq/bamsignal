-- Security Operations Center — centralized platform security events.

create table if not exists security_ops_events (
  id uuid primary key default gen_random_uuid(),
  event_ref text not null unique,
  module_id text not null,
  severity text not null,
  title text not null,
  actor text not null,
  target text not null,
  detail text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists security_ops_events_module_idx on security_ops_events (module_id, occurred_at desc);

create table if not exists security_ops_scores (
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

create index if not exists security_ops_scores_domain_idx on security_ops_scores (score_domain, evaluated_at desc);

create table if not exists security_ops_incidents (
  id uuid primary key default gen_random_uuid(),
  incident_ref text not null unique,
  title text not null,
  status text not null default 'open',
  severity text not null,
  owner_email text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  timeline jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists security_ops_incidents_status_idx on security_ops_incidents (status, opened_at desc);

create table if not exists security_ops_actions (
  id uuid primary key default gen_random_uuid(),
  tool_id text not null,
  target text not null,
  actor text not null,
  result text not null,
  executed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid
);

create index if not exists security_ops_actions_tool_idx on security_ops_actions (tool_id, executed_at desc);

create table if not exists security_ops_timeline (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references security_ops_incidents(id) on delete cascade,
  actor text not null,
  note text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid
);

create index if not exists security_ops_timeline_incident_idx on security_ops_timeline (incident_id, occurred_at desc);
