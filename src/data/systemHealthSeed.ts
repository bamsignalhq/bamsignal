import type { MonitoredServiceId, ServiceHealthStatusId } from "../constants/systemHealth";
import type { HealthIncidentRecord, ServiceHealthMetrics } from "../types/systemHealth";

type ServiceSeed = {
  id: MonitoredServiceId;
  status: ServiceHealthStatusId;
  metrics: ServiceHealthMetrics;
  note: string;
};

export const SYSTEM_HEALTH_SERVICE_SEED: ServiceSeed[] = [
  {
    id: "supabase",
    status: "healthy",
    metrics: {
      uptimePercent: 99.98,
      responseTimeMs: 142,
      errorCount24h: 0,
      lastFailureAt: null,
      recoveryTimeMinutes: null
    },
    note: "Auth, Postgres, and service-role dependencies."
  },
  {
    id: "paystack",
    status: "healthy",
    metrics: {
      uptimePercent: 99.95,
      responseTimeMs: 318,
      errorCount24h: 1,
      lastFailureAt: "2026-06-21T14:22:00.000Z",
      recoveryTimeMinutes: 4
    },
    note: "Initialize, verify, and webhook fulfillment."
  },
  {
    id: "google-calendar",
    status: "degraded",
    metrics: {
      uptimePercent: 98.4,
      responseTimeMs: 540,
      errorCount24h: 2,
      lastFailureAt: "2026-06-22T09:10:00.000Z",
      recoveryTimeMinutes: 12
    },
    note: "Consultation scheduling event creation."
  },
  {
    id: "zoom",
    status: "degraded",
    metrics: {
      uptimePercent: 97.8,
      responseTimeMs: 620,
      errorCount24h: 3,
      lastFailureAt: "2026-06-22T08:45:00.000Z",
      recoveryTimeMinutes: 18
    },
    note: "Zoom meeting link provisioning."
  },
  {
    id: "google-meet",
    status: "degraded",
    metrics: {
      uptimePercent: 98.1,
      responseTimeMs: 505,
      errorCount24h: 1,
      lastFailureAt: "2026-06-21T16:30:00.000Z",
      recoveryTimeMinutes: 9
    },
    note: "Standalone Google Meet links."
  },
  {
    id: "resend",
    status: "healthy",
    metrics: {
      uptimePercent: 99.99,
      responseTimeMs: 210,
      errorCount24h: 0,
      lastFailureAt: null,
      recoveryTimeMinutes: null
    },
    note: "Transactional and purchase confirmation email."
  },
  {
    id: "sendchamp",
    status: "healthy",
    metrics: {
      uptimePercent: 99.7,
      responseTimeMs: 380,
      errorCount24h: 0,
      lastFailureAt: "2026-06-20T11:05:00.000Z",
      recoveryTimeMinutes: 6
    },
    note: "SMS OTP and WhatsApp verification delivery."
  },
  {
    id: "storage",
    status: "healthy",
    metrics: {
      uptimePercent: 99.96,
      responseTimeMs: 185,
      errorCount24h: 0,
      lastFailureAt: null,
      recoveryTimeMinutes: null
    },
    note: "Member photo and media object storage."
  },
  {
    id: "background-jobs",
    status: "healthy",
    metrics: {
      uptimePercent: 99.9,
      responseTimeMs: 95,
      errorCount24h: 0,
      lastFailureAt: "2026-06-19T03:00:00.000Z",
      recoveryTimeMinutes: 2
    },
    note: "Cron fulfillment, retention, and housekeeping tasks."
  },
  {
    id: "email-queue",
    status: "healthy",
    metrics: {
      uptimePercent: 99.92,
      responseTimeMs: 240,
      errorCount24h: 2,
      lastFailureAt: "2026-06-22T06:15:00.000Z",
      recoveryTimeMinutes: 3
    },
    note: "Signup, purchase, and security email queue."
  },
  {
    id: "whatsapp-queue",
    status: "healthy",
    metrics: {
      uptimePercent: 99.5,
      responseTimeMs: 410,
      errorCount24h: 1,
      lastFailureAt: "2026-06-21T20:40:00.000Z",
      recoveryTimeMinutes: 5
    },
    note: "WhatsApp OTP and concierge notification queue."
  }
];

export const SYSTEM_HEALTH_INCIDENTS_SEED: HealthIncidentRecord[] = [
  {
    id: "health_inc_001",
    timestamp: "2026-06-22T09:10:00.000Z",
    serviceId: "google-calendar",
    severity: "degraded",
    title: "Calendar token refresh latency",
    summary: "Google Calendar event creation slowed after OAuth refresh delay.",
    resolvedAt: "2026-06-22T09:22:00.000Z",
    recoveryTimeMinutes: 12
  },
  {
    id: "health_inc_002",
    timestamp: "2026-06-22T08:45:00.000Z",
    serviceId: "zoom",
    severity: "degraded",
    title: "Zoom API rate limit",
    summary: "Meeting creation retried after transient Zoom rate limiting.",
    resolvedAt: "2026-06-22T09:03:00.000Z",
    recoveryTimeMinutes: 18
  },
  {
    id: "health_inc_003",
    timestamp: "2026-06-22T06:15:00.000Z",
    serviceId: "email-queue",
    severity: "degraded",
    title: "Email queue backlog",
    summary: "Purchase confirmation emails delayed during Resend burst.",
    resolvedAt: "2026-06-22T06:18:00.000Z",
    recoveryTimeMinutes: 3
  },
  {
    id: "health_inc_004",
    timestamp: "2026-06-21T14:22:00.000Z",
    serviceId: "paystack",
    severity: "degraded",
    title: "Paystack verify timeout",
    summary: "Single verify request timed out; webhook reconciliation recovered payment.",
    resolvedAt: "2026-06-21T14:26:00.000Z",
    recoveryTimeMinutes: 4
  },
  {
    id: "health_inc_005",
    timestamp: "2026-06-19T03:00:00.000Z",
    serviceId: "background-jobs",
    severity: "degraded",
    title: "Cron runner restart",
    summary: "Container restart interrupted one retention sweep; next run completed cleanly.",
    resolvedAt: "2026-06-19T03:02:00.000Z",
    recoveryTimeMinutes: 2
  }
];

export const SYSTEM_HEALTH_DEPENDENCIES_SEED = [
  {
    id: "member-auth",
    label: "Member auth & restore",
    dependsOn: ["supabase", "storage"] as MonitoredServiceId[],
    impact: "Login, restore, and profile photo access."
  },
  {
    id: "payments",
    label: "Premium & consultation payments",
    dependsOn: ["paystack", "resend", "email-queue"] as MonitoredServiceId[],
    impact: "Checkout, fulfillment, and purchase email."
  },
  {
    id: "consultation-scheduling",
    label: "Consultation scheduling",
    dependsOn: ["google-calendar", "zoom", "google-meet", "email-queue"] as MonitoredServiceId[],
    impact: "Bookings, meeting links, and reminders."
  },
  {
    id: "whatsapp-verification",
    label: "WhatsApp verification",
    dependsOn: ["sendchamp", "whatsapp-queue", "supabase"] as MonitoredServiceId[],
    impact: "OTP delivery and signup verification."
  }
] as const;
