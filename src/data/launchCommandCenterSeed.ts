import {
  LAUNCH_COMMAND_HEALTH_STATUS_LABELS,
  LAUNCH_COMMAND_SECTIONS,
  LAUNCH_READINESS_SCORE_DOMAINS,
  type LaunchCommandSectionId,
  type LaunchReadinessScoreId
} from "../constants/launchCommandCenter";
import type {
  LaunchCommandBlocker,
  LaunchCommandDeploymentRecord,
  LaunchCommandIncidentRecord,
  LaunchCommandMetric,
  LaunchCommandSectionSnapshot,
  LaunchCommandServiceRecord,
  LaunchReadinessScore
} from "../types/launchCommandCenter";

const NOW = "2026-06-26T12:00:00.000Z";

const SCORE_VALUES: Record<LaunchReadinessScoreId, number> = {
  overall: 91,
  infrastructure: 94,
  security: 88,
  payments: 96,
  messaging: 92,
  matching: 89,
  consultations: 87,
  support: 90,
  operations: 93
};

function scoreStatus(score: number): LaunchReadinessScore["status"] {
  if (score >= 90) return "healthy";
  if (score >= 80) return "warning";
  return "critical";
}

export const LAUNCH_READINESS_SCORE_SEED: LaunchReadinessScore[] =
  LAUNCH_READINESS_SCORE_DOMAINS.map((domain) => ({
    id: domain.id,
    label: domain.label,
    score: SCORE_VALUES[domain.id],
    status: scoreStatus(SCORE_VALUES[domain.id])
  }));

export const LAUNCH_COMMAND_BLOCKER_SEED: LaunchCommandBlocker[] = [
  {
    id: "lcb_001",
    blockerRef: "LCB-2026-0018",
    title: "Consultant pool below weekend surge threshold",
    severity: "high",
    domain: "Consultations",
    status: "open",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-25T16:00:00.000Z"
  },
  {
    id: "lcb_002",
    blockerRef: "LCB-2026-0015",
    title: "Security headers audit — CSP report-only mode",
    severity: "medium",
    domain: "Security",
    status: "open",
    ownerEmail: "security@bamsignal.com",
    openedAt: "2026-06-24T10:00:00.000Z"
  },
  {
    id: "lcb_003",
    blockerRef: "LCB-2026-0012",
    title: "Support queue SLA breach during peak hours",
    severity: "medium",
    domain: "Support",
    status: "open",
    ownerEmail: "support@bamsignal.com",
    openedAt: "2026-06-23T18:30:00.000Z"
  },
  {
    id: "lcb_004",
    blockerRef: "LCB-2026-0009",
    title: "Feature flag snapshot lag on remote config",
    severity: "low",
    domain: "Infrastructure",
    status: "mitigated",
    ownerEmail: "ops@bamsignal.com",
    openedAt: "2026-06-20T09:00:00.000Z"
  }
];

