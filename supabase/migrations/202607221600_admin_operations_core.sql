-- Sprint 5 — Admin Console, Moderation, Concierge Operations & Customer Support.
-- Operational lifecycle tables; does not replace app_reports, moderation_audit_log, or concierge_members.

-- Admin role assignments (formal operational roles)
create table if not exists ops_admin_role_assignments (
  id uuid primary key default gen_random_uuid(),
  operator_email text not null,
  role_slug text not null
    check (role_slug in (
      'super_admin',
      'platform_administrator',
      'operations_administrator',
      'moderator',
      'concierge_agent',
      'support_agent',
      'finance_administrator',
      'trust_administrator',
      'read_only_auditor'
    )),
  assigned_by text not null default 'system',
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  constraint ops_admin_role_assignments_active_key unique (operator_email, role_slug)
);

create index if not exists ops_admin_role_assignments_email_idx
  on ops_admin_role_assignments (operator_email, revoked_at nulls first);

create table if not exists ops_admin_role_audit_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  operator_email text not null,
  role_slug text not null,
  action text not null check (action in ('assigned', 'revoked', 'permission_changed')),
  previous_permissions jsonb not null default '[]'::jsonb,
  new_permissions jsonb not null default '[]'::jsonb,
  reason text not null default '',
  actor text not null default 'system',
  actor_role text not null default 'system',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ops_admin_role_audit_log_log_id_key unique (log_id)
);

create index if not exists ops_admin_role_audit_log_email_idx
  on ops_admin_role_audit_log (operator_email, occurred_at desc);

-- Moderation report lifecycle (extends app_reports by report id)
create table if not exists ops_moderation_report_state (
  report_id text not null primary key,
  profile_id text not null,
  status text not null default 'submitted'
    check (status in (
      'submitted', 'triaged', 'assigned', 'investigating', 'awaiting_response',
      'action_taken', 'resolved', 'dismissed', 'appealed', 'closed'
    )),
  assigned_to text null,
  risk_score numeric(5,2) not null default 0,
  reporter_user_key text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ops_moderation_report_state_status_idx
  on ops_moderation_report_state (status, updated_at desc);
create index if not exists ops_moderation_report_state_profile_idx
  on ops_moderation_report_state (profile_id, updated_at desc);
create index if not exists ops_moderation_report_state_assigned_idx
  on ops_moderation_report_state (assigned_to, status);

create table if not exists ops_moderation_lifecycle_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  report_id text not null,
  previous_status text not null,
  new_status text not null,
  reason_code text not null default 'system',
  reason text not null default '',
  actor text not null default 'system',
  actor_role text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ops_moderation_lifecycle_log_log_id_key unique (log_id)
);

create index if not exists ops_moderation_lifecycle_log_report_idx
  on ops_moderation_lifecycle_log (report_id, occurred_at desc);

create table if not exists ops_moderation_evidence (
  id uuid primary key default gen_random_uuid(),
  evidence_id text not null,
  report_id text not null,
  kind text not null default 'attachment',
  uri text not null default '',
  description text not null default '',
  uploaded_by text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ops_moderation_evidence_evidence_id_key unique (evidence_id)
);

create index if not exists ops_moderation_evidence_report_idx
  on ops_moderation_evidence (report_id, created_at desc);

create table if not exists ops_moderation_internal_notes (
  id uuid primary key default gen_random_uuid(),
  note_id text not null,
  report_id text not null,
  author_email text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ops_moderation_internal_notes_note_id_key unique (note_id)
);

create index if not exists ops_moderation_internal_notes_report_idx
  on ops_moderation_internal_notes (report_id, created_at desc);

-- User safety operations (append-only action log)
create table if not exists ops_user_safety_action_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  action_type text not null
    check (action_type in (
      'suspend', 'unsuspend', 'shadow_ban', 'remove_shadow_ban',
      'temporary_lock', 'permanent_lock', 'photo_approval', 'profile_approval',
      'identity_review', 'trust_review', 'genotype_review', 'verification_override'
    )),
  target_profile_id uuid null references app_member_profiles(id) on delete set null,
  target_user_key text null,
  previous_state jsonb not null default '{}'::jsonb,
  new_state jsonb not null default '{}'::jsonb,
  reason text not null,
  actor text not null default 'system',
  actor_role text not null default 'system',
  correlation_id text null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ops_user_safety_action_log_log_id_key unique (log_id)
);

create index if not exists ops_user_safety_action_log_profile_idx
  on ops_user_safety_action_log (target_profile_id, occurred_at desc);
create index if not exists ops_user_safety_action_log_type_idx
  on ops_user_safety_action_log (action_type, occurred_at desc);

