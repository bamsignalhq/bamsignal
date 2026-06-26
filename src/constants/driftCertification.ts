import type { DriftCertificationDomainId } from "../types/driftCertification";

export const DRIFT_CERTIFICATION_DOMAINS: Array<{
  id: DriftCertificationDomainId;
  label: string;
}> = [
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

export const DRIFT_CERTIFICATION_RELEASE_BLOCKERS = [
  "Critical configuration drift",
  "Missing critical production secrets",
  "Production payment or Supabase mismatch"
] as const;