const SECTION_METRICS: Record<LaunchCommandSectionId, LaunchCommandMetric[]> = {
  "launch-readiness": [
    { id: "lr-1", label: "Domains ready", value: "8 / 9", status: "healthy" },
    { id: "lr-2", label: "Open blockers", value: "3", status: "warning" },
    { id: "lr-3", label: "Certification", value: "Passed", status: "healthy" }
  ],
  "production-health": [
    { id: "ph-1", label: "Uptime (30d)", value: "99.94%", status: "healthy" },
    { id: "ph-2", label: "Error rate", value: "0.08%", status: "healthy" },
    { id: "ph-3", label: "P95 latency", value: "420 ms", status: "healthy" }
  ],
  "platform-health": [
    { id: "pl-1", label: "Services healthy", value: "11 / 12", status: "warning" },
    { id: "pl-2", label: "Critical offline", value: "0", status: "healthy" },
    { id: "pl-3", label: "Last probe", value: "2 min ago", status: "healthy" }
  ],
  "critical-services": [
    { id: "cs-1", label: "API gateway", value: "Healthy", status: "healthy" },
    { id: "cs-2", label: "Auth service", value: "Healthy", status: "healthy" },
    { id: "cs-3", label: "Payment webhook", value: "Healthy", status: "healthy" }
  ],
  incidents: [
    { id: "in-1", label: "Active incidents", value: "1", status: "warning" },
    { id: "in-2", label: "Resolved (24h)", value: "2", status: "healthy" },
    { id: "in-3", label: "MTTR", value: "38 min", status: "healthy" }
  ],
  "current-deployments": [
    { id: "cd-1", label: "Production", value: "v1.0.15-18", status: "healthy" },
    { id: "cd-2", label: "Rolling", value: "None", status: "healthy" },
    { id: "cd-3", label: "Coolify status", value: "Live", status: "healthy" }
  ],
  "latest-release": [
    { id: "lr-rel-1", label: "Version", value: "v1.0.15-18", status: "healthy" },
    { id: "lr-rel-2", label: "Deployed", value: "2026-06-26 08:42 WAT", status: "healthy" },
    { id: "lr-rel-3", label: "Smoke tests", value: "Passed", status: "healthy" }
  ],
  "startup-performance": [
    { id: "sp-1", label: "Cold start P95", value: "1.8 s", status: "healthy" },
    { id: "sp-2", label: "Warm start P95", value: "620 ms", status: "healthy" },
    { id: "sp-3", label: "SW cache hit", value: "94%", status: "healthy" }
  ],
  "otp-success-rate": [
    { id: "otp-1", label: "24h success", value: "97.8%", status: "healthy" },
    { id: "otp-2", label: "SendChamp delivery", value: "98.2%", status: "healthy" },
    { id: "otp-3", label: "Abuse blocks", value: "142", status: "warning" }
  ],
  "payment-success-rate": [
    { id: "pay-1", label: "24h success", value: "99.1%", status: "healthy" },
    { id: "pay-2", label: "Webhook verify", value: "100%", status: "healthy" },
    { id: "pay-3", label: "Failed retries", value: "12", status: "healthy" }
  ],
  "notification-delivery": [
    { id: "nd-1", label: "Email delivery", value: "99.4%", status: "healthy" },
    { id: "nd-2", label: "WhatsApp delivery", value: "96.8%", status: "warning" },
    { id: "nd-3", label: "Queue backlog", value: "28", status: "healthy" }
  ],
  "database-health": [
    { id: "db-1", label: "Connection pool", value: "42%", status: "healthy" },
    { id: "db-2", label: "Replication lag", value: "0.4 s", status: "healthy" },
    { id: "db-3", label: "Slow queries (1h)", value: "3", status: "healthy" }
  ],
  "queue-health": [
    { id: "qh-1", label: "Notification queue", value: "Healthy", status: "healthy" },
    { id: "qh-2", label: "Payment queue", value: "Healthy", status: "healthy" },
    { id: "qh-3", label: "Dead letter", value: "0", status: "healthy" }
  ],
  "security-alerts": [
    { id: "sa-1", label: "Open alerts", value: "2", status: "warning" },
    { id: "sa-2", label: "RLS violations (24h)", value: "0", status: "healthy" },
    { id: "sa-3", label: "Failed admin auth", value: "4", status: "healthy" }
  ],
  "abuse-alerts": [
    { id: "aa-1", label: "Active blocks", value: "18", status: "healthy" },
    { id: "aa-2", label: "Rate limit hits", value: "1,240", status: "warning" },
    { id: "aa-3", label: "OTP abuse flags", value: "6", status: "healthy" }
  ],
  "support-queue": [
    { id: "sq-1", label: "Open tickets", value: "24", status: "warning" },
    { id: "sq-2", label: "P1 tickets", value: "0", status: "healthy" },
    { id: "sq-3", label: "Avg response", value: "42 min", status: "warning" }
  ],
  "consultant-availability": [
    { id: "ca-1", label: "Available now", value: "14 / 22", status: "warning" },
    { id: "ca-2", label: "Weekend coverage", value: "64%", status: "warning" },
    { id: "ca-3", label: "Intro backlog", value: "38", status: "healthy" }
  ]
};

