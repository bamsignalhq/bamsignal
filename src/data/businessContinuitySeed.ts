import type {
  BackupJobRecord,
  ContinuityExerciseRecord,
  IncidentReportRecord,
  ProviderStatusRecord,
  RecoveryPlanRecord,
  SystemHealthSnapshotRecord
} from "../types/businessContinuity";
import { MONITORED_PROVIDERS } from "../constants/businessContinuity";

const NOW = "2026-06-24T08:00:00.000Z";

export const INCIDENT_REPORT_SEED: IncidentReportRecord[] = [
  {
    id: "bc100000-0000-4000-8000-000000000001",
    incidentRef: "INC-2026-0618-001",
    title: "Sendchamp delivery latency spike",
    severity: "medium",
    status: "resolved",
    ownerEmail: "ops@bamsignal.com",
    affectedSystems: ["sendchamp", "whatsapp-queue"],
    timeline: [
      { at: "2026-06-18T14:20:00.000Z", actor: "ops@bamsignal.com", note: "Detected elevated WhatsApp queue latency." },
      { at: "2026-06-18T14:45:00.000Z", actor: "ops@bamsignal.com", note: "Switched to retry backoff and member email fallback." },
      { at: "2026-06-18T16:10:00.000Z", actor: "ops@bamsignal.com", note: "Provider recovered; queue drained." }
    ],
    resolution: "Provider latency normalized. No member data loss.",
    postmortem: "Add Sendchamp latency SLO alert at 2s p95.",
    startedAt: "2026-06-18T14:20:00.000Z",
    resolvedAt: "2026-06-18T16:10:00.000Z",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc100000-0000-4000-8000-000000000002",
    incidentRef: "INC-2026-0622-002",
    title: "Scheduled database maintenance window",
    severity: "low",
    status: "closed",
    ownerEmail: "cto@bamsignal.com",
    affectedSystems: ["supabase"],
    timeline: [
      { at: "2026-06-22T02:00:00.000Z", actor: "cto@bamsignal.com", note: "Maintenance window started." },
      { at: "2026-06-22T02:35:00.000Z", actor: "cto@bamsignal.com", note: "Maintenance completed without rollback." }
    ],
    resolution: "Planned maintenance completed.",
    startedAt: "2026-06-22T02:00:00.000Z",
    resolvedAt: "2026-06-22T02:35:00.000Z",
    createdAt: NOW,
    updatedAt: NOW
  }
];

function buildPlaybookSteps(domain: string): RecoveryPlanRecord["procedureSteps"] {
  return [
    { order: 1, title: "Declare incident", detail: `Open incident in BC/DR Center and assign owner for ${domain}.` },
    { order: 2, title: "Assess blast radius", detail: "Identify affected members, consultants, and payment paths." },
    { order: 3, title: "Activate workaround", detail: "Follow documented fallback channels and preserve audit trail." },
    { order: 4, title: "Communicate status", detail: "Notify operations, executive, and support with ETA updates." },
    { order: 5, title: "Recover and verify", detail: "Restore service, run verification checklist, close incident." }
  ];
}

