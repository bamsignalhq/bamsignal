import type {
  ObservabilityDeploymentRecord,
  ObservabilityEndpointMetric,
  ObservabilityErrorRecord,
  ObservabilityQueueRecord,
  ObservabilityServiceRecord
} from "../types/productionObservability";
import { OBSERVABILITY_MONITORED_SERVICES } from "../constants/productionObservability";

const NOW = "2026-06-26T12:00:00.000Z";

function service(
  id: ObservabilityServiceRecord["id"],
  status: ObservabilityServiceRecord["status"],
  responseTimeMs: number,
  extra: Partial<ObservabilityServiceRecord> = {}
): ObservabilityServiceRecord {
  const meta = OBSERVABILITY_MONITORED_SERVICES.find((item) => item.id === id);
  return {
    id,
    label: meta?.label ?? id,
    critical: meta?.critical ?? false,
    status,
    responseTimeMs,
    checkedAt: NOW,
    future: meta?.future,
    ...extra
  };
}

export const OBSERVABILITY_SERVICE_SEED: ObservabilityServiceRecord[] = [
  service("supabase", "healthy", 42),
  service("postgres", "healthy", 38),
  service("redis", "warning", 0, { note: "Planned — not yet provisioned", future: true }),
  service("storage", "healthy", 65),
  service("paystack", "warning", 320, { note: "Elevated verification latency" }),
  service("sendchamp", "warning", 450, { note: "WhatsApp delivery backlog" }),
  service("resend", "healthy", 210),
  service("firebase", "healthy", 95),
  service("google-calendar", "healthy", 280),
  service("zoom", "healthy", 310),
  service("google-meet", "healthy", 295),
  service("openai", "healthy", 520)
];

export const OBSERVABILITY_ENDPOINT_SEED: ObservabilityEndpointMetric[] = [
  {
    id: "ep_pin_login",
    path: "/api/auth/pin-login",
    method: "POST",
    avgResponseMs: 85,
    p95ResponseMs: 210,
    failureCount: 3,
    timeoutCount: 0,
    checkedAt: NOW
  },
  {
    id: "ep_member_data",
    path: "/api/member/data",
    method: "POST",
    avgResponseMs: 120,
    p95ResponseMs: 340,
    failureCount: 1,
    timeoutCount: 0,
    checkedAt: NOW
  },
  {
    id: "ep_paystack_verify",
    path: "/api/paystack/verify",
    method: "POST",
    avgResponseMs: 420,
    p95ResponseMs: 890,
    failureCount: 5,
    timeoutCount: 2,
    checkedAt: NOW
  },
  {
    id: "ep_health",
    path: "/health",
    method: "GET",
    avgResponseMs: 12,
    p95ResponseMs: 28,
    failureCount: 0,
    timeoutCount: 0,
    checkedAt: NOW
  },
  {
    id: "ep_ready",
    path: "/ready",
    method: "GET",
    avgResponseMs: 95,
    p95ResponseMs: 180,
    failureCount: 0,
    timeoutCount: 0,
    checkedAt: NOW
  },
  {
    id: "ep_concierge_email",
    path: "/api/concierge-email",
    method: "POST",
    avgResponseMs: 380,
    p95ResponseMs: 720,
    failureCount: 2,
    timeoutCount: 1,
    checkedAt: NOW
  }
];

export const OBSERVABILITY_QUEUE_SEED: ObservabilityQueueRecord[] = [
  { id: "email", label: "Email queue", status: "healthy", depth: 4, processingRate: 42, failedCount: 0, oldestAgeMinutes: 2, checkedAt: NOW },
  { id: "whatsapp", label: "WhatsApp queue", status: "warning", depth: 18, processingRate: 12, failedCount: 2, oldestAgeMinutes: 45, checkedAt: NOW },
  { id: "notification", label: "Notification queue", status: "healthy", depth: 7, processingRate: 28, failedCount: 0, oldestAgeMinutes: 5, checkedAt: NOW },
  { id: "matching", label: "Matching queue", status: "healthy", depth: 3, processingRate: 15, failedCount: 0, oldestAgeMinutes: 8, checkedAt: NOW },
  { id: "concierge", label: "Concierge queue", status: "healthy", depth: 2, processingRate: 8, failedCount: 0, oldestAgeMinutes: 12, checkedAt: NOW },
  { id: "research", label: "Research queue", status: "healthy", depth: 1, processingRate: 4, failedCount: 0, oldestAgeMinutes: 30, checkedAt: NOW },
  { id: "retry", label: "Retry queue", status: "warning", depth: 6, processingRate: 10, failedCount: 1, oldestAgeMinutes: 22, checkedAt: NOW },
  { id: "failed", label: "Failed queue", status: "warning", depth: 3, processingRate: 0, failedCount: 3, oldestAgeMinutes: 120, checkedAt: NOW }
];

