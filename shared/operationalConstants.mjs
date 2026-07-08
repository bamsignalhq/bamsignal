/**
 * BamSignal operational constants — single source for timeouts, retries, and throttle windows.
 * @see docs/operations/technical-debt-audit.md
 */

/** HTTP client timeouts (external providers) */
export const PAYSTACK_HTTP_TIMEOUT_MS = 20_000;
export const SENDCHAMP_HTTP_TIMEOUT_MS = 15_000;

/** Postgres pool — bounded connections per process */
export const PG_POOL_MAX_DEFAULT = 20;
export const PG_POOL_IDLE_TIMEOUT_MS = 30_000;
export const PG_POOL_CONNECTION_TIMEOUT_MS = 10_000;

/** Readiness probe cache — avoids full registry health sweep on every /ready under burst load */
export const READINESS_PROBE_CACHE_TTL_MS = 3_000;

/** Sendchamp inline retry (network abort only — see also withBoundedRetry) */
export const SENDCHAMP_RETRY_DELAY_MS = 800;
export const SENDCHAMP_MAX_NETWORK_ATTEMPTS = 2;

/** Default bounded retry policy (Paystack, Resend, WhatsApp service) */
export const RETRY_DEFAULT_ATTEMPTS = 3;
export const RETRY_BASE_DELAY_MS = 500;
export const RETRY_MAX_DELAY_MS = 8_000;

/** OTP / token TTLs (server) */
export const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;
export const WHATSAPP_OTP_EXPIRATION_MINUTES = 30;
export const WHATSAPP_OTP_TTL_MS = WHATSAPP_OTP_EXPIRATION_MINUTES * 60 * 1000;
export const ADMIN_CONSENT_TTL_MS = 15 * 60 * 1000;
export const SIGNUP_MATH_CHALLENGE_TTL_MS = 15 * 60 * 1000;
export const SIGNUP_PROVISIONING_TTL_MS = 30 * 60 * 1000;

/** Member auth throttles */
export const MEMBER_AUTH_THROTTLE_WINDOW_MS = 15 * 60 * 1000;
export const MEMBER_AUTH_THROTTLE_LOCK_MS = 15 * 60 * 1000;
export const MEMBER_AUTH_MAX_ATTEMPTS = 5;

/** Admin action PIN throttle */
export const ADMIN_PIN_THROTTLE_WINDOW_MS = 15 * 60 * 1000;
export const ADMIN_PIN_THROTTLE_LOCK_MS = 30 * 60 * 1000;

/** Payment initialize throttle */
export const PAYMENT_INITIALIZE_WINDOW_MS = 60 * 1000;
export const PAYMENT_INITIALIZE_MAX_REQUESTS = 5;
export const PAYMENT_INITIALIZE_BURST_WINDOW_MS = 10 * 1000;
export const PAYMENT_INITIALIZE_BURST_MAX_REQUESTS = 3;

/** Client-side cache TTLs (mirrored server/client — keep in sync) */
export const REMOTE_CONFIG_CACHE_TTL_MS = 60_000;
export const FEATURE_FLAG_CACHE_TTL_MS = 5 * 60 * 1000;

/** Client session / API timeouts */
export const MEMBER_API_TIMEOUT_MS = 8_000;
export const SESSION_REFRESH_TIMEOUT_MS = 4_000;
export const OPEN_APP_STATUS_TIMEOUT_MS = 2_000;
export const OTP_VERIFY_UI_TIMEOUT_MS = 15_000;

/** Background worker intervals */
export const DEFAULT_RATE_LIMIT_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Observability alert debounce (duplicate log suppression) */
export const OBSERVABILITY_ALERT_DEBOUNCE_MS = {
  payment_verify_failed: 2 * 60 * 1000,
  payment_initialize_failed: 2 * 60 * 1000,
  payment_webhook_failed: 2 * 60 * 1000,
  email_send_failed: 5 * 60 * 1000,
  photo_upload_failed: 3 * 60 * 1000,
  photo_storage_unavailable: 5 * 60 * 1000,
  voice_intro_failed: 3 * 60 * 1000,
  profile_save_failed: 3 * 60 * 1000,
  db_unavailable: 5 * 60 * 1000,
  throttle_db_unavailable: 5 * 60 * 1000,
  ready_check_failed: 5 * 60 * 1000,
  background_task_failed: 3 * 60 * 1000,
  retry_exhausted: 5 * 60 * 1000,
  unhandled_request_error: 2 * 60 * 1000
};
