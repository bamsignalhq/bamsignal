create table if not exists public.signup_provisioning_attempts (
  email text primary key,
  user_key text,
  phone text,
  username text,
  name text,
  code_hash text not null,
  status text not null default 'otp_verified',
  auth_user_id text,
  auth_user_created boolean not null default false,
  attempts int not null default 1,
  last_error_code text,
  payload jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists signup_provisioning_attempts_status_idx
  on public.signup_provisioning_attempts (status, expires_at);
