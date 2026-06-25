-- Institutional API Platform™ — standardized external integration layer.

create table if not exists api_catalog_entries (
  id uuid primary key default gen_random_uuid(),
  catalog_ref text not null unique,
  method text not null,
  path text not null,
  domain_id text not null,
  version text not null default 'v1',
  description text not null,
  authenticated boolean not null default true,
  deprecated boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists api_catalog_entries_domain_idx on api_catalog_entries (domain_id, version);

create table if not exists api_clients (
  id uuid primary key default gen_random_uuid(),
  client_ref text not null unique,
  name text not null,
  environment text not null default 'production',
  scopes text[] not null default '{}',
  active boolean not null default true,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists api_clients_active_idx on api_clients (active, environment);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  key_ref text not null unique,
  client_id uuid references api_clients(id) on delete cascade,
  status text not null default 'active',
  scopes text[] not null default '{}',
  expires_at timestamptz,
  rotated_at timestamptz,
  ip_restrictions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists api_keys_client_idx on api_keys (client_id, status);

create table if not exists api_webhooks (
  id uuid primary key default gen_random_uuid(),
  webhook_ref text not null unique,
  provider_id text not null,
  endpoint text not null,
  events text[] not null default '{}',
  active boolean not null default true,
  last_delivery_at timestamptz,
  failure_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists api_webhooks_provider_idx on api_webhooks (provider_id, active);

create table if not exists api_rate_limits (
  id uuid primary key default gen_random_uuid(),
  limit_ref text not null unique,
  client_id uuid references api_clients(id) on delete set null,
  domain_id text,
  requests_per_minute integer not null,
  burst_limit integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists api_rate_limits_active_idx on api_rate_limits (active, domain_id);

create table if not exists api_usage_snapshots (
  id uuid primary key default gen_random_uuid(),
  domain_id text not null,
  request_count bigint not null default 0,
  error_count bigint not null default 0,
  avg_latency_ms numeric(10, 2),
  snapshot_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists api_usage_snapshots_domain_idx on api_usage_snapshots (domain_id, snapshot_at desc);