function sectionStatus(metrics: LaunchCommandMetric[]): LaunchCommandSectionSnapshot["status"] {
  if (metrics.some((item) => item.status === "critical")) return "critical";
  if (metrics.some((item) => item.status === "warning")) return "warning";
  return "healthy";
}

export const LAUNCH_COMMAND_SECTION_SEED: LaunchCommandSectionSnapshot[] =
  LAUNCH_COMMAND_SECTIONS.map((section) => {
    const metrics = SECTION_METRICS[section.id];
    return {
      sectionId: section.id,
      status: sectionStatus(metrics),
      headline: `${section.label} — ${LAUNCH_COMMAND_HEALTH_STATUS_LABELS[sectionStatus(metrics)]}`,
      metrics
    };
  });

export const LAUNCH_COMMAND_SERVICE_SEED: LaunchCommandServiceRecord[] = [
  {
    id: "svc-api",
    name: "API Gateway",
    critical: true,
    status: "healthy",
    latencyMs: 84,
    uptimePercent: 99.98,
    lastCheckedAt: NOW
  },
  {
    id: "svc-auth",
    name: "PIN Auth",
    critical: true,
    status: "healthy",
    latencyMs: 120,
    uptimePercent: 99.96,
    lastCheckedAt: NOW
  },
  {
    id: "svc-db",
    name: "PostgreSQL",
    critical: true,
    status: "healthy",
    latencyMs: 18,
    uptimePercent: 99.99,
    lastCheckedAt: NOW
  },
  {
    id: "svc-paystack",
    name: "Paystack",
    critical: true,
    status: "healthy",
    latencyMs: 240,
    uptimePercent: 99.9,
    lastCheckedAt: NOW
  },
  {
    id: "svc-resend",
    name: "Resend Email",
    critical: true,
    status: "healthy",
    latencyMs: 310,
    uptimePercent: 99.85,
    lastCheckedAt: NOW
  },
  {
    id: "svc-sendchamp",
    name: "SendChamp OTP",
    critical: true,
    status: "warning",
    latencyMs: 480,
    uptimePercent: 98.2,
    lastCheckedAt: NOW
  },
  {
    id: "svc-storage",
    name: "Photo Storage",
    critical: true,
    status: "healthy",
    latencyMs: 95,
    uptimePercent: 99.94,
    lastCheckedAt: NOW
  }
];

export const LAUNCH_COMMAND_INCIDENT_SEED: LaunchCommandIncidentRecord[] = [
  {
    id: "lci_001",
    incidentRef: "INC-2026-0042",
    title: "SendChamp OTP latency spike — Lagos region",
    severity: "warning",
    status: "acknowledged",
    openedAt: "2026-06-26T09:15:00.000Z",
    service: "SendChamp OTP"
  },
  {
    id: "lci_002",
    incidentRef: "INC-2026-0040",
    title: "Support queue SLA breach — resolved",
    severity: "warning",
    status: "resolved",
    openedAt: "2026-06-25T14:00:00.000Z",
    service: "Support Queue"
  }
];

export const LAUNCH_COMMAND_DEPLOYMENT_SEED: LaunchCommandDeploymentRecord[] = [
  {
    id: "lcd_001",
    deployRef: "DEP-2026-0184",
    environment: "production",
    version: "v1.0.15-18",
    status: "live",
    deployedAt: "2026-06-26T08:42:00.000Z",
    deployedBy: "coolify@bamsignal.com"
  },
  {
    id: "lcd_002",
    deployRef: "DEP-2026-0183",
    environment: "staging",
    version: "v1.0.15-18",
    status: "live",
    deployedAt: "2026-06-26T07:30:00.000Z",
    deployedBy: "ops@bamsignal.com"
  }
];
