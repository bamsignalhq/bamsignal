-- Data Governance, Privacy & Retention Center™ — institutional data stewardship layer.

create table if not exists data_inventory_items (
  id uuid primary key default gen_random_uuid(),
  inventory_ref text not null unique,
  name text not null,
  area_id text not null,
  data_class text not null,
  system_name text not null,
  owner_email text,
  record_count bigint not null default 0,
  contains_pii boolean not null default false,
  contains_sensitive boolean not null default false,
  last_reviewed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists data_inventory_items_class_idx on data_inventory_items (data_class, area_id);

create table if not exists retention_policies (
  id uuid primary key default gen_random_uuid(),
  policy_ref text not null unique,
  category_id text not null,
  label text not null,
  retention_days integer not null,
  archive_after_days integer,
  delete_after_days integer,
  legal_hold_exempt boolean not null default false,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists retention_policies_category_idx on retention_policies (category_id, active);

create table if not exists privacy_requests (
  id uuid primary key default gen_random_uuid(),
  request_ref text not null unique,
  request_type text not null,
  status text not null default 'pending',
  member_ref text not null,
  submitted_at timestamptz not null default now(),
  completed_at timestamptz,
  assigned_to text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists privacy_requests_status_idx on privacy_requests (status, request_type, submitted_at desc);

create table if not exists consent_records (
  id uuid primary key default gen_random_uuid(),
  consent_ref text not null unique,
  member_ref text not null,
  version integer not null default 1,
  purpose text not null,
  scope text not null,
  status text not null default 'active',
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  audit_trail jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists consent_records_member_idx on consent_records (member_ref, status, version desc);

create table if not exists regional_policies (
  id uuid primary key default gen_random_uuid(),
  policy_ref text not null unique,
  region text not null,
  framework text not null,
  description text not null,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists regional_policies_region_idx on regional_policies (region, active);

create table if not exists sensitive_data_registers (
  id uuid primary key default gen_random_uuid(),
  register_ref text not null unique,
  data_type text not null,
  data_class text not null,
  systems text[] not null default '{}',
  encryption_required boolean not null default true,
  access_restricted boolean not null default true,
  last_audit_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists sensitive_data_registers_class_idx on sensitive_data_registers (data_class, last_audit_at desc);
