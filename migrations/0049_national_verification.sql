-- National Production Verification System tables.
-- Embeddings are never stored in cleartext client-facing columns; fingerprints only.

create table if not exists verification_sessions (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  auth_user_id text,
  email text,
  phone text,
  status text not null default 'started',
  provider text,
  model_version text,
  device_fingerprint text,
  challenge_id text,
  selfie_bucket text,
  selfie_path text,
  trust_score numeric(5,2),
  match_confidence numeric(5,2),
  decision text,
  reason_codes jsonb not null default '[]'::jsonb,
  metadata_enc text,
  embedding_fingerprint text,
  messaging_unlocked boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists verification_sessions_user_key_idx
  on verification_sessions (user_key, created_at desc);
create index if not exists verification_sessions_status_idx
  on verification_sessions (status, updated_at desc);
create index if not exists verification_sessions_fingerprint_idx
  on verification_sessions (embedding_fingerprint)
  where embedding_fingerprint is not null;

create table if not exists verification_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references verification_sessions(id) on delete cascade,
  event_type text not null,
  actor text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists verification_events_session_idx
  on verification_events (session_id, created_at desc);

create table if not exists verification_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references verification_sessions(id) on delete cascade,
  provider text not null,
  model_version text,
  liveness_passed boolean,
  liveness_score numeric(5,2),
  match_confidence numeric(5,2),
  trust_score numeric(5,2),
  decision text not null,
  reason_codes jsonb not null default '[]'::jsonb,
  risk_breakdown jsonb not null default '{}'::jsonb,
  metadata_enc text,
  created_at timestamptz not null default now()
);

create unique index if not exists verification_results_session_uidx
  on verification_results (session_id);

create table if not exists verification_audit_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid,
  user_key text,
  action text not null,
  actor text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists verification_audit_logs_session_idx
  on verification_audit_logs (session_id, created_at desc);
create index if not exists verification_audit_logs_user_idx
  on verification_audit_logs (user_key, created_at desc);
