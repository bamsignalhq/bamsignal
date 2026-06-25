-- Enterprise Configuration Platform™ — centralized institutional configuration layer.

create table if not exists configuration_entries (
  id uuid primary key default gen_random_uuid(),
  config_key text not null unique,
  category_id text not null,
  domain_id text,
  label text not null,
  description text,
  value_json jsonb not null default '{}'::jsonb,
  value_type text not null default 'string',
  critical boolean not null default false,
  active_version integer not null default 1,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists configuration_entries_category_idx
  on configuration_entries (category_id, config_key);

create table if not exists configuration_versions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references configuration_entries (id) on delete cascade,
  version_number integer not null,
  value_json jsonb not null,
  change_reason text,
  changed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  unique (entry_id, version_number)
);

create index if not exists configuration_versions_entry_idx
  on configuration_versions (entry_id, version_number desc);

create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  flag_key text not null unique,
  category_id text not null,
  label text not null,
  description text,
  mode text not null default 'disabled',
  rollout_config jsonb not null default '{}'::jsonb,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists feature_flags_category_idx on feature_flags (category_id, flag_key);

create table if not exists configuration_approvals (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references configuration_entries (id) on delete cascade,
  proposed_version integer not null,
  proposed_value jsonb not null,
  status text not null default 'pending',
  requested_by text not null,
  approver_email text,
  decision_note text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists configuration_approvals_status_idx
  on configuration_approvals (status, created_at desc);

create table if not exists configuration_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_ref text not null unique,
  label text not null,
  entries_snapshot jsonb not null default '[]'::jsonb,
  flags_snapshot jsonb not null default '[]'::jsonb,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create index if not exists configuration_snapshots_created_idx
  on configuration_snapshots (created_at desc);
