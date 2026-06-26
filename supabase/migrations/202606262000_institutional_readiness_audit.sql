-- Institutional Readiness Audit — audit domains, trends, and exports.

create table if not exists readiness_audit_domains (
  id uuid primary key default gen_random_uuid(),
  domain_ref text not null unique,
  domain_id text not null,
  score integer not null default 0,
  status text not null default 'healthy',
  trend_direction text not null default 'flat',
  trend_delta numeric not null default 0,
  blocker_count integer not null default 0,
  summary text not null,
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists readiness_audit_domains_domain_idx
  on readiness_audit_domains (domain_id, collected_at desc);

create table if not exists readiness_trend_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_ref text not null unique,
  overall_score integer not null default 0,
  previous_score integer not null default 0,
  delta_percent numeric not null default 0,
  direction text not null default 'flat',
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists readiness_trend_snapshots_recorded_idx
  on readiness_trend_snapshots (recorded_at desc);

create table if not exists readiness_audit_exports (
  id uuid primary key default gen_random_uuid(),
  export_ref text not null unique,
  export_type text not null,
  title text not null,
  summary text not null,
  exported_at timestamptz not null default now(),
  actor text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists readiness_audit_exports_type_idx
  on readiness_audit_exports (export_type, exported_at desc);
