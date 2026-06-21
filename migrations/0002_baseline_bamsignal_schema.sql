-- BamSignal baseline schema (verify-only startup expects this migration to be applied).

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text unique,
  name text,
  referral_code text,
  user_key text,
  is_premium boolean not null default false,
  premium_until timestamptz,
  telegram_vip_invite_link text,
  telegram_user_id text,
  paystack_reference text,
  referral_points integer not null default 0,
  phone_verified boolean not null default false,
  phone_verified_at timestamptz,
  verified_phone text,
  referred_by_user_key text,
  onboarding_completed_at timestamptz,
  fast_connection_pass_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists app_users_user_key_idx on app_users (user_key) where user_key is not null;
create unique index if not exists app_users_email_unique_idx on app_users (lower(email)) where email is not null and email <> '';
create unique index if not exists app_users_phone_unique_idx on app_users (phone) where phone is not null and phone <> '';
create unique index if not exists app_users_paystack_reference_unique_idx on app_users (paystack_reference) where paystack_reference is not null and paystack_reference <> '';

create table if not exists platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists admin_users (
  email text primary key,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscription_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'paystack',
  event_type text not null,
  user_email text,
  user_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists payment_fulfillments (
  id uuid primary key default gen_random_uuid(),
  paystack_reference text not null unique,
  user_id text,
  product_type text not null,
  product_id text,
  amount_kobo bigint,
  currency text,
  status text not null default 'pending',
  processing_started_at timestamptz,
  fulfilled_at timestamptz,
  email_sent_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists payment_fulfillments_reference_unique_idx on payment_fulfillments (paystack_reference);
create index if not exists payment_fulfillments_user_id_idx on payment_fulfillments (user_id, created_at desc);
create index if not exists payment_fulfillments_product_idx on payment_fulfillments (product_type, product_id, created_at desc);

create table if not exists app_signals (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  sender_email text,
  sender_phone text,
  target_profile_id text not null,
  signal_type text not null default 'signal',
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_signals_user_key_idx on app_signals (user_key, created_at desc);
create index if not exists app_signals_target_status_idx on app_signals (target_profile_id, status, created_at desc);

create table if not exists app_matches (
  id text not null,
  user_key text not null,
  owner_email text,
  owner_phone text,
  profile_id text not null,
  payload jsonb not null default '{}'::jsonb,
  matched_at timestamptz not null default now(),
  primary key (id, user_key)
);

create table if not exists app_messages (
  id text not null,
  thread_id text not null,
  user_key text not null,
  owner_email text,
  owner_phone text,
  from_side text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (id, user_key)
);

create index if not exists app_messages_thread_idx on app_messages (user_key, thread_id, created_at);

create table if not exists app_chat_threads (
  match_id text not null,
  user_key text not null,
  owner_email text,
  owner_phone text,
  meta jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (match_id, user_key)
);

create table if not exists app_reports (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  reporter_email text,
  reporter_phone text,
  profile_id text not null,
  reason text not null,
  details text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_reports_profile_idx on app_reports (profile_id, created_at desc);

create table if not exists app_member_profiles (
  id uuid primary key default gen_random_uuid(),
  user_key text unique not null,
  email text,
  phone text,
  name text,
  username text,
  city text not null,
  state text,
  profile jsonb not null default '{}'::jsonb,
  discoverable boolean not null default true,
  city_home_hidden boolean not null default false,
  onboarding_complete boolean not null default false,
  username_last_changed_at timestamptz,
  username_change_count integer not null default 0,
  account_status text not null default 'active',
  account_deleted_at timestamptz,
  account_delete_scheduled_for timestamptz,
  profile_paused_at timestamptz,
  profile_pause_reason text,
  shadow_banned boolean not null default false,
  shadow_ban_reason text,
  shadow_banned_at timestamptz,
  shadow_banned_by text,
  shadow_ban_lifted_at timestamptz,
  shadow_ban_lifted_by text,
  shadow_ban_lift_reason text,
  moderation_notes text,
  photo_violation_count int not null default 0,
  last_photo_violation_at timestamptz,
  two_factor_enabled boolean not null default false,
  two_factor_method text,
  trusted_devices jsonb not null default '[]'::jsonb,
  last_2fa_at timestamptz,
  two_factor_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_member_profiles_city_idx on app_member_profiles (city, onboarding_complete, discoverable);
create unique index if not exists app_member_profiles_email_lower_idx on app_member_profiles (lower(email)) where email is not null and email <> '';
create unique index if not exists app_member_profiles_username_lower_idx on app_member_profiles (lower(username)) where username is not null and username <> '';

create table if not exists city_home_placements (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  profile_id uuid not null references app_member_profiles(id) on delete cascade,
  placement_type text not null default 'auto',
  sort_order integer not null default 0,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  paystack_reference text,
  created_by text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists city_home_placements_city_idx on city_home_placements (city, active, placement_type);
create unique index if not exists city_home_placements_profile_type_idx on city_home_placements (profile_id, placement_type) where active = true and placement_type = 'auto';
create unique index if not exists city_home_placements_paystack_reference_unique_idx on city_home_placements (paystack_reference) where paystack_reference is not null and paystack_reference <> '';

create table if not exists city_spotlight_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  city text not null,
  profile_id uuid,
  viewer_key text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists city_spotlight_events_type_idx on city_spotlight_events (event_type, created_at desc);
create index if not exists city_spotlight_events_city_idx on city_spotlight_events (city, created_at desc);

create table if not exists app_referral_events (
  id uuid primary key default gen_random_uuid(),
  referrer_user_key text not null,
  referred_user_key text not null,
  referral_code text not null,
  reward_days integer not null default 0,
  created_at timestamptz not null default now(),
  unique (referred_user_key)
);

create table if not exists app_profile_likes (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid not null,
  target_profile_id uuid not null,
  photo_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique (actor_profile_id, target_profile_id)
);

create table if not exists app_profile_follows (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid not null,
  target_profile_id uuid not null,
  created_at timestamptz not null default now(),
  unique (actor_profile_id, target_profile_id)
);

create table if not exists saved_profiles (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null,
  saved_member_id uuid not null,
  created_at timestamptz not null default now(),
  unique (member_id, saved_member_id)
);

create index if not exists saved_profiles_member_id_idx on saved_profiles (member_id, created_at desc);
create index if not exists saved_profiles_saved_member_id_idx on saved_profiles (saved_member_id);

create table if not exists connection_notes (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null,
  target_profile_id uuid not null,
  note text not null default '',
  updated_at timestamptz not null default now(),
  unique (owner_profile_id, target_profile_id)
);

create table if not exists moderation_flags (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  profile_id uuid,
  reason text not null,
  severity text not null default 'medium',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by text
);

create index if not exists moderation_flags_open_idx on moderation_flags (resolved_at, created_at desc);

create table if not exists success_stories (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  profile_id uuid,
  story text not null,
  anonymous boolean not null default true,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists member_introductions (
  id uuid primary key default gen_random_uuid(),
  introducer_profile_id uuid not null,
  target_profile_id uuid not null,
  recipient_profile_id uuid not null,
  note text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists login_2fa_codes (
  user_key text primary key,
  code_hash text,
  method text not null,
  verification_reference text,
  attempts int not null default 0,
  last_sent_at timestamptz not null default now(),
  expires_at timestamptz not null,
  device_id text,
  ip text
);

create table if not exists platform_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target_user_id uuid,
  target_user_key text,
  operator_id text,
  operator_email text,
  details jsonb not null default '{}'::jsonb,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists platform_audit_action_idx on platform_audit_log (action, created_at desc);
create index if not exists platform_audit_operator_idx on platform_audit_log (operator_email, created_at desc);
create index if not exists platform_audit_target_idx on platform_audit_log (target_user_key, created_at desc);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  target_user_id uuid,
  operator_id text,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_user_idx on audit_logs (user_id, created_at desc);
create index if not exists audit_logs_target_idx on audit_logs (target_user_id, created_at desc);
create index if not exists audit_logs_action_idx on audit_logs (action, created_at desc);

create table if not exists user_compliance_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references app_member_profiles(id) on delete cascade,
  user_key text not null,
  ack_type text not null,
  version text not null,
  accepted_at timestamptz not null default now(),
  ip text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists user_compliance_user_key_idx on user_compliance_acknowledgements (user_key, ack_type, accepted_at desc);

create table if not exists contact_exchange_requests (
  id uuid primary key default gen_random_uuid(),
  match_id text not null,
  requester_user_key text not null,
  requester_profile_id uuid,
  recipient_user_key text not null,
  recipient_profile_id uuid,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  completed_at timestamptz,
  shared_contacts jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists contact_exchange_match_idx on contact_exchange_requests (match_id, updated_at desc);
create index if not exists contact_exchange_requester_idx on contact_exchange_requests (requester_user_key, status, completed_at desc);
create index if not exists contact_exchange_recipient_idx on contact_exchange_requests (recipient_user_key, status, updated_at desc);

create table if not exists contact_exchange_events (
  id uuid primary key default gen_random_uuid(),
  match_id text not null,
  user_key text not null,
  profile_id uuid,
  event_type text not null,
  field text,
  text_hash text,
  created_at timestamptz not null default now()
);

create index if not exists contact_exchange_events_created_idx on contact_exchange_events (created_at desc);

create table if not exists contact_leak_attempts (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  profile_id uuid,
  field text not null,
  text_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_leak_attempts_created_idx on contact_leak_attempts (created_at desc);

create table if not exists app_fast_connection_daily (
  user_key text primary key,
  used_today integer not null default 0,
  daily_limit integer not null default 30,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists moderation_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target_profile_id uuid,
  target_user_key text,
  operator_email text not null,
  reason text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists moderation_audit_target_idx on moderation_audit_log (target_profile_id, created_at desc);
create index if not exists moderation_audit_action_idx on moderation_audit_log (action, created_at desc);

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  paystack_reference text not null unique,
  user_id text,
  user_email text,
  product_type text not null default 'premium',
  product_id text,
  amount_kobo bigint,
  return_path text,
  verified_at timestamptz,
  email_sent_at timestamptz,
  audit_log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_events_user_email_idx on payment_events (lower(user_email), created_at desc);

create table if not exists payment_initialize_rate_events (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null,
  initialize_action text not null,
  member_id text not null,
  ip text,
  user_agent_hash text,
  client_hash text,
  created_at timestamptz not null default now()
);

create index if not exists payment_initialize_rate_member_idx on payment_initialize_rate_events (endpoint, member_id, created_at desc);
create index if not exists payment_initialize_rate_ip_idx on payment_initialize_rate_events (endpoint, ip, created_at desc);
create index if not exists payment_initialize_rate_client_idx on payment_initialize_rate_events (endpoint, client_hash, created_at desc);

create table if not exists pin_auth_attempts (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  identifier text not null,
  ip text,
  user_agent_hash text,
  attempt_count integer not null default 0,
  first_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz not null default now(),
  locked_until timestamptz
);

create index if not exists pin_auth_attempts_lookup_idx on pin_auth_attempts (action, identifier, ip, user_agent_hash);

create table if not exists pin_reset_codes (
  email text primary key,
  code_hash text not null,
  attempts int not null default 0,
  last_sent_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists photo_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references app_member_profiles(id) on delete cascade,
  auth_user_id uuid,
  user_key text,
  member_name text,
  photo_url text not null,
  photo_type text not null,
  photo_review_status text not null default 'pending_review',
  photo_risk_flags jsonb not null default '[]'::jsonb,
  reject_reason text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists photo_reviews_status_idx on photo_reviews (photo_review_status, created_at desc);
create index if not exists photo_reviews_auth_user_idx on photo_reviews (auth_user_id);
create unique index if not exists photo_reviews_url_idx on photo_reviews (photo_url);

create table if not exists api_rate_events (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null,
  user_key text,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists api_rate_events_lookup_idx on api_rate_events (endpoint, user_key, ip, created_at desc);

create table if not exists email_verification_codes (
  email text primary key,
  code_hash text not null,
  attempts int not null default 0,
  last_sent_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists signup_provisioning_attempts (
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

create index if not exists signup_provisioning_attempts_status_idx on signup_provisioning_attempts (status, expires_at);

create table if not exists spam_message_fingerprints (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  message_hash text not null,
  recipient_profile_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists spam_fingerprints_user_hash_idx on spam_message_fingerprints (user_key, message_hash, created_at desc);

create table if not exists verification_submissions (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  email text,
  phone text,
  user_name text,
  profile_photo text,
  verification_selfie text,
  phone_verified boolean not null default false,
  status text not null default 'pending',
  reject_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists verification_submissions_status_idx on verification_submissions (status, submitted_at desc);
create index if not exists verification_submissions_user_key_idx on verification_submissions (user_key);

create table if not exists whatsapp_verification_codes (
  phone text primary key,
  verification_reference text not null,
  attempts int not null default 0,
  last_sent_at timestamptz not null default now(),
  expires_at timestamptz not null,
  delivery_status text not null default 'sent',
  user_email text,
  created_at timestamptz not null default now()
);