-- Customer support ticket lifecycle
create table if not exists ops_support_ticket_state (
  ticket_id text not null primary key,
  member_id uuid null references app_member_profiles(id) on delete set null,
  member_user_key text null,
  status text not null default 'open'
    check (status in (
      'open', 'assigned', 'awaiting_member', 'awaiting_staff',
      'resolved', 'closed', 'reopened', 'escalated'
    )),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  category text not null default 'general',
  owner_email text null,
  subject text not null default '',
  sla_due_at timestamptz null,
  first_response_at timestamptz null,
  resolved_at timestamptz null,
  satisfaction_score numeric(3,1) null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ops_support_ticket_state_status_idx
  on ops_support_ticket_state (status, updated_at desc);
create index if not exists ops_support_ticket_state_owner_idx
  on ops_support_ticket_state (owner_email, status);

create table if not exists ops_support_lifecycle_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  ticket_id text not null,
  previous_status text not null,
  new_status text not null,
  reason_code text not null default 'system',
  reason text not null default '',
  actor text not null default 'system',
  actor_role text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ops_support_lifecycle_log_log_id_key unique (log_id)
);

create index if not exists ops_support_lifecycle_log_ticket_idx
  on ops_support_lifecycle_log (ticket_id, occurred_at desc);

create table if not exists ops_support_internal_notes (
  id uuid primary key default gen_random_uuid(),
  note_id text not null,
  ticket_id text not null,
  author_email text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ops_support_internal_notes_note_id_key unique (note_id)
);

create index if not exists ops_support_internal_notes_ticket_idx
  on ops_support_internal_notes (ticket_id, created_at desc);

-- Concierge operations queue
create table if not exists ops_concierge_queue_state (
  queue_id text not null primary key,
  case_member_id text not null,
  journey_id text not null,
  status text not null default 'queued'
    check (status in (
      'queued', 'assigned', 'in_progress', 'awaiting_review',
      'escalated', 'completed', 'closed'
    )),
  assigned_agent_email text null,
  priority text not null default 'normal'
    check (priority in ('normal', 'vip', 'urgent')),
  workload_score numeric(5,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ops_concierge_queue_status_idx
  on ops_concierge_queue_state (status, updated_at desc);
create index if not exists ops_concierge_queue_agent_idx
  on ops_concierge_queue_state (assigned_agent_email, status);

create table if not exists ops_concierge_assignment_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  queue_id text not null,
  case_member_id text not null,
  previous_agent text null,
  new_agent text null,
  action text not null check (action in ('assigned', 'transferred', 'completed', 'escalated')),
  reason text not null default '',
  actor text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ops_concierge_assignment_log_log_id_key unique (log_id)
);

create index if not exists ops_concierge_assignment_log_queue_idx
  on ops_concierge_assignment_log (queue_id, occurred_at desc);

-- Centralized runtime configuration (feature flags platform backend)
create table if not exists ops_runtime_configuration (
  config_key text not null primary key,
  enabled boolean not null default false,
  rollout_percentage integer not null default 0 check (rollout_percentage >= 0 and rollout_percentage <= 100),
  value jsonb not null default '{}'::jsonb,
  description text not null default '',
  updated_by text not null default 'system',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists ops_runtime_configuration_audit (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  config_key text not null,
  previous_value jsonb not null default '{}'::jsonb,
  new_value jsonb not null default '{}'::jsonb,
  reason text not null default '',
  actor text not null default 'system',
  actor_role text not null default 'system',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ops_runtime_configuration_audit_log_id_key unique (log_id)
);

create index if not exists ops_runtime_configuration_audit_key_idx
  on ops_runtime_configuration_audit (config_key, occurred_at desc);

-- Immutable enterprise audit platform
create table if not exists ops_immutable_audit_log (
  id uuid primary key default gen_random_uuid(),
  audit_id text not null,
  actor text not null,
  actor_role text not null default 'system',
  action text not null,
  entity_type text not null,
  entity_id text not null,
  old_value jsonb null,
  new_value jsonb null,
  reason text not null default '',
  correlation_id text null,
  ip text null,
  device text null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ops_immutable_audit_log_audit_id_key unique (audit_id)
);

create index if not exists ops_immutable_audit_log_entity_idx
  on ops_immutable_audit_log (entity_type, entity_id, occurred_at desc);
create index if not exists ops_immutable_audit_log_actor_idx
  on ops_immutable_audit_log (actor, occurred_at desc);
create index if not exists ops_immutable_audit_log_action_idx
  on ops_immutable_audit_log (action, occurred_at desc);

-- Admin operations event bus
create table if not exists ops_admin_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null,
  idempotency_key text not null,
  payload jsonb not null default '{}'::jsonb,
  actor text not null default 'system',
  correlation_id text null,
  created_at timestamptz not null default now(),
  constraint ops_admin_events_event_id_key unique (event_id),
  constraint ops_admin_events_idempotency_key unique (idempotency_key)
);

create index if not exists ops_admin_events_type_idx
  on ops_admin_events (event_type, created_at desc);

-- Seed default runtime configuration keys
insert into ops_runtime_configuration (config_key, enabled, description)
values
  ('signup', true, 'Member signup availability'),
  ('messaging', true, 'Member messaging availability'),
  ('payments', true, 'Payment processing availability'),
  ('notifications', true, 'Push and in-app notifications'),
  ('matching', true, 'Discover and matching availability'),
  ('concierge', true, 'Concierge program availability'),
  ('maintenance_mode', false, 'Platform maintenance mode'),
  ('emergency_banner', false, 'Emergency banner display'),
  ('beta_features', false, 'Beta feature rollout gate')
on conflict (config_key) do nothing;
