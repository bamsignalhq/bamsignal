-- Data Governance & Privacy Center™ — legal holds, policy versions, governance audit, audit exports.

create table if not exists legal_holds (
  id uuid primary key default gen_random_uuid(),
  hold_ref text not null unique,
  member_ref text not null,
  reason text not null,
  placed_by text not null,
  placed_at timestamptz not null default now(),
  expires_at timestamptz,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists legal_holds_active_idx on legal_holds (active, placed_at desc);

create table if not exists policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_ref text not null unique,
  name text not null,
  version integer not null,
  published_at timestamptz not null default now(),
  published_by text not null,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists policy_versions_active_idx on policy_versions (name, version desc, active);

create table if not exists governance_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor text not null,
  target text not null,
  detail text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid
);

create index if not exists governance_audit_log_action_idx on governance_audit_log (action, occurred_at desc);

create table if not exists audit_exports (
  id uuid primary key default gen_random_uuid(),
  export_ref text not null unique,
  scope text not null,
  requested_by text not null,
  generated_at timestamptz not null default now(),
  record_count bigint not null default 0,
  format text not null default 'CSV',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists audit_exports_generated_idx on audit_exports (generated_at desc);
