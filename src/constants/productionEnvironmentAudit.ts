/** Production Environment Audit™ — integration registry and env inventory. */

import type { ProductionEnvIntegrationId, ProductionEnvVariable } from "../types/productionEnvironmentAudit";

export const PRODUCTION_ENV_INTEGRATIONS: {
  id: ProductionEnvIntegrationId;
  label: string;
}[] = [
  { id: "supabase", label: "Supabase" },
  { id: "paystack", label: "Paystack" },
  { id: "resend", label: "Resend" },
  { id: "sendchamp", label: "Sendchamp" },
  { id: "google-calendar", label: "Google Calendar" },
  { id: "google-meet", label: "Google Meet" },
  { id: "zoom", label: "Zoom" },
  { id: "storage", label: "Storage" },
  { id: "jwt", label: "JWT" },
  { id: "secrets", label: "Secrets" },
  { id: "deep-links", label: "Deep Links" },
  { id: "android", label: "Android" },
  { id: "ios", label: "iOS" },
  { id: "pwa", label: "PWA" },
  { id: "vapid", label: "VAPID" },
  { id: "cron-jobs", label: "Cron Jobs" },
  { id: "webhooks", label: "Webhooks" }
];

export const PRODUCTION_ENV_PLACEHOLDER_PATTERNS = [
  /^<.*>$/,
  /changeme/i,
  /your[-_]?/i,
  /replace[-_]?me/i,
  /^xxx+$/i,
  /^todo$/i,
  /example\.com\/your/i
] as const;

export const PRODUCTION_ENV_DUPLICATE_GROUPS = [
  {
    id: "paystack-public-key",
    label: "Paystack public key",
    canonical: "VITE_PAYSTACK_PUBLIC_KEY",
    variables: ["VITE_PAYSTACK_PUBLIC_KEY", "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", "PAYSTACK_PUBLIC_KEY"],
    summary: "Client build uses VITE_* — set one canonical value at Docker buildtime."
  },
  {
    id: "supabase-url",
    label: "Supabase project URL",
    canonical: "SUPABASE_URL",
    variables: ["SUPABASE_URL", "VITE_SUPABASE_URL"],
    summary: "Runtime server prefers SUPABASE_URL; VITE_* required at build for client + admin JWT verify."
  },
  {
    id: "supabase-anon-key",
    label: "Supabase anon key",
    canonical: "SUPABASE_ANON_KEY",
    variables: ["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"],
    summary: "Runtime photo JWT verify uses SUPABASE_ANON_KEY; client bundle needs VITE_SUPABASE_ANON_KEY."
  },
  {
    id: "supabase-service-key",
    label: "Supabase service role key",
    canonical: "SUPABASE_SERVICE_ROLE_KEY",
    variables: ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"],
    summary: "SUPABASE_SECRET_KEY is legacy alias — prefer SUPABASE_SERVICE_ROLE_KEY in Coolify."
  },
  {
    id: "command-center-pin",
    label: "Admin action PIN",
    canonical: "COMMAND_CENTER_PIN",
    variables: ["COMMAND_CENTER_PIN", "ADMIN_ACTION_PIN"],
    summary: "COMMAND_CENTER_PIN is canonical — ADMIN_ACTION_PIN is deprecated alias."
  },
  {
    id: "command-center-emails",
    label: "Operator allowlist",
    canonical: "COMMAND_CENTER_EMAILS",
    variables: ["COMMAND_CENTER_EMAILS", "ADMIN_EMAILS"],
    summary: "COMMAND_CENTER_EMAILS is canonical — ADMIN_EMAILS is deprecated alias."
  },
  {
    id: "paystack-webhook-secret",
    label: "Paystack webhook signing",
    canonical: "PAYSTACK_WEBHOOK_SECRET",
    variables: ["PAYSTACK_WEBHOOK_SECRET", "PAYSTACK_SECRET_KEY"],
    summary: "Dedicated PAYSTACK_WEBHOOK_SECRET recommended; falls back to PAYSTACK_SECRET_KEY."
  },
  {
    id: "public-app-url",
    label: "Public app URL",
    canonical: "PUBLIC_APP_URL",
    variables: ["PUBLIC_APP_URL", "VITE_PUBLIC_APP_URL"],
    summary: "Server callbacks use PUBLIC_APP_URL; client embeds VITE_PUBLIC_APP_URL at build."
  },
  {
    id: "photo-moderation-mode",
    label: "Photo moderation mode",
    canonical: "PHOTO_MODERATION_MODE",
    variables: ["PHOTO_MODERATION_MODE", "VITE_PHOTO_MODERATION_MODE"],
    summary: "Server authority is PHOTO_MODERATION_MODE; client mirrors with VITE_* for UI hints."
  }
] as const;

