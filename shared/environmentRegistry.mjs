/**
 * BamSignal environment variable registry for validation tooling.
 * Names and rules only — never embed secret values.
 * Source of truth for docs: docs/operations/environment/required-secrets.md
 */

export const ENVIRONMENTS = ["local", "development", "preview", "staging", "production"];

export const PLACEHOLDER_PATTERNS = [
  /^<.*>$/,
  /changeme/i,
  /your[-_]?/i,
  /replace[-_]?me/i,
  /^xxx+$/i,
  /^todo$/i,
  /example\.com\/your/i
];

export const DUPLICATE_GROUPS = [
  {
    id: "paystack-public-key",
    canonical: "VITE_PAYSTACK_PUBLIC_KEY",
    variables: ["VITE_PAYSTACK_PUBLIC_KEY", "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", "PAYSTACK_PUBLIC_KEY"]
  },
  {
    id: "supabase-url",
    canonical: "SUPABASE_URL",
    variables: ["SUPABASE_URL", "VITE_SUPABASE_URL"]
  },
  {
    id: "supabase-anon-key",
    canonical: "SUPABASE_ANON_KEY",
    variables: ["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]
  },
  {
    id: "supabase-service-key",
    canonical: "SUPABASE_SERVICE_ROLE_KEY",
    variables: ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"]
  },
  {
    id: "public-app-url",
    canonical: "PUBLIC_APP_URL",
    variables: ["PUBLIC_APP_URL", "VITE_PUBLIC_APP_URL"]
  },
  {
    id: "command-center-pin",
    canonical: "COMMAND_CENTER_PIN",
    variables: ["COMMAND_CENTER_PIN", "ADMIN_ACTION_PIN"]
  },
  {
    id: "command-center-emails",
    canonical: "COMMAND_CENTER_EMAILS",
    variables: ["COMMAND_CENTER_EMAILS", "ADMIN_EMAILS"]
  }
];

/** @typedef {'critical'|'warning'|'optional'} EnvRequired */
/** @typedef {'buildtime'|'runtime'|'both'} EnvScope */

/**
 * @type {Array<{
 *   name: string;
 *   group: string;
 *   scope: EnvScope;
 *   required: EnvRequired;
 *   owner: string;
 *   rotation: string;
 *   validate?: string;
 *   envs: string[];
 *   aliases?: string[];
 * }>}
 */
export const ENV_REGISTRY = [
  // Application
  { name: "NODE_ENV", group: "application", scope: "runtime", required: "critical", owner: "Engineering", rotation: "n/a", validate: "enum:development,production,test", envs: ["local", "development", "preview", "staging", "production"] },
  { name: "PORT", group: "application", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "port", envs: ["local", "development", "preview", "staging", "production"] },
  { name: "HOST", group: "application", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["local", "development", "preview", "staging", "production"] },
  { name: "PUBLIC_APP_URL", group: "application", scope: "runtime", required: "critical", owner: "Engineering", rotation: "n/a", validate: "url", aliases: ["VITE_PUBLIC_APP_URL"], envs: ["preview", "staging", "production"] },
  { name: "VITE_PUBLIC_APP_URL", group: "application", scope: "buildtime", required: "critical", owner: "Engineering", rotation: "n/a", validate: "url", envs: ["local", "development", "preview", "staging", "production"] },
  { name: "APP_TIMEZONE", group: "application", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "RUN_MIGRATIONS_ON_STARTUP", group: "application", scope: "runtime", required: "warning", owner: "Engineering", rotation: "n/a", validate: "boolean", envs: ["staging", "production"] },

  // Supabase
  { name: "DATABASE_URL", group: "supabase", scope: "runtime", required: "critical", owner: "Engineering", rotation: "on-compromise", validate: "postgres-url", envs: ["local", "development", "staging", "production"] },
  { name: "VITE_SUPABASE_URL", group: "supabase", scope: "buildtime", required: "critical", owner: "Engineering", rotation: "n/a", validate: "supabase-url", envs: ["local", "development", "preview", "staging", "production"] },
  { name: "VITE_SUPABASE_ANON_KEY", group: "supabase", scope: "buildtime", required: "critical", owner: "Engineering", rotation: "supabase-rotate", validate: "supabase-anon", envs: ["local", "development", "preview", "staging", "production"] },
  { name: "SUPABASE_URL", group: "supabase", scope: "runtime", required: "critical", owner: "Engineering", rotation: "n/a", validate: "supabase-url", aliases: ["VITE_SUPABASE_URL"], envs: ["staging", "production"] },
  { name: "SUPABASE_SERVICE_ROLE_KEY", group: "supabase", scope: "runtime", required: "critical", owner: "Engineering", rotation: "quarterly", validate: "supabase-service", aliases: ["SUPABASE_SECRET_KEY"], envs: ["staging", "production"] },
  { name: "SUPABASE_ANON_KEY", group: "supabase", scope: "runtime", required: "warning", owner: "Engineering", rotation: "supabase-rotate", validate: "supabase-anon", aliases: ["VITE_SUPABASE_ANON_KEY"], envs: ["staging", "production"] },
  { name: "PGSSLMODE", group: "supabase", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["local", "development"] },

  // Authentication (member PIN + admin)
  { name: "COMMAND_CENTER_PIN", group: "authentication", scope: "runtime", required: "critical", owner: "Security", rotation: "quarterly", validate: "pin", aliases: ["ADMIN_ACTION_PIN"], envs: ["staging", "production"] },
  { name: "COMMAND_CENTER_EMAILS", group: "authentication", scope: "runtime", required: "critical", owner: "Security", rotation: "on-personnel-change", aliases: ["ADMIN_EMAILS"], envs: ["staging", "production"] },
  { name: "ADMIN_BOOTSTRAP_ENABLED", group: "authentication", scope: "runtime", required: "optional", owner: "Security", rotation: "n/a", validate: "boolean", envs: ["local", "development"] },
  { name: "ADMIN_BOOTSTRAP_SECRET", group: "authentication", scope: "runtime", required: "optional", owner: "Security", rotation: "single-use", envs: ["local", "development"] },
  { name: "ADMIN_BOOTSTRAP_EMAIL", group: "authentication", scope: "runtime", required: "optional", owner: "Security", rotation: "n/a", validate: "email", envs: ["local", "development"] },
  { name: "ADMIN_BOOTSTRAP_PASSWORD", group: "authentication", scope: "runtime", required: "optional", owner: "Security", rotation: "single-use", envs: ["local", "development"] },
  { name: "LEGACY_SETUP_ENABLED", group: "authentication", scope: "runtime", required: "optional", owner: "Security", rotation: "n/a", validate: "boolean", envs: ["local"] },
  { name: "LEGACY_SETUP_SECRET", group: "authentication", scope: "runtime", required: "optional", owner: "Security", rotation: "single-use", envs: ["local"] },
  { name: "SIGNUP_MATH_CHALLENGE_SECRET", group: "authentication", scope: "runtime", required: "optional", owner: "Security", rotation: "quarterly", envs: ["staging", "production"] },

  // Payments
  { name: "PAYSTACK_SECRET_KEY", group: "payments", scope: "runtime", required: "critical", owner: "Finance Ops", rotation: "on-compromise", validate: "paystack-secret", envs: ["staging", "production"] },
  { name: "VITE_PAYSTACK_PUBLIC_KEY", group: "payments", scope: "buildtime", required: "critical", owner: "Finance Ops", rotation: "n/a", validate: "paystack-public", aliases: ["NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", "PAYSTACK_PUBLIC_KEY"], envs: ["local", "development", "preview", "staging", "production"] },
  { name: "PAYSTACK_CALLBACK_URL", group: "payments", scope: "runtime", required: "warning", owner: "Finance Ops", rotation: "n/a", validate: "url", envs: ["staging", "production"] },
  { name: "PAYSTACK_ANDROID_CALLBACK_URL", group: "payments", scope: "runtime", required: "warning", owner: "Finance Ops", rotation: "n/a", validate: "deep-link-scheme", envs: ["staging", "production"] },
  { name: "PAYSTACK_WEBHOOK_URL", group: "payments", scope: "runtime", required: "warning", owner: "Finance Ops", rotation: "n/a", validate: "url", envs: ["staging", "production"] },
  { name: "PAYSTACK_WEBHOOK_SECRET", group: "payments", scope: "runtime", required: "warning", owner: "Finance Ops", rotation: "on-compromise", validate: "paystack-secret", envs: ["staging", "production"] },

  // Email
  { name: "RESEND_API_KEY", group: "email", scope: "runtime", required: "critical", owner: "Engineering", rotation: "annual", validate: "resend-key", envs: ["staging", "production"] },
  { name: "SIGNUP_EMAIL_FROM", group: "email", scope: "runtime", required: "warning", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "SUPPORT_EMAIL_FROM", group: "email", scope: "runtime", required: "warning", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "CONCIERGE_EMAIL_FROM", group: "email", scope: "runtime", required: "optional", owner: "Operations", rotation: "n/a", envs: ["production"] },
  { name: "SUPPORT_EMAIL_TO", group: "email", scope: "runtime", required: "optional", owner: "Operations", rotation: "n/a", envs: ["production"] },
  { name: "VITE_SUPPORT_EMAIL", group: "email", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "email", envs: ["local", "development", "staging", "production"] },

  // WhatsApp
  { name: "SENDCHAMP_API_KEY", group: "whatsapp", scope: "runtime", required: "warning", owner: "Operations", rotation: "annual", envs: ["staging", "production"] },
  { name: "SENDCHAMP_SENDER", group: "whatsapp", scope: "runtime", required: "warning", owner: "Operations", rotation: "n/a", envs: ["staging", "production"] },
  { name: "SENDCHAMP_WHATSAPP_SENDER", group: "whatsapp", scope: "runtime", required: "warning", owner: "Operations", rotation: "n/a", envs: ["staging", "production"] },
  { name: "SENDCHAMP_BASE_URL", group: "whatsapp", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "url", envs: ["staging", "production"] },

  // Google Calendar
  { name: "GOOGLE_CLIENT_ID", group: "google-calendar", scope: "runtime", required: "warning", owner: "Operations", rotation: "annual", envs: ["staging", "production"] },
  { name: "GOOGLE_CLIENT_SECRET", group: "google-calendar", scope: "runtime", required: "warning", owner: "Operations", rotation: "annual", envs: ["staging", "production"] },
  { name: "GOOGLE_REDIRECT_URI", group: "google-calendar", scope: "runtime", required: "warning", owner: "Operations", rotation: "n/a", validate: "url", envs: ["staging", "production"] },
  { name: "GOOGLE_CALENDAR_REFRESH_TOKEN", group: "google-calendar", scope: "runtime", required: "warning", owner: "Operations", rotation: "oauth-refresh", envs: ["production"] },
  { name: "GOOGLE_CALENDAR_ID", group: "google-calendar", scope: "runtime", required: "optional", owner: "Operations", rotation: "n/a", envs: ["production"] },

  // Zoom
  { name: "ZOOM_CLIENT_ID", group: "zoom", scope: "runtime", required: "warning", owner: "Operations", rotation: "annual", envs: ["staging", "production"] },
  { name: "ZOOM_CLIENT_SECRET", group: "zoom", scope: "runtime", required: "warning", owner: "Operations", rotation: "annual", envs: ["staging", "production"] },
  { name: "ZOOM_ACCOUNT_ID", group: "zoom", scope: "runtime", required: "warning", owner: "Operations", rotation: "n/a", envs: ["production"] },

  // Google Meet
  { name: "GOOGLE_MEET_CLIENT_ID", group: "google-meet", scope: "runtime", required: "warning", owner: "Operations", rotation: "annual", envs: ["staging", "production"] },
  { name: "GOOGLE_MEET_CLIENT_SECRET", group: "google-meet", scope: "runtime", required: "warning", owner: "Operations", rotation: "annual", envs: ["staging", "production"] },
  { name: "GOOGLE_MEET_REFRESH_TOKEN", group: "google-meet", scope: "runtime", required: "warning", owner: "Operations", rotation: "oauth-refresh", envs: ["production"] },

  // Storage / Firebase push
  { name: "FIREBASE_SERVICE_ACCOUNT_JSON", group: "storage", scope: "runtime", required: "optional", owner: "Engineering", rotation: "on-compromise", validate: "json", envs: ["staging", "production"] },
  { name: "FIREBASE_PROJECT_ID", group: "storage", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "FIREBASE_CLIENT_EMAIL", group: "storage", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "FIREBASE_PRIVATE_KEY", group: "storage", scope: "runtime", required: "optional", owner: "Engineering", rotation: "on-compromise", envs: ["staging", "production"] },
  { name: "VITE_FIREBASE_API_KEY", group: "notifications", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "VITE_FIREBASE_AUTH_DOMAIN", group: "notifications", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "VITE_FIREBASE_PROJECT_ID", group: "notifications", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "VITE_FIREBASE_STORAGE_BUCKET", group: "notifications", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "VITE_FIREBASE_MESSAGING_SENDER_ID", group: "notifications", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "VITE_FIREBASE_APP_ID", group: "notifications", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },

  // Operations / secrets
  { name: "CRON_SECRET", group: "operations", scope: "runtime", required: "critical", owner: "Security", rotation: "quarterly", envs: ["staging", "production"] },
  { name: "DIAGNOSTICS_SECRET", group: "operations", scope: "runtime", required: "warning", owner: "Security", rotation: "quarterly", envs: ["staging", "production"] },
  { name: "ADMIN_CONSENT_SECRET", group: "operations", scope: "runtime", required: "optional", owner: "Security", rotation: "quarterly", envs: ["production"] },
  { name: "RATE_LIMIT_CLEANUP_INTERVAL_MS", group: "operations", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },

  // Feature flags (buildtime)
  { name: "VITE_ENABLE_REFERRALS_UI", group: "feature-flags", scope: "buildtime", required: "optional", owner: "Product", rotation: "n/a", validate: "boolean", envs: ["local", "development", "staging", "production"] },
  { name: "VITE_ENABLE_IMAGE_MODERATION", group: "feature-flags", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "boolean", envs: ["staging", "production"] },
  { name: "VITE_PHOTO_MODERATION_MODE", group: "feature-flags", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "enum:upload_first,review,strict", envs: ["staging", "production"] },
  { name: "PHOTO_MODERATION_MODE", group: "feature-flags", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "enum:upload_first,review,strict", envs: ["staging", "production"] },
  { name: "VITE_STORE_SCREENSHOTS", group: "feature-flags", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "boolean", envs: ["local", "development"] },
  { name: "CAP_SERVER_URL", group: "application", scope: "buildtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "url", envs: ["local", "development"] },

  // Optional integrations
  { name: "TELEGRAM_BOT_TOKEN", group: "analytics", scope: "runtime", required: "optional", owner: "Engineering", rotation: "on-compromise", envs: ["production"] },
  { name: "TELEGRAM_FREE_CHANNEL_ID", group: "analytics", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["production"] },
  { name: "TELEGRAM_VIP_GROUP_ID", group: "analytics", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["production"] },
  { name: "TELEGRAM_WEBHOOK_SECRET", group: "analytics", scope: "runtime", required: "optional", owner: "Engineering", rotation: "on-compromise", envs: ["production"] },
  { name: "TELEGRAM_ENABLE_POLLING", group: "analytics", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "boolean", envs: ["local", "development"] },

  // OpenAI (optional — AI workspace / consultant assist; not on critical path)
  { name: "OPENAI_API_KEY", group: "openai", scope: "runtime", required: "optional", owner: "Engineering", rotation: "on-compromise", validate: "openai-key", envs: ["staging", "production"] },
  { name: "OPENAI_MODEL", group: "openai", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },

  // Certification runners
  { name: "CERTIFICATION_BASE_URL", group: "certification", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "url", envs: ["local", "development", "staging", "production"] },
  { name: "CERTIFICATION_EMAIL_DOMAIN", group: "certification", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["staging", "production"] },
  { name: "CERTIFICATION_EXECUTION_MODE", group: "certification", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", validate: "enum:dry-run,staging,production", envs: ["local", "development", "staging", "production"] },
  { name: "ENV_TARGET", group: "certification", scope: "runtime", required: "optional", owner: "Engineering", rotation: "n/a", envs: ["local", "development", "staging", "production"] },
  { name: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", group: "payments", scope: "buildtime", required: "optional", owner: "Finance Ops", rotation: "n/a", validate: "paystack-public", envs: ["staging", "production"] }
];

/** Where each variable is read (paths relative to repo root). */
export const ENV_USED_IN = {
  DATABASE_URL: ["server/db.js", "server/config.js", "certification/database/run.mjs"],
  VITE_SUPABASE_URL: ["src/lib/supabaseClient.ts", "server/supabaseEnv.js", "vite build (Dockerfile ARG)"],
  VITE_SUPABASE_ANON_KEY: ["src/lib/supabaseClient.ts", "server/supabaseEnv.js"],
  SUPABASE_URL: ["server/supabaseEnv.js", "server/services/photoStorage.js"],
  SUPABASE_SERVICE_ROLE_KEY: ["server/supabaseEnv.js", "server/services/photoStorage.js", "api/auth/email-code.js"],
  SUPABASE_ANON_KEY: ["server/services/photoStorage.js", "api/member/photos.js"],
  PAYSTACK_SECRET_KEY: ["server/config.js", "server/routes/paystack.js", "server/services/readiness.js"],
  VITE_PAYSTACK_PUBLIC_KEY: ["src/services/payments.ts", "server/config.js"],
  RESEND_API_KEY: ["server/services/contactMail.js", "server/services/signupOtp.js", "server/services/readiness.js"],
  SENDCHAMP_API_KEY: ["server/services/sendchamp.js", "server/config.js"],
  SENDCHAMP_SENDER: ["server/services/sendchamp.js"],
  SENDCHAMP_WHATSAPP_SENDER: ["server/services/sendchamp.js", "api/verify/whatsapp/start.js"],
  GOOGLE_CLIENT_ID: ["server/config.js", "server/routes/consultationScheduling.js"],
  GOOGLE_CLIENT_SECRET: ["server/config.js", "server/routes/consultationScheduling.js"],
  GOOGLE_REDIRECT_URI: ["server/config.js"],
  GOOGLE_CALENDAR_REFRESH_TOKEN: ["server/config.js", "server/services/meetingInfrastructure.js"],
  ZOOM_CLIENT_ID: ["server/config.js", "server/services/meetingInfrastructure.js"],
  ZOOM_CLIENT_SECRET: ["server/config.js"],
  ZOOM_ACCOUNT_ID: ["server/config.js"],
  GOOGLE_MEET_CLIENT_ID: ["server/config.js"],
  GOOGLE_MEET_CLIENT_SECRET: ["server/config.js"],
  GOOGLE_MEET_REFRESH_TOKEN: ["server/config.js"],
  FIREBASE_SERVICE_ACCOUNT_JSON: ["server/firebase.js", "server/services/readiness.js"],
  VITE_FIREBASE_API_KEY: ["src/firebase.ts", "capacitor push (android)"],
  VITE_FIREBASE_PROJECT_ID: ["src/firebase.ts"],
  OPENAI_API_KEY: ["src/constants/aiAssistedConsultant.ts", "certification/chaos (optional)"],
  COMMAND_CENTER_PIN: ["server/consoleEnv.js", "server/services/productionSecurity.js"],
  COMMAND_CENTER_EMAILS: ["server/consoleEnv.js", "server/services/productionSecurity.js"],
  ADMIN_ACTION_PIN: ["server/consoleEnv.js"],
  ADMIN_EMAILS: ["server/consoleEnv.js"],
  CRON_SECRET: ["server/services/diagnosticsAccess.js", "server/adminAuth.js"],
  DIAGNOSTICS_SECRET: ["server/services/diagnosticsAccess.js", "certification/production-smoke/config.mjs"],
  PUBLIC_APP_URL: ["server/config.js", "server/seoSitemap.js"],
  PGSSLMODE: ["server/db.js", "server/migrationRunner.js"],
  PHOTO_MODERATION_MODE: ["server/services/photoModerationProvider.js"],
  FIREBASE_PROJECT_ID: ["server/firebaseEnv.js"],
  FIREBASE_CLIENT_EMAIL: ["server/firebaseEnv.js"],
  FIREBASE_PRIVATE_KEY: ["server/firebaseEnv.js"],
  RATE_LIMIT_CLEANUP_INTERVAL_MS: ["server/services/rateLimitRetention.js"],
  SIGNUP_MATH_CHALLENGE_SECRET: ["server/services/signupMathChallenge.js"],
  CERTIFICATION_EMAIL_DOMAIN: ["server/services/certificationE2e.js", "certification/e2e/config.mjs"],
  TELEGRAM_WEBHOOK_SECRET: ["api/auth/identity.js"],
  TELEGRAM_FREE_CHANNEL_ID: ["server/config.js"],
  TELEGRAM_VIP_GROUP_ID: ["server/config.js"],
  CAP_SERVER_URL: ["capacitor.config.ts"],
  ADMIN_BOOTSTRAP_EMAIL: ["api/admin/bootstrap.js", "scripts/bootstrap-admin.mjs"],
  ADMIN_BOOTSTRAP_PASSWORD: ["server/services/adminBootstrap.js", "api/admin/bootstrap.js"],
  CERTIFICATION_BASE_URL: ["certification/e2e/config.mjs", "certification/platform-load/config.mjs"]
};

export function registryEntryWithUsage(entry) {
  return { ...entry, usedIn: ENV_USED_IN[entry.name] || [] };
}

export function registryForEnvironment(env) {
  const normalized = String(env || "production").toLowerCase();
  return ENV_REGISTRY.filter((entry) => entry.envs.includes(normalized)).map(registryEntryWithUsage);
}
