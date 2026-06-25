-- Institutional Reporting Center™ — operational dashboards and institutional knowledge preservation.

create table if not exists reporting_catalog_entries (
  id uuid primary key default gen_random_uuid(),
  report_ref text not null unique,
  category_id text not null,
  title text not null,
  description text,
  status text not null default 'draft',
  last_generated_at timestamptz,
  owner_email text,
  supported_formats jsonb not null default '[]'::jsonb,
  active_filters jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists reporting_catalog_entries_category_idx on reporting_catalog_entries (category_id, status);

create table if not exists reporting_schedules (
  id uuid primary key default gen_random_uuid(),
  schedule_ref text not null unique,
  report_id uuid,
  report_title text not null,
  frequency text not null,
  format text not null,
  recipients jsonb not null default '[]'::jsonb,
  next_run_at timestamptz not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists reporting_schedules_next_run_idx on reporting_schedules (next_run_at, enabled);

create table if not exists reporting_export_history (
  id uuid primary key default gen_random_uuid(),
  export_ref text not null unique,
  report_title text not null,
  category_id text not null,
  format text not null,
  exported_by text not null,
  exported_at timestamptz not null default now(),
  file_size_kb integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists reporting_export_history_exported_idx on reporting_export_history (exported_at desc);

create table if not exists reporting_filter_presets (
  id uuid primary key default gen_random_uuid(),
  preset_ref text not null unique,
  label text not null,
  category_id text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists reporting_filter_presets_category_idx on reporting_filter_presets (category_id);

create table if not exists reporting_run_history (
  id uuid primary key default gen_random_uuid(),
  run_ref text not null unique,
  report_id uuid,
  report_title text not null,
  category_id text not null,
  generated_by text not null,
  generated_at timestamptz not null default now(),
  row_count integer not null default 0,
  preserved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists reporting_run_history_generated_idx on reporting_run_history (generated_at desc, preserved);

create table if not exists reporting_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_ref text not null unique,
  label text not null,
  report_count integer not null default 0,
  preserved_run_count integer not null default 0,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_uuid uuid,
  updated_by uuid
);

create index if not exists reporting_snapshots_created_idx on reporting_snapshots (created_at desc);