/** Authoritative env registry — every production integration variable. */
export const PRODUCTION_ENV_REGISTRY: ProductionEnvVariable[] = [
  // Supabase
  {
    name: "DATABASE_URL",
    integrationId: "supabase",
    scope: "runtime",
    required: "critical",
    referencedIn: ["server/db.js", "server/services/readiness.js"]
  },
  {
    name: "VITE_SUPABASE_URL",
    integrationId: "supabase",
    scope: "buildtime",
    required: "critical",
    referencedIn: ["src/services/supabase.ts", "server/adminAuth.js", "Dockerfile"]
  },
  {
    name: "VITE_SUPABASE_ANON_KEY",
    integrationId: "supabase",
    scope: "buildtime",
    required: "critical",
    referencedIn: ["src/services/supabase.ts", "server/adminAuth.js", "Dockerfile"]
  },
  {
    name: "SUPABASE_URL",
    integrationId: "supabase",
    scope: "runtime",
    required: "critical",
    aliases: ["VITE_SUPABASE_URL"],
    referencedIn: ["server/supabaseEnv.js"]
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    integrationId: "supabase",
    scope: "runtime",
    required: "critical",
    aliases: ["SUPABASE_SECRET_KEY"],
    referencedIn: ["server/supabaseEnv.js", "server/services/photoStorage.js"]
  },
  {
    name: "SUPABASE_ANON_KEY",
    integrationId: "supabase",
    scope: "runtime",
    required: "warning",
    aliases: ["VITE_SUPABASE_ANON_KEY"],
    referencedIn: ["server/supabaseEnv.js", "server/services/pinLogin.js"]
  },
  // Paystack
  {
    name: "PAYSTACK_SECRET_KEY",
    integrationId: "paystack",
    scope: "runtime",
    required: "critical",
    referencedIn: ["server/config.js", "server/services/readiness.js"]
  },
  {
    name: "VITE_PAYSTACK_PUBLIC_KEY",
    integrationId: "paystack",
    scope: "buildtime",
    required: "critical",
    aliases: ["NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", "PAYSTACK_PUBLIC_KEY"],
    referencedIn: ["src/config/paystack.ts", "Dockerfile"]
  },
  {
    name: "PAYSTACK_CALLBACK_URL",
    integrationId: "paystack",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "PAYSTACK_ANDROID_CALLBACK_URL",
    integrationId: "paystack",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js", "android deep links"]
  },
  {
    name: "PAYSTACK_WEBHOOK_URL",
    integrationId: "webhooks",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "PAYSTACK_WEBHOOK_SECRET",
    integrationId: "webhooks",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/paystackConsultationService.js"]
  },
  // Resend
  {
    name: "RESEND_API_KEY",
    integrationId: "resend",
    scope: "runtime",
    required: "critical",
    referencedIn: ["server/supabaseEnv.js", "server/services/signupOtp.js", "server/services/purchaseEmail.js"]
  },
  {
    name: "SIGNUP_EMAIL_FROM",
    integrationId: "resend",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/signupOtp.js"]
  },
  {
    name: "SUPPORT_EMAIL_FROM",
    integrationId: "resend",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/contactMail.js"]
  },
  {
    name: "CONCIERGE_EMAIL_FROM",
    integrationId: "resend",
    scope: "runtime",
    required: "optional",
    referencedIn: ["server/services/conciergeEmailService.js"]
  },
  {
    name: "SUPPORT_EMAIL_TO",
    integrationId: "resend",
    scope: "runtime",
    required: "optional",
    referencedIn: ["server/services/contactMail.js"]
  },
  // Sendchamp
  {
    name: "SENDCHAMP_API_KEY",
    integrationId: "sendchamp",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js", "server/services/sendchamp.js"]
  },
  {
    name: "SENDCHAMP_SENDER",
    integrationId: "sendchamp",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/sendchamp.js"]
  },
  {
    name: "SENDCHAMP_WHATSAPP_SENDER",
    integrationId: "sendchamp",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/sendchamp.js"]
  },
  {
    name: "SENDCHAMP_BASE_URL",
    integrationId: "sendchamp",
    scope: "runtime",
    required: "optional",
    referencedIn: ["server/config.js"]
  },
  {
    name: "SENDCHAMP_WHATSAPP_TEMPLATE_CONSULTATION_REMINDER",
    integrationId: "sendchamp",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/whatsappService.js"]
  },
  {
    name: "SENDCHAMP_WHATSAPP_TEMPLATE_MEETING_STARTING_SOON",
    integrationId: "sendchamp",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/whatsappService.js"]
  },
  {
    name: "SENDCHAMP_WHATSAPP_TEMPLATE_INTRODUCTION_ACCEPTED",
    integrationId: "sendchamp",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/whatsappService.js"]
  },
  {
    name: "SENDCHAMP_WHATSAPP_TEMPLATE_FOLLOW_UP_REMINDER",
    integrationId: "sendchamp",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/whatsappService.js"]
  },
  {
    name: "SENDCHAMP_WHATSAPP_TEMPLATE_MILESTONE_CONGRATULATIONS",
    integrationId: "sendchamp",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/whatsappService.js"]
  },
  // Google Calendar
  {
    name: "GOOGLE_CLIENT_ID",
    integrationId: "google-calendar",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    integrationId: "google-calendar",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "GOOGLE_REDIRECT_URI",
    integrationId: "google-calendar",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "GOOGLE_CALENDAR_REFRESH_TOKEN",
    integrationId: "google-calendar",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "GOOGLE_CALENDAR_ID",
    integrationId: "google-calendar",
    scope: "runtime",
    required: "optional",
    referencedIn: ["server/config.js"]
  },
  // Google Meet
  {
    name: "GOOGLE_MEET_CLIENT_ID",
    integrationId: "google-meet",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "GOOGLE_MEET_CLIENT_SECRET",
    integrationId: "google-meet",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "GOOGLE_MEET_REFRESH_TOKEN",
    integrationId: "google-meet",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "GOOGLE_MEET_CALENDAR_ID",
    integrationId: "google-meet",
    scope: "runtime",
    required: "optional",
    referencedIn: ["server/config.js"]
  },
  // Zoom
  {
    name: "ZOOM_CLIENT_ID",
    integrationId: "zoom",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "ZOOM_CLIENT_SECRET",
    integrationId: "zoom",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  {
    name: "ZOOM_ACCOUNT_ID",
    integrationId: "zoom",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/config.js"]
  },
  // Storage / Firebase push
  {
    name: "FIREBASE_SERVICE_ACCOUNT_JSON",
    integrationId: "storage",
    scope: "runtime",
    required: "optional",
    referencedIn: ["server/firebaseEnv.js"]
  },
  {
    name: "VITE_FIREBASE_API_KEY",
    integrationId: "storage",
    scope: "buildtime",
    required: "optional",
    referencedIn: ["Dockerfile"]
  },
  {
    name: "VITE_FIREBASE_AUTH_DOMAIN",
    integrationId: "storage",
    scope: "buildtime",
    required: "optional",
    referencedIn: ["Dockerfile"]
  },
  {
    name: "VITE_FIREBASE_PROJECT_ID",
    integrationId: "storage",
    scope: "buildtime",
    required: "optional",
    referencedIn: ["Dockerfile"]
  },
  {
    name: "VITE_FIREBASE_STORAGE_BUCKET",
    integrationId: "storage",
    scope: "buildtime",
    required: "optional",
    referencedIn: ["Dockerfile"]
  },
  {
    name: "VITE_FIREBASE_MESSAGING_SENDER_ID",
    integrationId: "storage",
    scope: "buildtime",
    required: "optional",
    referencedIn: ["Dockerfile"]
  },
  {
    name: "VITE_FIREBASE_APP_ID",
    integrationId: "storage",
    scope: "buildtime",
    required: "optional",
    referencedIn: ["Dockerfile"]
  },
  // JWT — member sessions via Supabase; no separate JWT secret env
  {
    name: "VITE_SUPABASE_ANON_KEY",
    integrationId: "jwt",
    scope: "both",
    required: "critical",
    notes: "Supabase JWT — member bearer tokens verified server-side",
    referencedIn: ["server/supabaseEnv.js"]
  },
  // Secrets / admin
  {
    name: "CRON_SECRET",
    integrationId: "cron-jobs",
    scope: "runtime",
    required: "critical",
    referencedIn: ["server/adminAuth.js", "server/services/diagnosticsAccess.js"]
  },
  {
    name: "DIAGNOSTICS_SECRET",
    integrationId: "secrets",
    scope: "runtime",
    required: "warning",
    referencedIn: ["server/services/diagnosticsAccess.js"]
  },
  {
    name: "COMMAND_CENTER_PIN",
    integrationId: "secrets",
    scope: "runtime",
    required: "critical",
    aliases: ["ADMIN_ACTION_PIN"],
    referencedIn: ["server/consoleEnv.js", "server/adminConsent.js"]
  },
  {
    name: "COMMAND_CENTER_EMAILS",
    integrationId: "secrets",
    scope: "runtime",
    required: "critical",
    aliases: ["ADMIN_EMAILS"],
    referencedIn: ["server/consoleEnv.js"]
  },
  {
    name: "ADMIN_BOOTSTRAP_SECRET",
    integrationId: "secrets",
    scope: "runtime",
    required: "optional",
    referencedIn: ["server/services/adminBootstrapAccess.js"]
  },
  {
    name: "LEGACY_SETUP_SECRET",
    integrationId: "secrets",
    scope: "runtime",
    required: "optional",
    referencedIn: ["server/services/consoleSetupAccess.js"]
  },
  // Deep links / mobile
  {
    name: "PUBLIC_APP_URL",
    integrationId: "deep-links",
    scope: "runtime",
    required: "critical",
    aliases: ["VITE_PUBLIC_APP_URL"],
    referencedIn: ["server/config.js", "capacitor.config.ts"]
  },
  {
    name: "VITE_PUBLIC_APP_URL",
    integrationId: "deep-links",
    scope: "buildtime",
    required: "critical",
    referencedIn: ["src/services/supabase.ts", "Dockerfile"]
  },
  // Android — no env vars; assetlinks + manifest
  // iOS — Capacitor appId in capacitor.config.ts
  // PWA — service worker cache version from build
  {
    name: "VITE_ENABLE_IMAGE_MODERATION",
    integrationId: "pwa",
    scope: "buildtime",
    required: "optional",
    referencedIn: ["src/config/imageModeration.ts", "Dockerfile"]
  }
];

/** Build-only vars documented in .env.example comments — not production runtime. */
export const PRODUCTION_ENV_REGISTRY_GAPS = [
  {
    name: "VITE_APP_BUILD_ID",
    integrationId: "pwa" as ProductionEnvIntegrationId,
    notes: "Optional CI build stamp — documented as comment in .env.example"
  },
  {
    name: "VITE_STORE_SCREENSHOTS",
    integrationId: "pwa" as ProductionEnvIntegrationId,
    notes: "Store asset generation only — documented as comment in .env.example"
  }
] as const;

export const PRODUCTION_ENV_CONSOLIDATION_CHECKS = [
  ".env.example documents all critical production variables",
  "Dockerfile buildtime ARGs match VITE_* public keys only",
  "Runtime secrets never appear in Docker build args",
  "Duplicate alias groups documented with canonical names",
  "GET /ready gates DATABASE_URL, Paystack, signup email, photo storage",
  "No VAPID web-push env — push uses Firebase FCM only",
  "Android App Links verified via test:android-app-links",
  "Paystack webhook uses raw body mount paths",
  "CRON_SECRET header-only — no query string",
  "Development demo accounts gated by import.meta.env.DEV only"
] as const;
