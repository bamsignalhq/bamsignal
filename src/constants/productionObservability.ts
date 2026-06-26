/** Production Observability Center™ — operational heartbeat of BamSignal. */

import { PRODUCTION_OBSERVABILITY_ADMIN_BRAND } from "./productionObservabilityAdmin";

export const PRODUCTION_OBSERVABILITY_BRAND = PRODUCTION_OBSERVABILITY_ADMIN_BRAND;

export const OBSERVABILITY_REFRESH_INTERVAL_MS = 30_000;

export const OBSERVABILITY_SERVICE_STATUSES = ["healthy", "warning", "offline"] as const;
export type ObservabilityServiceStatusId = (typeof OBSERVABILITY_SERVICE_STATUSES)[number];

export const OBSERVABILITY_SERVICE_STATUS_LABELS: Record<ObservabilityServiceStatusId, string> = {
  healthy: "Healthy",
  warning: "Warning",
  offline: "Offline"
};

export const OBSERVABILITY_MONITORED_SERVICES = [
  { id: "supabase", label: "Supabase", critical: true, future: false },
  { id: "postgres", label: "Postgres", critical: true, future: false },
  { id: "redis", label: "Redis", critical: false, future: true },
  { id: "storage", label: "Storage", critical: true, future: false },
  { id: "paystack", label: "Paystack", critical: true, future: false },
  { id: "sendchamp", label: "Sendchamp", critical: false, future: false },
  { id: "resend", label: "Resend", critical: true, future: false },
  { id: "firebase", label: "Firebase", critical: false, future: false },
  { id: "google-calendar", label: "Google Calendar", critical: false, future: false },
  { id: "zoom", label: "Zoom", critical: false, future: false },
  { id: "google-meet", label: "Google Meet", critical: false, future: false },
  { id: "openai", label: "OpenAI", critical: false, future: false }
] as const;

export type ObservabilityServiceId = (typeof OBSERVABILITY_MONITORED_SERVICES)[number]["id"];

export const OBSERVABILITY_SERVICE_LABELS: Record<ObservabilityServiceId, string> =
  Object.fromEntries(OBSERVABILITY_MONITORED_SERVICES.map((item) => [item.id, item.label])) as Record<
    ObservabilityServiceId,
    string
  >;

export const OBSERVABILITY_BACKGROUND_QUEUES = [
  { id: "email", label: "Email queue" },
  { id: "whatsapp", label: "WhatsApp queue" },
  { id: "notification", label: "Notification queue" },
  { id: "matching", label: "Matching queue" },
  { id: "concierge", label: "Concierge queue" },
  { id: "research", label: "Research queue" },
  { id: "retry", label: "Retry queue" },
  { id: "failed", label: "Failed queue" }
] as const;

export type ObservabilityQueueId = (typeof OBSERVABILITY_BACKGROUND_QUEUES)[number]["id"];

export const OBSERVABILITY_QUEUE_LABELS: Record<ObservabilityQueueId, string> = Object.fromEntries(
  OBSERVABILITY_BACKGROUND_QUEUES.map((item) => [item.id, item.label])
) as Record<ObservabilityQueueId, string>;

export const OBSERVABILITY_ERROR_ACTIONS = [
  { id: "resolve", label: "Resolved" },
  { id: "ignore", label: "Ignore" },
  { id: "assign", label: "Assign" }
] as const;

export type ObservabilityErrorActionId = (typeof OBSERVABILITY_ERROR_ACTIONS)[number]["id"];

export const OBSERVABILITY_ERROR_ACTION_LABELS: Record<ObservabilityErrorActionId, string> =
  Object.fromEntries(OBSERVABILITY_ERROR_ACTIONS.map((item) => [item.id, item.label])) as Record<
    ObservabilityErrorActionId,
    string
  >;

export const OBSERVABILITY_SUMMARY_METRICS = [
  { id: "system-health", label: "System Health" },
  { id: "api-latency", label: "API Latency" },
  { id: "active-members", label: "Active Members" },
  { id: "error-rate", label: "Error Rate" },
  { id: "queue-health", label: "Queue Health" },
  { id: "background-jobs", label: "Background Jobs" }
] as const;

export type ObservabilitySummaryMetricId = (typeof OBSERVABILITY_SUMMARY_METRICS)[number]["id"];

export const OBSERVABILITY_DEPLOYMENT_ENVIRONMENTS = [
  "production",
  "staging",
  "preview"
] as const;

export type ObservabilityDeploymentEnvironmentId =
  (typeof OBSERVABILITY_DEPLOYMENT_ENVIRONMENTS)[number];

export const OBSERVABILITY_FUTURE_CAPABILITIES = [
  { id: "redis", label: "Redis", description: "Session cache and rate-limit store — planned post-launch." },
  { id: "opentelemetry", label: "OpenTelemetry", description: "Distributed tracing across API and workers." },
  { id: "pagerduty", label: "PagerDuty", description: "On-call escalation for critical incidents." },
  { id: "grafana", label: "Grafana", description: "Long-term metrics retention and SLO dashboards." }
] as const;

export const PRODUCTION_OBSERVABILITY_DB_TABLES = [
  "observability_service_snapshots",
  "observability_error_events",
  "observability_deployments",
  "observability_queue_snapshots",
  "observability_endpoint_metrics"
] as const;
