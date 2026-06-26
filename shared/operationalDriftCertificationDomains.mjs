/** Operational Drift Certification™ — verified domain registry. */

export const DRIFT_CERT_DOMAINS = [
  { id: "environment-variables", label: "Environment variables" },
  { id: "feature-flags", label: "Feature Flags" },
  { id: "remote-config", label: "Remote Config" },
  { id: "permissions", label: "Permissions" },
  { id: "roles", label: "Roles" },
  { id: "notification-templates", label: "Notification templates" },
  { id: "payment-configuration", label: "Payment configuration" },
  { id: "sendchamp", label: "Sendchamp" },
  { id: "resend", label: "Resend" },
  { id: "firebase", label: "Firebase" },
  { id: "supabase", label: "Supabase" },
  { id: "storage-buckets", label: "Storage buckets" },
  { id: "cron-schedules", label: "Cron schedules" }
];

export const DRIFT_CERT_BLOCK_ON_CRITICAL = true;

export const DRIFT_COMPARE_TARGETS = ["expected", "current", "production", "staging"];
