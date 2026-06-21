create index if not exists api_rate_events_created_at_idx
  on api_rate_events (created_at);

create index if not exists payment_initialize_rate_events_created_at_idx
  on payment_initialize_rate_events (created_at);

create index if not exists pin_auth_attempts_last_attempt_at_idx
  on pin_auth_attempts (last_attempt_at);

create index if not exists email_verification_codes_expires_at_idx
  on email_verification_codes (expires_at);

create index if not exists pin_reset_codes_expires_at_idx
  on pin_reset_codes (expires_at);

create index if not exists whatsapp_verification_codes_expires_at_idx
  on whatsapp_verification_codes (expires_at);