export const OBSERVABILITY_ERROR_SEED: ObservabilityErrorRecord[] = [
  {
    id: "err_001",
    errorRef: "ERR-2026-0142",
    event: "payment_verify_failed",
    message: "Paystack verification timeout after 30s",
    stackTrace: "Error: Paystack verification timeout\n  at verifyPayment (server/routes/paystack.js:142:11)",
    affectedMembers: ["member_4821", "member_9103"],
    frequency: 5,
    firstSeenAt: "2026-06-26T08:15:00.000Z",
    lastSeenAt: "2026-06-26T11:42:00.000Z",
    triageStatus: "open",
    serviceId: "paystack"
  },
  {
    id: "err_002",
    errorRef: "ERR-2026-0138",
    event: "email_send_failed",
    message: "Resend API returned 429 — rate limited",
    stackTrace: "Error: Resend rate limit\n  at sendEmail (server/services/email.js:88:9)",
    affectedMembers: ["member_2201"],
    frequency: 2,
    firstSeenAt: "2026-06-26T06:00:00.000Z",
    lastSeenAt: "2026-06-26T10:30:00.000Z",
    triageStatus: "assigned",
    assignedTo: "ops@bamsignal.com",
    serviceId: "resend"
  },
  {
    id: "err_003",
    errorRef: "ERR-2026-0125",
    event: "photo_upload_failed",
    message: "Storage bucket unavailable during upload",
    stackTrace: "Error: Storage unavailable\n  at uploadPhoto (server/routes/memberPhotos.js:201:7)",
    affectedMembers: ["member_7734"],
    frequency: 1,
    firstSeenAt: "2026-06-25T22:10:00.000Z",
    lastSeenAt: "2026-06-25T22:10:00.000Z",
    triageStatus: "resolved",
    serviceId: "storage"
  },
  {
    id: "err_004",
    errorRef: "ERR-2026-0119",
    event: "background_task_failed",
    message: "WhatsApp queue worker exhausted retries",
    stackTrace: "Error: Retry exhausted\n  at processQueue (server/services/sendchamp.js:55:5)",
    affectedMembers: [],
    frequency: 3,
    firstSeenAt: "2026-06-25T14:00:00.000Z",
    lastSeenAt: "2026-06-26T09:15:00.000Z",
    triageStatus: "open",
    serviceId: "sendchamp"
  }
];

export const OBSERVABILITY_DEPLOYMENT_SEED: ObservabilityDeploymentRecord[] = [
  {
    id: "dep_001",
    deploymentRef: "DEP-2026-0068",
    commit: "a3f2c1d",
    deployedAt: "2026-06-26T11:05:00.000Z",
    engineer: "stanlex",
    environment: "production",
    health: "healthy",
    rollbackAvailable: true,
    buildVersion: "1.0.15"
  },
  {
    id: "dep_002",
    deploymentRef: "DEP-2026-0067",
    commit: "b8e4f92",
    deployedAt: "2026-06-25T18:30:00.000Z",
    engineer: "stanlex",
    environment: "production",
    health: "healthy",
    rollbackAvailable: true,
    buildVersion: "1.0.14"
  },
  {
    id: "dep_003",
    deploymentRef: "DEP-2026-0066",
    commit: "c1d9a07",
    deployedAt: "2026-06-24T09:00:00.000Z",
    engineer: "ops@bamsignal.com",
    environment: "staging",
    health: "healthy",
    rollbackAvailable: false,
    buildVersion: "1.0.14-rc1"
  }
];

export const OBSERVABILITY_ACTIVE_MEMBERS_SEED = 2847;

export const OBSERVABILITY_PERFORMANCE_SEED = {
  memoryUsagePercent: 62,
  cpuUsagePercent: 38,
  databaseConnections: 24,
  networkMbps: 12.4
};

export const OBSERVABILITY_DATABASE_SEED = {
  status: "healthy" as const,
  connectionCount: 24,
  maxConnections: 100,
  activeQueries: 6,
  slowQueries24h: 2,
  replicationLagMs: null as number | null
};
