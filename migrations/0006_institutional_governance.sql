-- Institutional Governance System™ — constitutional authority layer.

create table if not exists governance_roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  parent_role_id uuid references governance_roles (id),
  hierarchy_level integer not null default 0,
  is_configurable boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create index if not exists governance_roles_parent_idx on governance_roles (parent_role_id);

create table if not exists governance_permissions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  module_id text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create index if not exists governance_permissions_module_idx on governance_permissions (module_id);

create table if not exists governance_role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references governance_roles (id) on delete cascade,
  permission_id uuid not null references governance_permissions (id) on delete cascade,
  granted boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  unique (role_id, permission_id)
);

create table if not exists governance_assignments (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references governance_roles (id),
  operator_email text not null,
  operator_id uuid,
  is_primary boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create index if not exists governance_assignments_email_idx
  on governance_assignments (lower(operator_email), deleted_at);

create table if not exists approval_requests (
  id uuid primary key default gen_random_uuid(),
  domain_id text not null,
  module_id text not null,
  entity_ref text not null,
  status text not null default 'draft',
  maker_email text not null,
  maker_role_id uuid references governance_roles (id),
  title text not null,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create index if not exists approval_requests_status_idx
  on approval_requests (status, created_at desc);

create table if not exists approval_steps (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references approval_requests (id) on delete cascade,
  step_order integer not null default 1,
  approver_role_id uuid references governance_roles (id),
  approver_email text,
  required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create table if not exists approval_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references approval_requests (id) on delete cascade,
  step_id uuid references approval_steps (id),
  approver_email text not null,
  decision text not null,
  reason text,
  comments text,
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists approval_history_request_idx
  on approval_history (request_id, decided_at desc);

create table if not exists delegations (
  id uuid primary key default gen_random_uuid(),
  delegator_email text not null,
  delegate_email text not null,
  delegator_role_id uuid references governance_roles (id),
  delegate_role_id uuid references governance_roles (id),
  permission_slugs text[] not null default '{}',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'active',
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create index if not exists delegations_delegate_idx
  on delegations (lower(delegate_email), status, ends_at);

create table if not exists executive_decisions (
  id uuid primary key default gen_random_uuid(),
  decision_ref text not null unique,
  category text not null,
  title text not null,
  summary text not null,
  decided_by text not null,
  decided_at timestamptz not null default now(),
  linked_module text,
  linked_entity_ref text,
  record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create table if not exists policy_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null,
  policy_version text not null,
  operator_email text not null,
  acknowledged_at timestamptz not null default now(),
  ip_address text,
  digital_signature text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid
);

create index if not exists policy_acknowledgements_email_idx
  on policy_acknowledgements (lower(operator_email), policy_id);

create table if not exists authority_matrix (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references governance_roles (id) on delete cascade,
  responsibilities text[] not null default '{}',
  reporting_line text,
  approval_limits jsonb not null default '{}'::jsonb,
  approval_authority text[] not null default '{}',
  operational_scope text[] not null default '{}',
  financial_authority jsonb not null default '{}'::jsonb,
  member_authority text[] not null default '{}',
  consultant_authority text[] not null default '{}',
  research_authority text[] not null default '{}',
  document_authority text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create unique index if not exists authority_matrix_role_idx
  on authority_matrix (role_id) where deleted_at is null;

create table if not exists institutional_policies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  version text not null,
  category text not null,
  body text not null,
  requires_acknowledgement boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);
