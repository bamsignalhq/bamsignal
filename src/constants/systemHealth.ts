/** Institutional System Health Center™ — real-time critical service monitoring. */

import { SYSTEM_HEALTH_ADMIN_BRAND } from "./systemHealthAdmin";

export const SYSTEM_HEALTH_BRAND = SYSTEM_HEALTH_ADMIN_BRAND;

export type ServiceHealthStatusId = "healthy" | "degraded" | "offline" | "maintenance";

export type MonitoredServiceId =
  | "supabase"
  | "paystack"
  | "google-calendar"
  | "zoom"
  | "google-meet"
  | "resend"
  | "sendchamp"
  | "storage"
  | "background-jobs"
  | "email-queue"
  | "whatsapp-queue";

export const SERVICE_HEALTH_STATUSES: { id: ServiceHealthStatusId; label: string }[] = [
  { id: "healthy", label: "Healthy" },
  { id: "degraded", label: "Degraded" },
  { id: "offline", label: "Offline" },
  { id: "maintenance", label: "Maintenance" }
];

export const SERVICE_HEALTH_STATUS_LABELS: Record<ServiceHealthStatusId, string> = Object.fromEntries(
  SERVICE_HEALTH_STATUSES.map((item) => [item.id, item.label])
) as Record<ServiceHealthStatusId, string>;

export const MONITORED_SERVICES: {
  id: MonitoredServiceId;
  label: string;
  critical: boolean;
  category: string;
}[] = [
  { id: "supabase", label: "Supabase", critical: true, category: "Platform" },
  { id: "paystack", label: "Paystack", critical: true, category: "Payments" },
  { id: "google-calendar", label: "Google Calendar", critical: false, category: "Scheduling" },
  { id: "zoom", label: "Zoom", critical: false, category: "Meetings" },
  { id: "google-meet", label: "Google Meet", critical: false, category: "Meetings" },
  { id: "resend", label: "Resend", critical: true, category: "Messaging" },
  { id: "sendchamp", label: "Sendchamp", critical: false, category: "Messaging" },
  { id: "storage", label: "Storage", critical: true, category: "Platform" },
  { id: "background-jobs", label: "Background Jobs", critical: false, category: "Operations" },
  { id: "email-queue", label: "Email Queue", critical: true, category: "Messaging" },
  { id: "whatsapp-queue", label: "WhatsApp Queue", critical: false, category: "Messaging" }
];

export const MONITORED_SERVICE_LABELS: Record<MonitoredServiceId, string> = Object.fromEntries(
  MONITORED_SERVICES.map((item) => [item.id, item.label])
) as Record<MonitoredServiceId, string>;

export const HEALTH_METRIC_FIELDS = [
  { id: "uptime", label: "Uptime" },
  { id: "responseTime", label: "Response Time" },
  { id: "errorCount", label: "Error Count" },
  { id: "lastFailure", label: "Last Failure" },
  { id: "recoveryTime", label: "Recovery Time" }
] as const;

/** Future-ready capabilities — documented only, not yet implemented. */
export const SYSTEM_HEALTH_FUTURE_CAPABILITIES = [
  {
    id: "external-status-page",
    label: "External status page",
    description: "Public status.bamsignal.com with subscriber notifications and incident history."
  },
  {
    id: "pagerduty",
    label: "PagerDuty",
    description: "On-call routing for critical service degradation and offline incidents."
  },
  {
    id: "monitoring-integrations",
    label: "Monitoring integrations",
    description: "Datadog, Grafana, and UptimeRobot probes wired into the institutional health engine."
  }
] as const;
