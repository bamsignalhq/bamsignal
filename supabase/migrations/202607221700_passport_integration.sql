-- Sprint 6 — Digital Trust Passport Integration, Trust Signals & Reputation Platform.
-- Extends passport_trust_signals; does not replace Passport Platform v2.

-- Member ↔ Passport registry
create table if not exists member_passport_registry (
  member_id uuid primary key references app_member_profiles(id) on delete cascade,
  passport_id text not null,
  user_key text null,
  issued_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint member_passport_registry_passport_id_key unique (passport_id)
);

create index if not exists member_passport_registry_passport_idx
  on member_passport_registry (passport_id);

-- Reputation foundation — structured inputs only (no scoring algorithm)
create table if not exists passport_reputation_profile (
  passport_id text not null primary key,
  identity_inputs jsonb not null default '[]'::jsonb,
  reliability_inputs jsonb not null default '[]'::jsonb,
  safety_inputs jsonb not null default '[]'::jsonb,
  engagement_inputs jsonb not null default '[]'::jsonb,
  financial_inputs jsonb not null default '[]'::jsonb,
  community_inputs jsonb not null default '[]'::jsonb,
  verification_inputs jsonb not null default '[]'::jsonb,
  concierge_inputs jsonb not null default '[]'::jsonb,
  support_inputs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists passport_reputation_input_log (
  id uuid primary key default gen_random_uuid(),
  log_id text not null,
  passport_id text not null,
  dimension text not null
    check (dimension in (
      'identity', 'reliability', 'safety', 'engagement', 'financial',
      'community', 'verification', 'concierge', 'support'
    )),
  source_system text not null,
  signal_type text not null,
  signal_id text null,
  input_payload jsonb not null default '{}'::jsonb,
  correlation_id text null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint passport_reputation_input_log_log_id_key unique (log_id)
);

create index if not exists passport_reputation_input_log_passport_idx
  on passport_reputation_input_log (passport_id, occurred_at desc);

-- Async synchronization queue (never blocks user actions)
create table if not exists passport_sync_queue (
  id uuid primary key default gen_random_uuid(),
  queue_id text not null,
  member_id uuid null references app_member_profiles(id) on delete set null,
  passport_id text null,
  source_system text not null,
  signal_type text not null,
  signal_category text not null,
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'failed', 'skipped')),
  idempotency_key text not null,
  correlation_id text null,
  actor text not null default 'system',
  payload jsonb not null default '{}'::jsonb,
  error_message text null,
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz null,
  constraint passport_sync_queue_queue_id_key unique (queue_id),
  constraint passport_sync_queue_idempotency_key unique (idempotency_key)
);

create index if not exists passport_sync_queue_status_idx
  on passport_sync_queue (status, created_at asc);

-- Trust platform event bus (Future Trust Engine subscribes here)
create table if not exists passport_integration_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null
    check (event_type in (
      'trust.signal.created',
      'trust.signal.accepted',
      'trust.signal.rejected',
      'passport.updated',
      'reputation.updated',
      'verification.completed',
      'identity.updated'
    )),
  passport_id text not null,
  signal_id text null,
  correlation_id text null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint passport_integration_events_event_id_key unique (event_id)
);

create index if not exists passport_integration_events_passport_idx
  on passport_integration_events (passport_id, occurred_at desc);
create index if not exists passport_integration_events_type_idx
  on passport_integration_events (event_type, occurred_at desc);

-- Consent decision audit (append-only)
create table if not exists passport_consent_audit_log (
  id uuid primary key default gen_random_uuid(),
  audit_id text not null,
  passport_id text not null,
  contributor_id text not null,
  consent_ref text null,
  decision text not null check (decision in ('granted', 'denied', 'revoked', 'checked')),
  reason text not null default '',
  actor text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint passport_consent_audit_log_audit_id_key unique (audit_id)
);

create index if not exists passport_consent_audit_log_passport_idx
  on passport_consent_audit_log (passport_id, occurred_at desc);

-- Extend BamSignal contributor signal types for platform integration
update passport_signal_contributors
set allowed_signal_types = '[
  "profile_verified","identity_verified","positive_interaction","successful_match",
  "community_participation","policy_violation","appeal_approved",
  "email_verified","profile_completed","premium_active","payment_successful",
  "payment_refund","conversation_started","message_delivered","message_read",
  "member_reported","moderation_action","concierge_engaged","support_resolved",
  "verification_completed"
]'::jsonb,
    allowed_categories = '["identity","verification","community","compliance","financial","security"]'::jsonb,
    updated_at = now()
where contributor_id = 'bamsignal';
