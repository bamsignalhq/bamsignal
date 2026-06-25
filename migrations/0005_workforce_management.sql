-- Operational Capacity & Workforce Management™ — institutional staffing layer.

create table if not exists workforce_profiles (
  id uuid primary key default gen_random_uuid(),
  consultant_id text,
  display_name text not null,
  role_id text not null,
  employment_status text not null default 'active',
  office text,
  region_id text not null,
  specialization text[] not null default '{}',
  languages text[] not null default '{}',
  availability text not null default 'available',
  max_active_journeys integer not null default 12,
  current_workload integer not null default 0,
  experience_level text not null default 'mid',
  certifications jsonb not null default '[]'::jsonb,
  performance_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists workforce_profiles_consultant_id_idx
  on workforce_profiles (consultant_id);

create index if not exists workforce_profiles_region_id_idx
  on workforce_profiles (region_id, employment_status);

create table if not exists workforce_availability (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references workforce_profiles (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Africa/Lagos',
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists workforce_availability_profile_idx
  on workforce_availability (profile_id, day_of_week);

create table if not exists consultant_capacity (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references workforce_profiles (id) on delete cascade,
  consultant_id text,
  capacity_state text not null,
  applications_assigned integer not null default 0,
  consultations_today integer not null default 0,
  consultations_this_week integer not null default 0,
  active_journeys integer not null default 0,
  follow_ups_pending integer not null default 0,
  introductions_pending integer not null default 0,
  member_satisfaction numeric(4, 2),
  availability_score numeric(4, 2) not null default 1,
  vacation_schedule jsonb not null default '[]'::jsonb,
  work_hours jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists consultant_capacity_profile_idx
  on consultant_capacity (profile_id, computed_at desc);

create table if not exists consultant_assignments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references workforce_profiles (id) on delete cascade,
  consultant_id text,
  member_id text,
  journey_id text,
  assignment_type text not null default 'recommendation',
  status text not null default 'suggested',
  recommendation_score numeric(5, 2),
  match_factors jsonb not null default '[]'::jsonb,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists consultant_assignments_profile_idx
  on consultant_assignments (profile_id, status, created_at desc);

create index if not exists consultant_assignments_journey_idx
  on consultant_assignments (journey_id);

create table if not exists regional_assignments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references workforce_profiles (id) on delete cascade,
  region_id text not null,
  is_primary boolean not null default false,
  coverage_cities text[] not null default '{}',
  coverage_countries text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create unique index if not exists regional_assignments_primary_idx
  on regional_assignments (profile_id, region_id);

create table if not exists leave_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references workforce_profiles (id) on delete cascade,
  leave_type text not null,
  status text not null default 'pending',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity_reduction numeric(4, 2) not null default 1,
  notes text,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists leave_requests_profile_idx
  on leave_requests (profile_id, starts_at, ends_at);

create table if not exists workforce_transfers (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references workforce_profiles (id),
  to_profile_id uuid not null references workforce_profiles (id),
  status text not null default 'completed',
  transferred_payload jsonb not null default '{}'::jsonb,
  audit_ref text,
  initiated_by uuid,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists workforce_transfers_from_idx
  on workforce_transfers (from_profile_id, created_at desc);

create index if not exists workforce_transfers_to_idx
  on workforce_transfers (to_profile_id, created_at desc);

create table if not exists workforce_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null,
  metric_value numeric not null,
  metric_unit text,
  region_id text,
  snapshot_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists workforce_metrics_key_idx
  on workforce_metrics (metric_key, snapshot_at desc);

create table if not exists staffing_forecasts (
  id uuid primary key default gen_random_uuid(),
  region_id text not null,
  forecast_period text not null,
  projected_consultation_demand integer not null default 0,
  consultant_shortage integer not null default 0,
  estimated_hiring_needs integer not null default 0,
  staffing_pressure_score numeric(5, 2) not null default 0,
  assumptions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists staffing_forecasts_region_idx
  on staffing_forecasts (region_id, forecast_period);
