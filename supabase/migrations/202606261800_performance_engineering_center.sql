-- Performance Engineering Center — track snapshots, reports, and tool runs.

create table if not exists performance_track_snapshots (
  id uuid primary key default gen_random_uuid(),
  track_ref text not null unique,
  track_id text not null,
  current_value numeric not null default 0,
  previous_release_value numeric not null default 0,
  days_30_value numeric not null default 0,
  days_90_value numeric not null default 0,
  unit text not null default '',
  status text not null default 'healthy',
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists performance_track_snapshots_track_idx
  on performance_track_snapshots (track_id, collected_at desc);

create table if not exists performance_engineering_reports (
  id uuid primary key default gen_random_uuid(),
  report_ref text not null unique,
  report_type text not null,
  title text not null,
  metric_ref text not null,
  delta_percent numeric not null default 0,
  detail text not null,
  priority text not null default 'medium',
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists performance_engineering_reports_type_idx
  on performance_engineering_reports (report_type, generated_at desc);

create table if not exists performance_tool_runs (
  id uuid primary key default gen_random_uuid(),
  tool_id text not null,
  status text not null default 'completed',
  summary text not null,
  ran_at timestamptz not null default now(),
  actor text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists performance_tool_runs_tool_idx
  on performance_tool_runs (tool_id, ran_at desc);
