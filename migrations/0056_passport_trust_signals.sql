-- Platform Phase 2 — Passport Trust Signal persistence (evidence layer only).
-- Server-side DATABASE_URL bypasses RLS; anon/authenticated denied by default.

create extension if not exists "pgcrypto";

-- Contributor registry with API credential metadata
create table if not exists passport_signal_contributors (
  id uuid primary key default gen_random_uuid(),
  contributor_id text not null,
  display_name text not null,
  trust_domain text not null,
  status text not null default 'active'
    check (status in ('active', 'reserved', 'suspended', 'deprecated')),
  verification_level text not null default 'registered',
  allowed_signal_types jsonb not null default '[]'::jsonb,
  allowed_categories jsonb not null default '[]'::jsonb,
  capabilities jsonb not null default '[]'::jsonb,
  version_compatibility text not null default '1.0',
  documentation_url text null,
  trust_contributor_ref text null,
  api_key_hash text null,
  api_key_prefix text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint passport_signal_contributors_contributor_id_key unique (contributor_id)
);

create index if not exists passport_signal_contributors_status_idx
  on public.passport_signal_contributors (status)
  where deleted_at is null;

-- Consent grants referenced by signals (server-side consent gate)
create table if not exists passport_consent_grants (
  id uuid primary key default gen_random_uuid(),
  consent_ref text not null,
  passport_id text not null,
  contributor_id text not null,
  scopes jsonb not null default '[]'::jsonb,
  status text not null default 'active'
    check (status in ('active', 'expired', 'revoked')),
  purpose text not null default '',
  granted_at timestamptz not null default now(),
  expires_at timestamptz null,
  revoked_at timestamptz null,
  human_override_ref text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint passport_consent_grants_consent_ref_key unique (consent_ref)
);

create index if not exists passport_consent_grants_passport_idx
  on public.passport_consent_grants (passport_id, status)
  where deleted_at is null;

-- Normalized trust signals — evidence references only, no raw payloads
create table if not exists passport_trust_signals (
  id uuid primary key default gen_random_uuid(),
  signal_id text not null,
  passport_id text not null,
  contributor_id text not null references passport_signal_contributors (contributor_id),
  category text not null,
  signal_type text not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  consent_ref text null,
  audit_ref text not null,
  confidence jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  source_product text not null,
  version text not null default '1.0',
  human_review_requirement text not null default 'none',
  status text not null default 'accepted'
    check (status in ('pending', 'accepted', 'under_review', 'revoked', 'expired', 'rejected')),
  explanation text not null default '',
  expiration jsonb not null default '{}'::jsonb,
  revocation jsonb null,
  idempotency_key text not null,
  contributor_event_id text not null,
  correlation_id text not null,
  validation_id uuid null,
  provenance_id uuid null,
  contributor_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint passport_trust_signals_signal_id_key unique (signal_id),
  constraint passport_trust_signals_idempotency_key unique (contributor_id, idempotency_key)
);

create index if not exists passport_trust_signals_passport_idx
  on public.passport_trust_signals (passport_id, recorded_at desc)
  where deleted_at is null;

create index if not exists passport_trust_signals_contributor_idx
  on public.passport_trust_signals (contributor_id, occurred_at desc)
  where deleted_at is null;

-- Validation reports — structured, never opaque
create table if not exists passport_signal_validation_reports (
  id uuid primary key default gen_random_uuid(),
  signal_row_id uuid null references passport_trust_signals (id) on delete set null,
  signal_id text null,
  contributor_id text not null,
  passport_id text not null,
  passed boolean not null,
  results jsonb not null default '[]'::jsonb,
  validated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists passport_signal_validation_reports_signal_idx
  on public.passport_signal_validation_reports (signal_id);

-- Provenance — who, when, why, under what authority
create table if not exists passport_signal_provenance (
  id uuid primary key default gen_random_uuid(),
  provenance_id text not null,
  signal_row_id uuid null references passport_trust_signals (id) on delete set null,
  signal_id text not null,
  passport_id text not null,
  contributor_id text not null,
  source_product text not null,
  emitted_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  consent_ref text null,
  audit_ref text not null,
  explanation text not null default '',
  evidence_verifiable boolean not null default false,
  contributor_authoritative boolean not null default false,
  revoked boolean not null default false,
  revocation_ref text null,
  questions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint passport_signal_provenance_provenance_id_key unique (provenance_id)
);

create index if not exists passport_signal_provenance_signal_idx
  on public.passport_signal_provenance (signal_id);

-- Internal event log — future queue adapter target
create table if not exists passport_signal_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null,
  passport_id text not null,
  signal_id text null,
  contributor_id text null,
  correlation_id text not null,
  payload jsonb not null default '{}'::jsonb,
  audit_ref text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint passport_signal_events_event_id_key unique (event_id)
);

create index if not exists passport_signal_events_passport_idx
  on public.passport_signal_events (passport_id, occurred_at desc);

create index if not exists passport_signal_events_type_idx
  on public.passport_signal_events (event_type, occurred_at desc);

-- updated_at triggers
create or replace function public.passport_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists passport_signal_contributors_touch on public.passport_signal_contributors;
create trigger passport_signal_contributors_touch
  before update on public.passport_signal_contributors
  for each row execute function public.passport_touch_updated_at();

drop trigger if exists passport_consent_grants_touch on public.passport_consent_grants;
create trigger passport_consent_grants_touch
  before update on public.passport_consent_grants
  for each row execute function public.passport_touch_updated_at();

drop trigger if exists passport_trust_signals_touch on public.passport_trust_signals;
create trigger passport_trust_signals_touch
  before update on public.passport_trust_signals
  for each row execute function public.passport_touch_updated_at();

-- RLS — deny direct PostgREST access; server uses DATABASE_URL owner
alter table public.passport_signal_contributors enable row level security;
alter table public.passport_consent_grants enable row level security;
alter table public.passport_trust_signals enable row level security;
alter table public.passport_signal_validation_reports enable row level security;
alter table public.passport_signal_provenance enable row level security;
alter table public.passport_signal_events enable row level security;

-- Seed contributor registry (API keys configured via env at runtime bootstrap)
insert into public.passport_signal_contributors (
  contributor_id,
  display_name,
  trust_domain,
  status,
  verification_level,
  allowed_signal_types,
  allowed_categories,
  capabilities,
  trust_contributor_ref
) values
  (
    'bamsignal',
    'BamSignal',
    'social',
    'active',
    'verified',
    '["profile_verified","identity_verified","positive_interaction","successful_match","community_participation","policy_violation","appeal_approved"]'::jsonb,
    '["identity","verification","community","compliance"]'::jsonb,
    '["emit_signals","register_signal_types","attach_evidence_refs","revoke_own_signals"]'::jsonb,
    'bamsignal'
  ),
  (
    'bayright',
    'BayRight',
    'financial',
    'reserved',
    'registered',
    '["bank_verified","successful_escrow","completed_settlement","chargeback","refund","fraud_investigation"]'::jsonb,
    '["financial","security"]'::jsonb,
    '["emit_signals","register_signal_types","attach_evidence_refs","revoke_own_signals"]'::jsonb,
    'bayright'
  ),
  (
    'yike',
    'Yike',
    'marketplace',
    'reserved',
    'registered',
    '["verified_seller","verified_buyer","successful_transaction","inspection_passed","property_verified","dispute_closed"]'::jsonb,
    '["marketplace","verification","compliance"]'::jsonb,
    '["emit_signals","register_signal_types","attach_evidence_refs","revoke_own_signals"]'::jsonb,
    'yike'
  )
on conflict (contributor_id) do nothing;
