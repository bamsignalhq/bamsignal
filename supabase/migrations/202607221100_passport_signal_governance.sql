-- Platform Phase 3 — Signal governance, operations, and observability.
-- Never hard-delete production signals. Append-only history.

-- Expand signal status lifecycle (drop and recreate check constraint)
alter table passport_trust_signals drop constraint if exists passport_trust_signals_status_check;

alter table passport_trust_signals
  add constraint passport_trust_signals_status_check
  check (status in (
    'received', 'validated', 'accepted', 'quarantined', 'rejected',
    'revoked', 'expired', 'archived', 'pending', 'under_review'
  ));

-- Governance actions — every approve/reject/revoke/etc. is auditable
create table if not exists passport_signal_governance_actions (
  id uuid primary key default gen_random_uuid(),
  action_id text not null,
  signal_id text not null,
  passport_id text not null,
  contributor_id text not null,
  action text not null
    check (action in ('approve', 'reject', 'revoke', 'restore', 'expire', 'quarantine', 'annotate', 'suspend_contributor')),
  reason_code text not null,
  reason text not null default '',
  actor text not null,
  actor_role text not null default 'admin'
    check (actor_role in ('admin', 'system', 'contributor')),
  previous_status text not null,
  new_status text not null,
  annotation text null,
  audit_ref text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint passport_signal_governance_actions_action_id_key unique (action_id)
);

create index if not exists passport_signal_governance_actions_signal_idx
  on passport_signal_governance_actions (signal_id, occurred_at desc);

create index if not exists passport_signal_governance_actions_actor_idx
  on passport_signal_governance_actions (actor, occurred_at desc);

-- Append-only signal history
create table if not exists passport_signal_history (
  id uuid primary key default gen_random_uuid(),
  history_id text not null,
  signal_id text not null,
  passport_id text not null,
  kind text not null
    check (kind in ('created', 'validation', 'governance_action', 'consent_change', 'contributor_event', 'lifecycle_change', 'retention')),
  headline text not null,
  summary text not null default '',
  actor text null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint passport_signal_history_history_id_key unique (history_id)
);

create index if not exists passport_signal_history_signal_idx
  on passport_signal_history (signal_id, occurred_at desc);

-- Admin review queue
create table if not exists passport_signal_review_queue (
  id uuid primary key default gen_random_uuid(),
  queue_id text not null,
  signal_id text not null,
  passport_id text not null,
  contributor_id text not null,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'awaiting_evidence', 'awaiting_contributor', 'escalated', 'resolved', 'cancelled')),
  priority text not null default 'normal'
    check (priority in ('normal', 'high', 'critical')),
  assigned_to text null,
  reason text not null default '',
  resolution_note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz null,
  constraint passport_signal_review_queue_queue_id_key unique (queue_id)
);

create index if not exists passport_signal_review_queue_status_idx
  on passport_signal_review_queue (status, priority, created_at desc)
  where resolved_at is null;

create index if not exists passport_signal_review_queue_signal_idx
  on passport_signal_review_queue (signal_id);

-- Contributor operational health (not trust)
create table if not exists passport_signal_contributor_health (
  id uuid primary key default gen_random_uuid(),
  contributor_id text not null references passport_signal_contributors (contributor_id),
  signals_submitted bigint not null default 0,
  signals_accepted bigint not null default 0,
  signals_rejected bigint not null default 0,
  validation_failures bigint not null default 0,
  consent_failures bigint not null default 0,
  duplicate_count bigint not null default 0,
  replay_events bigint not null default 0,
  last_activity_at timestamptz null,
  snapshot_at timestamptz not null default now(),
  metadata jsonb not null default '{"influencesTrust": false}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint passport_signal_contributor_health_contributor_key unique (contributor_id)
);

-- Replay monitoring events
create table if not exists passport_signal_replay_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  contributor_id text not null,
  signal_id text null,
  passport_id text null,
  kind text not null
    check (kind in ('repeated_submission', 'duplicate_burst', 'out_of_order', 'clock_drift', 'contributor_anomaly')),
  severity text not null default 'info'
    check (severity in ('info', 'warning', 'critical')),
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint passport_signal_replay_events_event_id_key unique (event_id)
);

create index if not exists passport_signal_replay_events_contributor_idx
  on passport_signal_replay_events (contributor_id, detected_at desc);

-- Retention metadata — never auto hard-delete
create table if not exists passport_signal_retention (
  id uuid primary key default gen_random_uuid(),
  signal_id text not null,
  retention_class text not null default 'active'
    check (retention_class in ('active', 'archived', 'expired', 'revoked')),
  retain_until timestamptz null,
  archived_at timestamptz null,
  policy_label text not null default 'default',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint passport_signal_retention_signal_id_key unique (signal_id)
);

drop trigger if exists passport_signal_review_queue_touch on passport_signal_review_queue;
create trigger passport_signal_review_queue_touch
  before update on passport_signal_review_queue
  for each row execute function passport_touch_updated_at();

drop trigger if exists passport_signal_contributor_health_touch on passport_signal_contributor_health;
create trigger passport_signal_contributor_health_touch
  before update on passport_signal_contributor_health
  for each row execute function passport_touch_updated_at();

drop trigger if exists passport_signal_retention_touch on passport_signal_retention;
create trigger passport_signal_retention_touch
  before update on passport_signal_retention
  for each row execute function passport_touch_updated_at();

alter table passport_signal_governance_actions enable row level security;
alter table passport_signal_history enable row level security;
alter table passport_signal_review_queue enable row level security;
alter table passport_signal_contributor_health enable row level security;
alter table passport_signal_replay_events enable row level security;
alter table passport_signal_retention enable row level security;

-- Seed contributor health rows for known contributors
insert into passport_signal_contributor_health (contributor_id)
select contributor_id from passport_signal_contributors
on conflict (contributor_id) do nothing;
