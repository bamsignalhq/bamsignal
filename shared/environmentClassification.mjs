/**
 * Enterprise secret classification — maps registry groups to startup tiers.
 * @see docs/operations/environment/environment-classification.md
 */

/** @typedef {'critical'|'important'|'optional'|'development'} SecretTier */

/**
 * Feature/integration definitions used by validation, bootstrap, and readiness.
 * @type {Array<{
 *   id: string;
 *   label: string;
 *   tier: SecretTier;
 *   productFeature?: string;
 *   requiredEnv: string[];
 *   optionalEnv?: string[];
 * }>}
 */
export const STARTUP_FEATURE_DEFINITIONS = [
  {
    id: "database",
    label: "Database",
    tier: "critical",
    productFeature: "Core Platform",
    requiredEnv: ["DATABASE_URL"]
  },
  {
    id: "supabase",
    label: "Supabase",
    tier: "critical",
    productFeature: "Auth & Storage",
    requiredEnv: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    optionalEnv: ["SUPABASE_ANON_KEY", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]
  },
  {
    id: "application",
    label: "Application URL",
    tier: "critical",
    productFeature: "Core Platform",
    requiredEnv: ["VITE_PUBLIC_APP_URL"],
    optionalEnv: ["PUBLIC_APP_URL", "NODE_ENV"]
  },
  {
    id: "payments",
    label: "Paystack",
    tier: "critical",
    productFeature: "Payments",
    requiredEnv: ["PAYSTACK_SECRET_KEY", "VITE_PAYSTACK_PUBLIC_KEY"]
  },
  {
    id: "admin-auth",
    label: "Command Center",
    tier: "critical",
    productFeature: "Admin Operations",
    requiredEnv: ["COMMAND_CENTER_PIN", "COMMAND_CENTER_EMAILS"]
  },
  {
    id: "operations",
    label: "Cron & Diagnostics",
    tier: "critical",
    productFeature: "Operations",
    requiredEnv: ["CRON_SECRET"]
  },
  {
    id: "email",
    label: "Resend Email",
    tier: "important",
    productFeature: "Signup Email",
    requiredEnv: ["RESEND_API_KEY"],
    optionalEnv: ["SIGNUP_EMAIL_FROM", "SUPPORT_EMAIL_FROM"]
  },
  {
    id: "whatsapp",
    label: "Sendchamp WhatsApp",
    tier: "important",
    productFeature: "WhatsApp Verification",
    requiredEnv: ["SENDCHAMP_API_KEY", "SENDCHAMP_WHATSAPP_SENDER"],
    optionalEnv: ["SENDCHAMP_SENDER", "SENDCHAMP_BASE_URL"]
  },
  {
    id: "firebase",
    label: "Firebase Push",
    tier: "important",
    productFeature: "Push Notifications",
    requiredEnv: [],
    optionalEnv: [
      "FIREBASE_SERVICE_ACCOUNT_JSON",
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
      "VITE_FIREBASE_API_KEY",
      "VITE_FIREBASE_PROJECT_ID"
    ]
  },
  {
    id: "photo-storage",
    label: "Photo Storage",
    tier: "important",
    productFeature: "Member Photos",
    requiredEnv: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
  },
  {
    id: "google-calendar",
    label: "Google Calendar",
    tier: "optional",
    productFeature: "Calendar Sync",
    requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"],
    optionalEnv: ["GOOGLE_CALENDAR_REFRESH_TOKEN", "GOOGLE_CALENDAR_ID"]
  },
  {
    id: "zoom",
    label: "Zoom",
    tier: "optional",
    productFeature: "Zoom Meetings",
    requiredEnv: ["ZOOM_CLIENT_ID", "ZOOM_CLIENT_SECRET"],
    optionalEnv: ["ZOOM_ACCOUNT_ID"]
  },
  {
    id: "google-meet",
    label: "Google Meet",
    tier: "optional",
    productFeature: "Meet Links",
    requiredEnv: ["GOOGLE_MEET_CLIENT_ID", "GOOGLE_MEET_CLIENT_SECRET"],
    optionalEnv: ["GOOGLE_MEET_REFRESH_TOKEN", "GOOGLE_MEET_CALENDAR_ID"]
  },
  {
    id: "openai",
    label: "OpenAI",
    tier: "optional",
    productFeature: "AI Workspace",
    requiredEnv: ["OPENAI_API_KEY"],
    optionalEnv: ["OPENAI_MODEL"]
  },
  {
    id: "telegram",
    label: "Telegram",
    tier: "optional",
    productFeature: "Telegram Bot",
    requiredEnv: ["TELEGRAM_BOT_TOKEN"],
    optionalEnv: ["TELEGRAM_FREE_CHANNEL_ID", "TELEGRAM_VIP_GROUP_ID", "TELEGRAM_WEBHOOK_SECRET"]
  }
];

