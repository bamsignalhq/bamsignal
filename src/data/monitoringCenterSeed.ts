import type {
  InfrastructureMetrics,
  MaintenanceWindowRecord,
  MonitoringAlertRecord,
  MonitoringIncidentRecord,
  MonitoringMetricSnapshot,
  ServiceHealthRecord
} from "../types/monitoringCenter";
import { MONITORED_PLATFORM_SERVICES } from "../constants/monitoringCenter";

const NOW = "2026-06-25T12:00:00.000Z";

function service(
  id: ServiceHealthRecord["id"],
  status: ServiceHealthRecord["status"],
  availability: number,
  latencyMs: number,
  errorRate: number,
  extra: Partial<ServiceHealthRecord> = {}
): ServiceHealthRecord {
  const meta = MONITORED_PLATFORM_SERVICES.find((item) => item.id === id);
  return {
    id,
    label: meta?.label ?? id,
    sectionId: (meta?.section ?? "services") as ServiceHealthRecord["sectionId"],
    critical: meta?.critical ?? false,
    status,
    availability,
    latencyMs,
    errorRate,
    checkedAt: NOW,
    ...extra
  };
}

export const MONITORING_SERVICE_SEED: ServiceHealthRecord[] = [
  service("frontend", "healthy", 99.95, 120, 0.02),
  service("api", "healthy", 99.9, 85, 0.05),
  service("supabase", "healthy", 99.99, 42, 0.01),
  service("database", "healthy", 99.98, 38, 0.01),
  service("authentication", "healthy", 99.92, 95, 0.03),
  service("paystack", "degraded", 98.5, 320, 0.8, { note: "Elevated verification latency" }),
  service("resend", "healthy", 99.7, 210, 0.1),
  service("sendchamp", "degraded", 97.2, 450, 1.2),
  service("google-calendar", "healthy", 99.5, 280, 0.2),
  service("zoom", "healthy", 99.4, 310, 0.3),
  service("google-meet", "healthy", 99.3, 295, 0.25),
  service("storage", "healthy", 99.96, 65, 0.02),
  service("cron-jobs", "healthy", 99.8, 0, 0),
  service("queue-workers", "healthy", 99.6, 0, 0.1, { queueSize: 12, retries: 2 }),
  service("background-jobs", "healthy", 99.5, 0, 0.05),
  service("search", "healthy", 99.1, 140, 0.15),
  service("executive-dashboard", "healthy", 99.9, 110, 0.01),
  service("operations-center", "healthy", 99.85, 130, 0.04),
  service("crm", "healthy", 99.0, 160, 0.2),
  service("journey-engine", "healthy", 99.88, 75, 0.03)
];

export const MONITORING_INCIDENT_SEED: MonitoringIncidentRecord[] = [
  {
    id: "inc_001",
    incidentRef: "INC-2026-0042",
    severity: "high",
    status: "mitigating",
    title: "Paystack verification latency elevated",
    affectedServices: ["paystack", "api"],
    rootCause: "Upstream Paystack API latency spike in West Africa region",
    mitigation: "Enabled payment retry backoff and member-facing status banner",
    ownerEmail: "ops@bamsignal.com",
    timeline: [
      { at: "2026-06-25T10:15:00.000Z", actor: "monitoring", note: "Alert triggered — p95 latency > 300ms" },
      { at: "2026-06-25T10:22:00.000Z", actor: "ops@bamsignal.com", note: "Incident declared, finance notified" },
      { at: "2026-06-25T11:00:00.000Z", actor: "ops@bamsignal.com", note: "Mitigation deployed — retry policy active" }
    ],
    openedAt: "2026-06-25T10:15:00.000Z"
  },
  {
    id: "inc_002",
    incidentRef: "INC-2026-0038",
    severity: "medium",
    status: "resolved",
    title: "Sendchamp WhatsApp delivery delays",
    affectedServices: ["sendchamp", "queue-workers"],
    rootCause: "Sendchamp provider queue backlog",
    mitigation: "Increased worker concurrency temporarily",
    resolution: "Provider cleared backlog — delivery normalized",
    postmortem: "Documented in incident review 2026-06-20",
    ownerEmail: "ops@bamsignal.com",
    timeline: [
      { at: "2026-06-20T08:00:00.000Z", actor: "monitoring", note: "Queue depth alert" },
      { at: "2026-06-20T14:30:00.000Z", actor: "ops@bamsignal.com", note: "Resolved — backlog cleared" }
    ],
    openedAt: "2026-06-20T08:00:00.000Z",
    resolvedAt: "2026-06-20T14:30:00.000Z"
  }
];

export const MONITORING_ALERT_SEED: MonitoringAlertRecord[] = [
  {
    id: "alert_001",
    alertRef: "ALT-2026-0182",
    severity: "high",
    serviceId: "paystack",
    message: "Payment verification p95 latency exceeded 300ms threshold",
    status: "acknowledged",
    acknowledgedBy: "ops@bamsignal.com",
    acknowledgedAt: "2026-06-25T10:20:00.000Z",
    escalationLevel: 1,
    createdAt: "2026-06-25T10:15:00.000Z"
  },
  {
    id: "alert_002",
    alertRef: "ALT-2026-0183",
    severity: "medium",
    serviceId: "sendchamp",
    message: "WhatsApp queue depth above 50 messages",
    status: "open",
    escalationLevel: 0,
    createdAt: "2026-06-25T11:30:00.000Z"
  },
  {
    id: "alert_003",
    alertRef: "ALT-2026-0175",
    severity: "low",
    serviceId: "search",
    message: "Search index refresh delayed by 15 minutes",
    status: "resolved",
    acknowledgedBy: "ops@bamsignal.com",
    acknowledgedAt: "2026-06-24T16:00:00.000Z",
    resolvedAt: "2026-06-24T16:45:00.000Z",
    escalationLevel: 0,
    createdAt: "2026-06-24T15:45:00.000Z"
  }
];

export const MAINTENANCE_WINDOW_SEED: MaintenanceWindowRecord[] = [
  {
    id: "maint_001",
    windowRef: "MW-2026-07-01",
    title: "Database index maintenance",
    affectedServices: ["database", "supabase", "journey-engine"],
    startsAt: "2026-07-01T02:00:00.000Z",
    endsAt: "2026-07-01T04:00:00.000Z",
    status: "scheduled",
    notes: "Read-only mode during index rebuild — no member impact expected"
  }
];

export const INFRASTRUCTURE_METRICS_SEED: InfrastructureMetrics = {
  databaseConnections: 42,
  storageUsageGb: 128.5,
  memoryUsagePercent: 62,
  cpuUsagePercent: 38,
  apiResponseTimeMs: 85,
  capturedAt: NOW
};

export const METRIC_SNAPSHOT_SEED: MonitoringMetricSnapshot[] = [
  { id: "met_001", metricKey: "availability", value: 99.9, unit: "%", snapshotAt: NOW },
  { id: "met_002", metricKey: "api-response-time", value: 85, unit: "ms", serviceId: "api", snapshotAt: NOW },
  { id: "met_003", metricKey: "queue-size", value: 12, unit: "jobs", serviceId: "queue-workers", snapshotAt: NOW },
  { id: "met_004", metricKey: "database-connections", value: 42, unit: "connections", serviceId: "database", snapshotAt: NOW },
  { id: "met_005", metricKey: "error-rate", value: 0.05, unit: "%", serviceId: "api", snapshotAt: NOW }
];
