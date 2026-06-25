import {
  CONTINUITY_HEALTH_STATUS_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  MONITORED_PROVIDER_LABELS,
  RECOVERY_PLAYBOOK_DOMAIN_LABELS
} from "../constants/businessContinuity";
import type {
  BackupJobRecord,
  ContinuityOverviewMetric,
  IncidentReportRecord,
  ProviderStatusRecord,
  RiskAssessmentItem
} from "../types/businessContinuity";
import type { ContinuityHealthStatusId } from "../constants/businessContinuity";

const STATUS_RANK: Record<ContinuityHealthStatusId, number> = {
  healthy: 0,
  maintenance: 1,
  degraded: 2,
  "partial-outage": 3,
  "major-outage": 4
};

export function deriveOverallContinuityStatus(
  providerStatuses: ProviderStatusRecord[]
): ContinuityHealthStatusId {
  if (!providerStatuses.length) return "healthy";
  let worst: ContinuityHealthStatusId = "healthy";
  for (const item of providerStatuses) {
    if (STATUS_RANK[item.status] > STATUS_RANK[worst]) {
      worst = item.status;
    }
  }
  return worst;
}

export function countActiveIncidents(incidents: IncidentReportRecord[]): number {
  return incidents.filter((item) => !["resolved", "closed"].includes(item.status)).length;
}

export function assessBackupHealth(backupJobs: BackupJobRecord[]) {
  const latestByArea = new Map<string, BackupJobRecord>();
  for (const job of backupJobs) {
    const existing = latestByArea.get(job.areaId);
    const completedAt = Date.parse(job.completedAt ?? job.createdAt);
    const existingAt = existing ? Date.parse(existing.completedAt ?? existing.createdAt) : 0;
    if (!existing || completedAt >= existingAt) {
      latestByArea.set(job.areaId, job);
    }
  }

  const latest = [...latestByArea.values()];
  if (!latest.length) {
    return { health: "degraded" as ContinuityHealthStatusId, verifiedCount: 0, total: 0, latest: null };
  }

  const failed = latest.filter((job) => job.health === "major-outage" || job.status === "failed");
  const unverified = latest.filter((job) => !job.verified);
  const degraded = latest.filter((job) => job.health === "degraded");

  let health: ContinuityHealthStatusId = "healthy";
  if (failed.length) health = "major-outage";
  else if (degraded.length || unverified.length) health = "degraded";

  const sorted = [...latest].sort(
    (a, b) =>
      Date.parse(b.completedAt ?? b.createdAt) - Date.parse(a.completedAt ?? a.createdAt)
  );

  return {
    health,
    verifiedCount: latest.filter((job) => job.verified).length,
    total: latest.length,
    latest: sorted[0] ?? null
  };
}

export function buildRiskAssessment(
  providerStatuses: ProviderStatusRecord[],
  backupAssessment: ReturnType<typeof assessBackupHealth>,
  activeIncidents: number
): RiskAssessmentItem[] {
  const criticalIds = ["supabase", "paystack", "authentication", "storage", "cron-jobs"];
  const degradedCritical = providerStatuses.filter(
    (item) => criticalIds.includes(item.providerId) && item.status !== "healthy"
  ).length;

  const providerScore = Math.max(0, 100 - degradedCritical * 18);
  const backupScore =
    backupAssessment.health === "healthy" ? 95 : backupAssessment.health === "degraded" ? 72 : 40;
  const incidentScore = Math.max(0, 100 - activeIncidents * 25);

  return [
    {
      id: "provider-resilience",
      label: "Provider resilience",
      score: providerScore,
      status: providerScore >= 85 ? "healthy" : providerScore >= 65 ? "degraded" : "partial-outage",
      note: `${degradedCritical} critical provider(s) not fully healthy`
    },
    {
      id: "backup-readiness",
      label: "Backup readiness",
      score: backupScore,
      status: backupAssessment.health,
      note: `${backupAssessment.verifiedCount}/${backupAssessment.total} areas verified`
    },
    {
      id: "incident-exposure",
      label: "Incident exposure",
      score: incidentScore,
      status:
        activeIncidents === 0 ? "healthy" : activeIncidents === 1 ? "degraded" : "partial-outage",
      note: `${activeIncidents} active incident(s)`
    }
  ];
}

export function buildContinuityOverviewMetrics(
  incidents: IncidentReportRecord[],
  providerStatuses: ProviderStatusRecord[],
  backupAssessment: ReturnType<typeof assessBackupHealth>,
  overallStatus: ContinuityHealthStatusId
): ContinuityOverviewMetric[] {
  const active = countActiveIncidents(incidents);
  const degradedProviders = providerStatuses.filter((item) => item.status !== "healthy").length;

  return [
    {
      id: "overall-status",
      label: "Overall status",
      value: CONTINUITY_HEALTH_STATUS_LABELS[overallStatus],
      tone: overallStatus
    },
    {
      id: "active-incidents",
      label: "Active incidents",
      value: String(active),
      hint: active === 0 ? "No open incidents" : "Requires attention"
    },
    {
      id: "provider-health",
      label: "Providers monitored",
      value: String(providerStatuses.length),
      hint: degradedProviders ? `${degradedProviders} degraded` : "All nominal"
    },
    {
      id: "backup-health",
      label: "Backup health",
      value: CONTINUITY_HEALTH_STATUS_LABELS[backupAssessment.health],
      tone: backupAssessment.health,
      hint: backupAssessment.latest?.jobRef ?? "No backup recorded"
    },
    {
      id: "playbooks-ready",
      label: "Recovery playbooks",
      value: String(Object.keys(RECOVERY_PLAYBOOK_DOMAIN_LABELS).length),
      hint: "Documented procedures"
    }
  ];
}

export function formatIncidentSummary(incident: IncidentReportRecord): string {
  return `${incident.incidentRef} · ${INCIDENT_SEVERITY_LABELS[incident.severity]} · ${INCIDENT_STATUS_LABELS[incident.status]}`;
}

export function formatProviderLabel(providerId: string): string {
  return MONITORED_PROVIDER_LABELS[providerId as keyof typeof MONITORED_PROVIDER_LABELS] ?? providerId;
}

export function formatDurationSeconds(seconds?: number): string {
  if (!seconds && seconds !== 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}
