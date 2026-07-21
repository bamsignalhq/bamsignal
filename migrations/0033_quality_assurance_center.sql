-- Enterprise QA & Certification Center™ — release certification and QA gates.

create table if not exists qa_certification_records (
  id uuid primary key default gen_random_uuid(),
  certification_ref text not null unique,
  version text not null,
  overall_score integer not null,
  release_blocked boolean not null default false,
  certified_at timestamptz not null default now(),
  certified_by text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists qa_certification_records_certified_idx
  on qa_certification_records (certified_at desc, release_blocked);

create table if not exists qa_release_gates (
  id uuid primary key default gen_random_uuid(),
  gate_ref text not null unique,
  name text not null,
  section_id text not null,
  status text not null,
  blocks_release boolean not null default false,
  detail text not null,
  evaluated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists qa_release_gates_status_idx on qa_release_gates (status, section_id);

create table if not exists qa_automated_test_runs (
  id uuid primary key default gen_random_uuid(),
  test_id text not null,
  label text not null,
  status text not null,
  duration_ms integer not null default 0,
  last_run_at timestamptz not null default now(),
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists qa_automated_test_runs_test_idx on qa_automated_test_runs (test_id, last_run_at desc);

create table if not exists qa_manual_qa_runs (
  id uuid primary key default gen_random_uuid(),
  check_id text not null,
  label text not null,
  status text not null,
  tested_by text,
  last_run_at timestamptz not null default now(),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists qa_manual_qa_runs_check_idx on qa_manual_qa_runs (check_id, last_run_at desc);

create table if not exists qa_certification_reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  label text not null,
  generated_at timestamptz,
  generated_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists qa_certification_reports_type_idx on qa_certification_reports (report_type, generated_at desc);
