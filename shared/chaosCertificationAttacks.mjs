/** Chaos Engineering Certification™ — intentional failure attack registry. */

export const CHAOS_CERT_BRAND = "Chaos Engineering Certification™";

export const CHAOS_CERT_ATTACKS = [
  { id: "kill-supabase", label: "Kill Supabase", critical: true },
  { id: "kill-storage", label: "Kill Storage", critical: true },
  { id: "kill-paystack", label: "Kill Paystack", critical: true },
  { id: "kill-sendchamp", label: "Kill Sendchamp", critical: false },
  { id: "kill-resend", label: "Kill Resend", critical: true },
  { id: "kill-firebase", label: "Kill Firebase", critical: false },
  { id: "kill-openai", label: "Kill OpenAI", critical: false },
  { id: "kill-google-calendar", label: "Kill Google Calendar", critical: false },
  { id: "kill-webhooks", label: "Kill Webhooks", critical: true },
  { id: "kill-notification-queue", label: "Kill Notification Queue", critical: false },
  { id: "kill-matching-queue", label: "Kill Matching Queue", critical: false },
  { id: "kill-database-connection", label: "Kill Database Connection", critical: true },
  { id: "kill-session-refresh", label: "Kill Session Refresh", critical: true },
  { id: "kill-feature-flag-endpoint", label: "Kill Feature Flag Endpoint", critical: false },
  { id: "kill-remote-config-endpoint", label: "Kill Remote Config Endpoint", critical: false }
];

export const CHAOS_CERT_VERIFY_DIMENSIONS = [
  "gracefulDegradation",
  "retry",
  "fallbackUi",
  "logging",
  "recovery",
  "noCrash",
  "noWhiteScreen",
  "noInfiniteSpinner"
];

export const CHAOS_CERT_BLOCK_ON_CRITICAL = true;
