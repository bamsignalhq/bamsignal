-- Enterprise Feature Flag Platform™ — remote feature control with audit trail.

alter table if exists feature_flags
  add column if not exists environment text not null default 'production';

alter table if exists feature_flags
  add column if not exists rollout_percentage integer not null default 0;

create index if not exists feature_flags_environment_idx
  on feature_flags (environment, flag_key);

create table if not exists feature_flag_audits (
  id uuid primary key default gen_random_uuid(),
  flag_id uuid references feature_flags (id) on delete set null,
  flag_key text not null,
  changed_by text not null,
  previous_value jsonb not null default '{}'::jsonb,
  new_value jsonb not null default '{}'::jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists feature_flag_audits_flag_key_idx
  on feature_flag_audits (flag_key, created_at desc);
