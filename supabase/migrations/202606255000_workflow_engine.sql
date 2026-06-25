-- Automation & Workflow Engine™ — institutional operational automation layer.

create table if not exists workflow_definitions (
  id uuid primary key default gen_random_uuid(),
  workflow_ref text not null unique,
  workflow_id text not null,
  title text not null,
  status text not null default 'draft',
  owner_email text,
  last_run_at timestamptz,
  run_count integer not null default 0,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists workflow_definitions_status_idx on workflow_definitions (status, workflow_id);

create table if not exists workflow_triggers (
  id uuid primary key default gen_random_uuid(),
  trigger_ref text not null unique,
  workflow_id text not null,
  trigger_type text not null,
  config jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists workflow_triggers_workflow_idx on workflow_triggers (workflow_id, trigger_type);

create table if not exists workflow_actions (
  id uuid primary key default gen_random_uuid(),
  action_ref text not null unique,
  workflow_id text not null,
  action_type text not null,
  sequence integer not null default 1,
  config jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists workflow_actions_workflow_idx on workflow_actions (workflow_id, sequence);

create table if not exists workflow_run_history (
  id uuid primary key default gen_random_uuid(),
  history_ref text not null unique,
  workflow_id text not null,
  status text not null,
  triggered_by text not null,
  trigger_type text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  result_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists workflow_run_history_started_idx on workflow_run_history (started_at desc, status);

create table if not exists workflow_step_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  action_type text not null,
  status text not null,
  detail text not null,
  executed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists workflow_step_logs_run_idx on workflow_step_logs (run_id, executed_at);

create table if not exists workflow_automation_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_ref text not null unique,
  label text not null,
  workflow_count integer not null default 0,
  active_count integer not null default 0,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_uuid uuid,
  updated_by uuid
);

create index if not exists workflow_automation_snapshots_created_idx on workflow_automation_snapshots (created_at desc);