/** Variables only required in local/dev tooling — never block production. */
export const DEVELOPMENT_ONLY_ENV = [
  "ADMIN_BOOTSTRAP_ENABLED",
  "ADMIN_BOOTSTRAP_SECRET",
  "ADMIN_BOOTSTRAP_EMAIL",
  "ADMIN_BOOTSTRAP_PASSWORD",
  "LEGACY_SETUP_ENABLED",
  "LEGACY_SETUP_SECRET",
  "CAP_SERVER_URL",
  "VITE_STORE_SCREENSHOTS",
  "TELEGRAM_ENABLE_POLLING",
  "CERTIFICATION_BASE_URL",
  "CERTIFICATION_EMAIL_DOMAIN",
  "CERTIFICATION_EXECUTION_MODE",
  "ENV_TARGET",
  "PGSSLMODE",
  "SMOKE_PORT",
  "BAMSIGNAL_STARTUP_MODE",
  "BAMSIGNAL_SMOKE_IMPORT",
  "BAMSIGNAL_SMOKE_STARTUP"
];

function isEmpty(value) {
  return !String(value ?? "").trim();
}

function resolveEnvValue(env, name) {
  if (!isEmpty(env[name])) return env[name];
  return undefined;
}

/**
 * Evaluate a single feature integration.
 * @param {typeof STARTUP_FEATURE_DEFINITIONS[number]} definition
 * @param {Record<string, string|undefined>} env
 */
export function evaluateFeature(definition, env = process.env) {
  const missing = definition.requiredEnv.filter((name) => isEmpty(resolveEnvValue(env, name)));
  const enabled = missing.length === 0;
  let reason = enabled ? "configured" : `missing ${missing.join(", ")}`;

  if (definition.id === "firebase") {
    const hasJson = !isEmpty(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const hasDiscrete =
      !isEmpty(env.FIREBASE_PROJECT_ID) &&
      !isEmpty(env.FIREBASE_CLIENT_EMAIL) &&
      !isEmpty(env.FIREBASE_PRIVATE_KEY);
    const firebaseEnabled = hasJson || hasDiscrete;
    return {
      id: definition.id,
      label: definition.label,
      tier: definition.tier,
      productFeature: definition.productFeature,
      enabled: firebaseEnabled,
      healthy: firebaseEnabled,
      reason: firebaseEnabled ? "configured" : "firebase credentials not configured"
    };
  }

  if (definition.id === "photo-storage") {
    const supabaseOk =
      !isEmpty(env.SUPABASE_URL) && !isEmpty(env.SUPABASE_SERVICE_ROLE_KEY);
    return {
      id: definition.id,
      label: definition.label,
      tier: definition.tier,
      productFeature: definition.productFeature,
      enabled: supabaseOk,
      healthy: supabaseOk,
      reason: supabaseOk ? "supabase storage available" : "supabase storage credentials missing"
    };
  }

  return {
    id: definition.id,
    label: definition.label,
    tier: definition.tier,
    productFeature: definition.productFeature,
    enabled,
    healthy: enabled,
    reason
  };
}

/** @returns {ReturnType<typeof evaluateFeature>[]} */
export function evaluateAllFeatures(env = process.env) {
  return STARTUP_FEATURE_DEFINITIONS.map((definition) => evaluateFeature(definition, env));
}

export function featuresByTier(features) {
  return {
    critical: features.filter((f) => f.tier === "critical"),
    important: features.filter((f) => f.tier === "important"),
    optional: features.filter((f) => f.tier === "optional")
  };
}
