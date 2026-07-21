-- Enterprise API Center — live API operations dashboard.

create table if not exists enterprise_api_endpoints (
  id uuid primary key default gen_random_uuid(),
  endpoint_ref text not null unique,
  path text not null,
  method text not null,
  status text not null default 'healthy',
  latency_ms integer not null default 0,
  requests_per_min integer not null default 0,
  error_count integer not null default 0,
  error_rate numeric not null default 0,
  rate_limit_per_min integer not null default 0,
  authentication text not null default 'public',
  payload_size_kb numeric not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists enterprise_api_endpoints_status_idx
  on enterprise_api_endpoints (status, updated_at desc);

create table if not exists enterprise_api_operations_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_ref text not null unique,
  operations_score integer not null default 0,
  endpoint_count integer not null default 0,
  total_requests_per_min integer not null default 0,
  avg_latency_ms integer not null default 0,
  error_rate_percent numeric not null default 0,
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create table if not exists enterprise_api_tool_runs (
  id uuid primary key default gen_random_uuid(),
  tool_id text not null,
  status text not null default 'completed',
  summary text not null,
  target text,
  ran_at timestamptz not null default now(),
  actor text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists enterprise_api_tool_runs_tool_idx
  on enterprise_api_tool_runs (tool_id, ran_at desc);

create table if not exists enterprise_api_failed_jobs (
  id uuid primary key default gen_random_uuid(),
  job_ref text not null unique,
  endpoint_path text not null,
  method text not null,
  failure_reason text not null,
  attempts integer not null default 0,
  status text not null default 'pending',
  failed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists enterprise_api_failed_jobs_status_idx
  on enterprise_api_failed_jobs (status, failed_at desc);
