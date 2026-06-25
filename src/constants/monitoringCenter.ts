/** Enterprise Monitoring, Observability & Incident Center™ — institutional NOC layer. */

import { MONITORING_CENTER_ADMIN_BRAND } from "./monitoringCenterAdmin";

export const MONITORING_CENTER_BRAND = MONITORING_CENTER_ADMIN_BRAND;

export const MONITORING_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "integrations", label: "Integrations" },
  { id: "jobs", label: "Jobs" },
  { id: "queues", label: "Queues" },
  { id: "incidents", label: "Incidents" },
  { id: "maintenance", label: "Maintenance" },
  { id: "logs", label: "Logs" },
  { id: "alerts", label: "Alerts" }
] as const;

export type MonitoringSectionId = (typeof MONITORING_SECTIONS)[number]["id"];

export const MONITORING_SERVICE_STATUSES = [
  "healthy",
  "degraded",
  "partial-outage",
  "major-outage",
  "maintenance",
  "unknown"
] as const;

export type MonitoringServiceStatusId = (typeof MONITORING_SERVICE_STATUSES)[number];

export const MONITORING_SERVICE_STATUS_LABELS: Record<MonitoringServiceStatusId, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  "partial-outage": "Partial Outage",
  "major-outage": "Major Outage",
  maintenance: "Maintenance",
  unknown: "Unknown"
};

export const MONITORED_PLATFORM_SERVICES = [
  { id: "frontend", label: "Frontend", section: "services", critical: true },
  { id: "api", label: "API", section: "services", critical: true },
  { id: "supabase", label: "Supabase", section: "infrastructure", critical: true },
  { id: "database", label: "Database", section: "infrastructure", critical: true },
  { id: "authentication", label: "Authentication", section: "services", critical: true },
  { id: "paystack", label: "Payments (Paystack)", section: "integrations", critical: true },
  { id: "resend", label: "Email (Resend)", section: "integrations", critical: true },
  { id: "sendchamp", label: "WhatsApp (Sendchamp)", section: "integrations", critical: false },
  { id: "google-calendar", label: "Google Calendar", section: "integrations", critical: false },
  { id: "zoom", label: "Zoom", section: "integrations", critical: false },
  { id: "google-meet", label: "Google Meet", section: "integrations", critical: false },
  { id: "storage", label: "Storage", section: "infrastructure", critical: true },
  { id: "cron-jobs", label: "Cron Jobs", section: "jobs", critical: true },
  { id: "queue-workers", label: "Queue Workers", section: "queues", critical: true },
  { id: "background-jobs", label: "Background Jobs", section: "jobs", critical: false },
  { id: "search", label: "Search", section: "services", critical: false },
  { id: "executive-dashboard", label: "Executive Dashboard", section: "services", critical: false },
  { id: "operations-center", label: "Operations Center", section: "services", critical: true },
  { id: "crm", label: "CRM", section: "integrations", critical: false },
  { id: "journey-engine", label: "Journey Engine", section: "services", critical: true }
] as const;

export type MonitoredPlatformServiceId = (typeof MONITORED_PLATFORM_SERVICES)[number]["id"];

export const MONITORED_PLATFORM_SERVICE_LABELS: Record<MonitoredPlatformServiceId, string> =
  Object.fromEntries(MONITORED_PLATFORM_SERVICES.map((item) => [item.id, item.label])) as Record<
    MonitoredPlatformServiceId,
    string
  >;

export const MONITORING_METRICS = [
  { id: "availability", label: "Availability" },
  { id: "latency", label: "Latency" },
  { id: "error-rate", label: "Error Rate" },
  { id: "throughput", label: "Throughput" },
  { id: "queue-size", label: "Queue Size" },
  { id: "retries", label: "Retries" },
  { id: "database-connections", label: "Database Connections" },
  { id: "storage-usage", label: "Storage Usage" },
  { id: "memory", label: "Memory" },
  { id: "cpu", label: "CPU" },
  { id: "api-response-time", label: "API Response Time" }
] as const;

export type MonitoringMetricId = (typeof MONITORING_METRICS)[number]["id"];

export const INCIDENT_SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type MonitoringIncidentSeverityId = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_SEVERITY_LABELS: Record<MonitoringIncidentSeverityId, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low"
};

export const INCIDENT_STATUSES = [
  "active",
  "investigating",
  "mitigating",
  "resolved",
  "closed"
] as const;

export type MonitoringIncidentStatusId = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_STATUS_LABELS: Record<MonitoringIncidentStatusId, string> = {
  active: "Active",
  investigating: "Investigating",
  mitigating: "Mitigating",
  resolved: "Resolved",
  closed: "Closed"
};

export const ALERT_SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type MonitoringAlertSeverityId = (typeof ALERT_SEVERITIES)[number];

export const MONITORING_CENTER_DB_TABLES = [
  "monitoring_services",
  "service_health_snapshots",
  "monitoring_incidents",
  "monitoring_alerts",
  "maintenance_windows",
  "metric_snapshots"
] as const;

export const MONITORING_AUDIT_ACTIONS = [
  "incident-opened",
  "incident-updated",
  "incident-resolved",
  "alert-acknowledged",
  "alert-resolved",
  "maintenance-scheduled"
] as const;

export type MonitoringAuditActionId = (typeof MONITORING_AUDIT_ACTIONS)[number];

/** Future-ready — documented only, not implemented. */
export const MONITORING_FUTURE_ARCHITECTURE = [
  { id: "status-page", label: "Status Page" },
  { id: "pagerduty", label: "PagerDuty" },
  { id: "opsgenie", label: "OpsGenie" },
  { id: "slack", label: "Slack" },
  { id: "microsoft-teams", label: "Microsoft Teams" },
  { id: "synthetic-monitoring", label: "Synthetic Monitoring" },
  { id: "distributed-tracing", label: "Distributed Tracing" },
  { id: "opentelemetry", label: "OpenTelemetry" }
] as const;
