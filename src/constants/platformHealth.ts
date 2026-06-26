/** Platform Health Center™ — morning traffic-light view of critical dependencies. */

import { PLATFORM_HEALTH_ADMIN_BRAND } from "./platformHealthAdmin";

export const PLATFORM_HEALTH_BRAND = PLATFORM_HEALTH_ADMIN_BRAND;

export const PLATFORM_HEALTH_REFRESH_INTERVAL_MS = 30_000;

export const PLATFORM_HEALTH_STATUSES = ["healthy", "warning", "critical"] as const;
export type PlatformHealthStatusId = (typeof PLATFORM_HEALTH_STATUSES)[number];

export const PLATFORM_HEALTH_STATUS_LABELS: Record<PlatformHealthStatusId, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical"
};

export const PLATFORM_HEALTH_TRAFFIC_LIGHT: Record<PlatformHealthStatusId, "green" | "yellow" | "red"> = {
  healthy: "green",
  warning: "yellow",
  critical: "red"
};

export const PLATFORM_HEALTH_MONITORED_SERVICES = [
  { id: "supabase", label: "Supabase", critical: true },
  { id: "authentication", label: "Authentication", critical: true },
  { id: "database", label: "Database", critical: true },
  { id: "storage", label: "Storage", critical: true },
  { id: "paystack", label: "Paystack", critical: true },
  { id: "sendchamp", label: "Sendchamp", critical: false },
  { id: "resend", label: "Resend", critical: true },
  { id: "firebase", label: "Firebase", critical: false },
  { id: "google-calendar", label: "Google Calendar", critical: false },
  { id: "zoom", label: "Zoom", critical: false },
  { id: "google-meet", label: "Google Meet", critical: false },
  { id: "openai", label: "OpenAI", critical: false },
  { id: "webhooks", label: "Webhooks", critical: true },
  { id: "cron", label: "Cron", critical: true },
  { id: "background-workers", label: "Background Workers", critical: true }
] as const;

export type PlatformHealthServiceId = (typeof PLATFORM_HEALTH_MONITORED_SERVICES)[number]["id"];

export const PLATFORM_HEALTH_SERVICE_LABELS: Record<PlatformHealthServiceId, string> =
  Object.fromEntries(PLATFORM_HEALTH_MONITORED_SERVICES.map((item) => [item.id, item.label])) as Record<
    PlatformHealthServiceId,
    string
  >;

export const PLATFORM_HEALTH_ALERT_CHANNELS = [
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "slack", label: "Slack (future)", future: true }
] as const;

export type PlatformHealthAlertChannelId = (typeof PLATFORM_HEALTH_ALERT_CHANNELS)[number]["id"];

export const PLATFORM_HEALTH_DB_TABLES = [
  "platform_health_snapshots",
  "platform_health_incidents",
  "platform_health_alerts",
  "platform_health_acknowledgements"
] as const;

export const PLATFORM_HEALTH_FUTURE_CAPABILITIES = [
  { id: "slack", label: "Slack", description: "Pager-style escalation to #ops-alerts." },
  { id: "pagerduty", label: "PagerDuty", description: "On-call rotation integration." },
  { id: "synthetic", label: "Synthetic checks", description: "External uptime probes per region." }
] as const;
