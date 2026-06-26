-- Platform Health Center™ — incident, alert, and snapshot persistence.

create table if not exists public.platform_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  overall_status text not null check (overall_status in ('healthy', 'warning', 'critical')),
  healthy_count integer not null default 0,
  warning_count integer not null default 0,
  critical_count integer not null default 0,
  services jsonb not null default '[]'::jsonb,
  live_probe boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_health_incidents (
  id uuid primary key default gen_random_uuid(),
  incident_ref text not null unique,
  service_id text not null,
  severity text not null check (severity in ('healthy', 'warning', 'critical')),
  status text not null check (status in ('active', 'acknowledged', 'resolved')),
  title text not null,
  summary text not null,
  opened_at timestamptz not null,
  resolved_at timestamptz,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_health_alerts (
  id uuid primary key default gen_random_uuid(),
  service_id text not null,
  threshold_ms integer not null default 0,
  failure_threshold integer not null default 1,
  escalation_level integer not null default 1,
  channels text[] not null default '{}',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_health_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.platform_health_incidents(id) on delete cascade,
  actor text not null,
  note text,
  acknowledged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists platform_health_incidents_status_idx on public.platform_health_incidents (status);
create index if not exists platform_health_incidents_service_idx on public.platform_health_incidents (service_id);
create index if not exists platform_health_alerts_service_idx on public.platform_health_alerts (service_id);
