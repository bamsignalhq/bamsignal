import type {
  PlatformHealthAlertRule,
  PlatformHealthIncidentRecord,
  PlatformHealthServiceRecord
} from "../types/platformHealth";
import { PLATFORM_HEALTH_MONITORED_SERVICES } from "../constants/platformHealth";

const NOW = "2026-06-26T16:00:00.000Z";

function service(
  id: PlatformHealthServiceRecord["id"],
  status: PlatformHealthServiceRecord["status"],
  responseTimeMs: number,
  extra: Partial<PlatformHealthServiceRecord> = {}
): PlatformHealthServiceRecord {
  const meta = PLATFORM_HEALTH_MONITORED_SERVICES.find((item) => item.id === id);
  return {
    id,
    label: meta?.label ?? id,
    critical: meta?.critical ?? false,
    status,
    responseTimeMs,
    lastSuccessAt: NOW,
    lastFailureAt: null,
    failureCount24h: 0,
    recoveryAttempts: 0,
    checkedAt: NOW,
    ...extra
  };
}

export const PLATFORM_HEALTH_SERVICE_SEED: PlatformHealthServiceRecord[] = [
  service("supabase", "healthy", 42),
  service("authentication", "healthy", 95),
  service("database", "healthy", 38),
  service("storage", "healthy", 65),
  service("paystack", "warning", 320, {
    lastFailureAt: "2026-06-26T08:15:00.000Z",
    failureCount24h: 3,
    recoveryAttempts: 2,
    note: "Elevated verification latency"
  }),
  service("sendchamp", "warning", 450, {
    lastFailureAt: "2026-06-26T06:00:00.000Z",
    failureCount24h: 2,
    recoveryAttempts: 1,
    note: "WhatsApp delivery backlog"
  }),
  service("resend", "healthy", 210),
  service("firebase", "healthy", 88),
  service("google-calendar", "healthy", 280),
  service("zoom", "healthy", 310),
  service("google-meet", "healthy", 295),
  service("openai", "healthy", 520),
  service("webhooks", "healthy", 55, { failureCount24h: 1, recoveryAttempts: 1 }),
  service("cron", "healthy", 12),
  service("background-workers", "warning", 0, {
    failureCount24h: 1,
    recoveryAttempts: 2,
    note: "Retry queue depth elevated"
  })
];

export const PLATFORM_HEALTH_INCIDENT_SEED: PlatformHealthIncidentRecord[] = [
  {
    id: "phi_000",
    incidentRef: "PHI-2026-0019",
    serviceId: "background-workers",
    severity: "warning",
    status: "active",
    title: "Background worker retry queue elevated",
    summary: "Retry queue depth above threshold for matching jobs.",
    openedAt: "2026-06-26T14:30:00.000Z",
    timeline: [
      { at: "2026-06-26T14:30:00.000Z", actor: "monitoring", note: "Queue depth alert — 12 pending retries" }
    ]
  },
  {
    id: "phi_001",
    incidentRef: "PHI-2026-0018",
    serviceId: "paystack",
    severity: "warning",
    status: "acknowledged",
    title: "Paystack verification latency elevated",
    summary: "p95 verify latency above 300ms for West Africa region.",
    openedAt: "2026-06-26T08:15:00.000Z",
    acknowledgedBy: "ops@bamsignal.com",
    acknowledgedAt: "2026-06-26T08:22:00.000Z",
    timeline: [
      { at: "2026-06-26T08:15:00.000Z", actor: "monitoring", note: "Threshold breached — 320ms p95" },
      { at: "2026-06-26T08:22:00.000Z", actor: "ops@bamsignal.com", note: "Acknowledged — finance notified" }
    ]
  },
  {
    id: "phi_002",
    incidentRef: "PHI-2026-0015",
    serviceId: "sendchamp",
    severity: "warning",
    status: "resolved",
    title: "Sendchamp WhatsApp delivery delays",
    summary: "Provider queue backlog cleared after worker scale-up.",
    openedAt: "2026-06-25T14:00:00.000Z",
    resolvedAt: "2026-06-25T18:30:00.000Z",
    timeline: [
      { at: "2026-06-25T14:00:00.000Z", actor: "monitoring", note: "Queue depth alert" },
      { at: "2026-06-25T18:30:00.000Z", actor: "ops@bamsignal.com", note: "Resolved — backlog cleared" }
    ]
  },
  {
    id: "phi_003",
    incidentRef: "PHI-2026-0012",
    serviceId: "webhooks",
    severity: "critical",
    status: "resolved",
    title: "Paystack webhook signature failures",
    summary: "Invalid signature spike during key rotation window.",
    openedAt: "2026-06-24T02:10:00.000Z",
    resolvedAt: "2026-06-24T03:45:00.000Z",
    timeline: [
      { at: "2026-06-24T02:10:00.000Z", actor: "monitoring", note: "5 failures in 10 minutes" },
      { at: "2026-06-24T03:45:00.000Z", actor: "stanlex", note: "Key rotation completed — resolved" }
    ]
  }
];

export const PLATFORM_HEALTH_ALERT_SEED: PlatformHealthAlertRule[] = [
  {
    id: "alert_paystack",
    serviceId: "paystack",
    thresholdMs: 300,
    failureThreshold: 3,
    escalationLevel: 2,
    channels: ["email", "whatsapp"],
    enabled: true
  },
  {
    id: "alert_database",
    serviceId: "database",
    thresholdMs: 100,
    failureThreshold: 1,
    escalationLevel: 3,
    channels: ["email", "whatsapp"],
    enabled: true
  },
  {
    id: "alert_webhooks",
    serviceId: "webhooks",
    thresholdMs: 200,
    failureThreshold: 2,
    escalationLevel: 2,
    channels: ["email"],
    enabled: true
  },
  {
    id: "alert_workers",
    serviceId: "background-workers",
    thresholdMs: 0,
    failureThreshold: 5,
    escalationLevel: 1,
    channels: ["email", "slack"],
    enabled: true
  }
];