export const RECOVERY_PLAN_SEED: RecoveryPlanRecord[] = [
  {
    id: "bc200000-0000-4000-8000-000000000001",
    slug: "database-outage",
    title: "Database outage recovery",
    domainId: "database-outage",
    status: "ready",
    procedureSteps: buildPlaybookSteps("database"),
    ownerEmail: "cto@bamsignal.com",
    lastTestedAt: "2026-05-15T10:00:00.000Z",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc200000-0000-4000-8000-000000000002",
    slug: "payment-outage",
    title: "Payment outage recovery",
    domainId: "payment-outage",
    status: "ready",
    procedureSteps: buildPlaybookSteps("Paystack"),
    ownerEmail: "finance@bamsignal.com",
    lastTestedAt: "2026-04-20T11:00:00.000Z",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc200000-0000-4000-8000-000000000003",
    slug: "email-outage",
    title: "Email outage recovery",
    domainId: "email-outage",
    status: "ready",
    procedureSteps: buildPlaybookSteps("Resend"),
    ownerEmail: "ops@bamsignal.com",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc200000-0000-4000-8000-000000000004",
    slug: "whatsapp-outage",
    title: "WhatsApp outage recovery",
    domainId: "whatsapp-outage",
    status: "ready",
    procedureSteps: buildPlaybookSteps("Sendchamp"),
    ownerEmail: "ops@bamsignal.com",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc200000-0000-4000-8000-000000000005",
    slug: "calendar-outage",
    title: "Calendar outage recovery",
    domainId: "calendar-outage",
    status: "ready",
    procedureSteps: buildPlaybookSteps("Google Calendar"),
    ownerEmail: "ops@bamsignal.com",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc200000-0000-4000-8000-000000000006",
    slug: "zoom-outage",
    title: "Zoom outage recovery",
    domainId: "zoom-outage",
    status: "ready",
    procedureSteps: buildPlaybookSteps("Zoom"),
    ownerEmail: "ops@bamsignal.com",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc200000-0000-4000-8000-000000000007",
    slug: "authentication-outage",
    title: "Authentication outage recovery",
    domainId: "authentication-outage",
    status: "tested",
    procedureSteps: buildPlaybookSteps("authentication"),
    ownerEmail: "cto@bamsignal.com",
    lastTestedAt: "2026-06-01T09:00:00.000Z",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc200000-0000-4000-8000-000000000008",
    slug: "storage-outage",
    title: "Storage outage recovery",
    domainId: "storage-outage",
    status: "ready",
    procedureSteps: buildPlaybookSteps("storage"),
    ownerEmail: "cto@bamsignal.com",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc200000-0000-4000-8000-000000000009",
    slug: "server-outage",
    title: "Server outage recovery",
    domainId: "server-outage",
    status: "ready",
    procedureSteps: buildPlaybookSteps("Coolify server"),
    ownerEmail: "cto@bamsignal.com",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc200000-0000-4000-8000-000000000010",
    slug: "dns-outage",
    title: "DNS outage recovery",
    domainId: "dns-outage",
    status: "draft",
    procedureSteps: buildPlaybookSteps("DNS"),
    ownerEmail: "cto@bamsignal.com",
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const BACKUP_JOB_SEED: BackupJobRecord[] = [
  {
    id: "bc300000-0000-4000-8000-000000000001",
    jobRef: "BK-DB-20260624",
    areaId: "database",
    status: "completed",
    health: "healthy",
    durationSeconds: 184,
    verified: true,
    restorePoint: "2026-06-24T03:00:00.000Z",
    frequency: "Daily at 03:00 WAT",
    completedAt: "2026-06-24T03:03:04.000Z",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc300000-0000-4000-8000-000000000002",
    jobRef: "BK-AUDIT-20260624",
    areaId: "audit-trails",
    status: "completed",
    health: "healthy",
    durationSeconds: 42,
    verified: true,
    restorePoint: "2026-06-24T04:00:00.000Z",
    frequency: "Daily at 04:00 WAT",
    completedAt: "2026-06-24T04:00:42.000Z",
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc300000-0000-4000-8000-000000000003",
    jobRef: "BK-MEDIA-20260623",
    areaId: "media-storage",
    status: "completed",
    health: "degraded",
    durationSeconds: 612,
    verified: false,
    restorePoint: "2026-06-23T05:00:00.000Z",
    frequency: "Weekly Sunday 05:00 WAT",
    completedAt: "2026-06-23T05:10:12.000Z",
    createdAt: NOW,
    updatedAt: NOW
  }
];

export const PROVIDER_STATUS_SEED: ProviderStatusRecord[] = MONITORED_PROVIDERS.map((provider, index) => ({
  id: `bc400000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  providerId: provider.id,
  status: index === 6 ? "degraded" : "healthy",
  latencyMs: 80 + index * 15,
  lastCheckedAt: NOW,
  detail: index === 6 ? "Elevated queue depth — monitoring" : "Operational"
}));

export const SYSTEM_HEALTH_SNAPSHOT_SEED: SystemHealthSnapshotRecord = {
  id: "bc500000-0000-4000-8000-000000000001",
  snapshotAt: NOW,
  overallStatus: "degraded",
  services: PROVIDER_STATUS_SEED.map((item) => ({
    providerId: item.providerId,
    status: item.status
  })),
  dependencies: {
    database: "supabase",
    payments: "paystack",
    email: "resend",
    whatsapp: "sendchamp"
  },
  createdAt: NOW
};

export const CONTINUITY_EXERCISE_SEED: ContinuityExerciseRecord[] = [
  {
    id: "bc600000-0000-4000-8000-000000000001",
    exerciseRef: "DRX-2026-Q2-001",
    title: "Q2 database failover tabletop",
    scenarioId: "database-outage",
    status: "completed",
    scheduledAt: "2026-06-10T10:00:00.000Z",
    completedAt: "2026-06-10T12:30:00.000Z",
    findings: ["RTO documented at 45 minutes", "Restore point verification passed"],
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "bc600000-0000-4000-8000-000000000002",
    exerciseRef: "DRX-2026-Q3-001",
    title: "Q3 payment outage simulation",
    scenarioId: "payment-outage",
    status: "scheduled",
    scheduledAt: "2026-09-15T10:00:00.000Z",
    findings: [],
    createdAt: NOW,
    updatedAt: NOW
  }
];
