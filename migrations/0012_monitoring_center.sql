-- Enterprise Monitoring, Observability & Incident Center™ — institutional NOC layer.

create table if not exists monitoring_services (
  id uuid primary key default gen_random_uuid(),
  service_id text not null unique,
  label text not null,
  section_id text not null,
  critical boolean not null default false,
  status text not null default 'unknown',
  availability numeric(5, 2),
  latency_ms numeric(10, 2),
  error_rate numeric(5, 2),
  checked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists monitoring_services_section_idx on monitoring_services (section_id, status);

create table if not exists service_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  service_id text not null,
  status text not null,
  metrics jsonb not null default '{}'::jsonb,
  snapshot_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists service_health_snapshots_service_idx
  on service_health_snapshots (service_id, snapshot_at desc);

create table if not exists monitoring_incidents (
  id uuid primary key default gen_random_uuid(),
  incident_ref text not null unique,
  severity text not null,
  status text not null default 'active',
  title text not null,
  affected_services text[] not null default '{}',
  root_cause text,
  mitigation text,
  resolution text,
  postmortem text,
  owner_email text,
  timeline jsonb not null default '[]'::jsonb,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists monitoring_incidents_status_idx on monitoring_incidents (status, opened_at desc);

create table if not exists monitoring_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_ref text not null unique,
  severity text not null,
  service_id text not null,
  message text not null,
  status text not null default 'open',
  acknowledged_by text,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  escalation_level integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists monitoring_alerts_status_idx on monitoring_alerts (status, severity, created_at desc);

create table if not exists maintenance_windows (
  id uuid primary key default gen_random_uuid(),
  window_ref text not null unique,
  title text not null,
  affected_services text[] not null default '{}',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists maintenance_windows_schedule_idx on maintenance_windows (starts_at, ends_at);

create table if not exists metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null,
  metric_value numeric not null,
  metric_unit text,
  service_id text,
  snapshot_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists metric_snapshots_key_idx on metric_snapshots (metric_key, snapshot_at desc);
