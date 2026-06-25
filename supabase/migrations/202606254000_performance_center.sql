-- Performance, Capacity & Scalability Center™ — institutional capacity planning layer.

create table if not exists performance_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  metric_ref text not null unique,
  metric_id text not null,
  section_id text not null,
  value numeric not null default 0,
  unit text not null,
  status text not null default 'healthy',
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists performance_metric_snapshots_section_idx on performance_metric_snapshots (section_id, metric_id, collected_at desc);

create table if not exists performance_api_profiles (
  id uuid primary key default gen_random_uuid(),
  endpoint_ref text not null unique,
  path text not null,
  method text not null,
  avg_response_ms integer not null default 0,
  p95_ms integer not null default 0,
  p99_ms integer not null default 0,
  throughput_per_min integer not null default 0,
  error_rate numeric not null default 0,
  status text not null default 'healthy',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists performance_api_profiles_p95_idx on performance_api_profiles (p95_ms desc, status);

create table if not exists performance_database_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_ref text not null unique,
  name text not null,
  query_count integer not null default 0,
  slow_query_count integer not null default 0,
  index_usage_percent integer not null default 0,
  cache_hit_percent integer not null default 0,
  connection_pool_used integer not null default 0,
  status text not null default 'healthy',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists performance_database_profiles_status_idx on performance_database_profiles (status, slow_query_count desc);

create table if not exists performance_capacity_plans (
  id uuid primary key default gen_random_uuid(),
  plan_ref text not null unique,
  domain text not null,
  section_id text not null,
  current_capacity numeric not null default 0,
  expected_capacity numeric not null default 0,
  projected_growth_percent integer not null default 0,
  remaining_headroom_percent integer not null default 100,
  recommendation text not null,
  status text not null default 'healthy',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists performance_capacity_plans_section_idx on performance_capacity_plans (section_id, remaining_headroom_percent);

create table if not exists performance_optimization_items (
  id uuid primary key default gen_random_uuid(),
  item_ref text not null unique,
  category_id text not null,
  section_id text not null,
  title text not null,
  detail text not null,
  impact text not null,
  status text not null default 'open',
  owner_email text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists performance_optimization_items_status_idx on performance_optimization_items (status, impact, opened_at desc);

create table if not exists performance_growth_forecasts (
  id uuid primary key default gen_random_uuid(),
  forecast_ref text not null unique,
  period_label text not null,
  member_count integer not null default 0,
  concurrent_sessions integer not null default 0,
  api_throughput integer not null default 0,
  storage_gb numeric not null default 0,
  bandwidth_tb numeric not null default 0,
  headroom_percent integer not null default 100,
  status text not null default 'healthy',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists performance_growth_forecasts_period_idx on performance_growth_forecasts (headroom_percent, member_count);
