import {
  BACKUP_AREAS,
  RECOVERY_CENTER_METRICS,
  RECOVERY_LEVELS
} from "../constants/recoveryCenter";
import {
  BACKUP_STATUS_SEED,
  INCIDENT_RECOVERY_SEED,
  RECOVERY_PLANS_SEED
} from "../data/recoveryCenterSeed";
import type {
  BackupStatusRecord,
  IncidentRecoveryRecord,
  RecoveryFilterState,
  RecoveryMetric,
  RecoveryPlanRecord,
  RecoveryReadinessSummary
} from "../types/recoveryCenter";
import type { BackupAreaId, RecoveryLevelId } from "../constants/recoveryCenter";

const STALE_BACKUP_MS = 36 * 60 * 60 * 1000;

function normalizeBackup(backup: BackupStatusRecord): BackupStatusRecord {
  return {
    ...backup,
    verifiedAt: backup.verifiedAt ?? null
  };
}

export function listBackups(): BackupStatusRecord[] {
  return BACKUP_STATUS_SEED.map(normalizeBackup);
}

export function listRecoveryPlans(): RecoveryPlanRecord[] {
  return [...RECOVERY_PLANS_SEED];
}

export function listIncidentRecoveries(): IncidentRecoveryRecord[] {
  return [...INCIDENT_RECOVERY_SEED];
}

export function findIncidentById(
  incidents: IncidentRecoveryRecord[],
  incidentId: string | null
): IncidentRecoveryRecord | null {
  if (!incidentId) return null;
  return incidents.find((incident) => incident.id === incidentId) ?? null;
}

export function sortIncidentsByDate(incidents: IncidentRecoveryRecord[]): IncidentRecoveryRecord[] {
  return [...incidents].sort(
    (left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()
  );
}

export function filterBackups(backups: BackupStatusRecord[], filters: RecoveryFilterState): BackupStatusRecord[] {
  if (filters.areaId === "all") return backups;
  return backups.filter((backup) => backup.areaId === filters.areaId);
}

export function filterIncidents(
  incidents: IncidentRecoveryRecord[],
  filters: RecoveryFilterState
): IncidentRecoveryRecord[] {
  const query = filters.query.trim().toLowerCase();

  return incidents.filter((incident) => {
    if (filters.levelId !== "all" && incident.levelId !== filters.levelId) return false;
    if (!query) return true;

    const haystack = [
      incident.incidentRef,
      incident.title,
      incident.summary,
      incident.owner
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function countHealthyBackups(backups: BackupStatusRecord[]): number {
  return backups.filter((backup) => backup.status === "healthy").length;
}

export function countTestedPlans(plans: RecoveryPlanRecord[]): number {
  return plans.filter((plan) => plan.status === "tested" || plan.status === "ready").length;
}

export function countActiveIncidents(incidents: IncidentRecoveryRecord[]): number {
  return incidents.filter(
    (incident) => incident.status === "active" || incident.status === "recovering"
  ).length;
}

export function findLatestBackup(backups: BackupStatusRecord[]): BackupStatusRecord | null {
  if (!backups.length) return null;
  return [...backups].sort(
    (left, right) => new Date(right.lastBackupAt).getTime() - new Date(left.lastBackupAt).getTime()
  )[0];
}

export function summarizeRetention(backups: BackupStatusRecord[]): string {
  if (!backups.length) return "—";
  const minDays = Math.min(...backups.map((backup) => backup.retentionDays));
  const maxDays = Math.max(...backups.map((backup) => backup.retentionDays));
  return minDays === maxDays ? `${minDays} days` : `${minDays}–${maxDays} days`;
}

export function buildRecoveryReadiness(
  backups: BackupStatusRecord[],
  plans: RecoveryPlanRecord[],
  incidents: IncidentRecoveryRecord[]
): RecoveryReadinessSummary {
  const healthyBackups = countHealthyBackups(backups);
  const testedPlans = countTestedPlans(plans);
  const activeIncidents = countActiveIncidents(incidents);
  const backupScore = backups.length ? (healthyBackups / backups.length) * 50 : 0;
  const planScore = plans.length ? (testedPlans / plans.length) * 40 : 0;
  const incidentPenalty = activeIncidents * 10;
  const score = Math.max(0, Math.min(100, Math.round(backupScore + planScore + 10 - incidentPenalty)));

  const label =
    score >= 85 ? "Ready" : score >= 65 ? "Needs attention" : score >= 40 ? "At risk" : "Critical";

  return {
    score,
    label,
    healthyBackups,
    totalBackups: backups.length,
    testedPlans,
    totalPlans: plans.length,
    activeIncidents
  };
}

export function buildRecoveryMetrics(
  backups: BackupStatusRecord[],
  plans: RecoveryPlanRecord[],
  incidents: IncidentRecoveryRecord[]
): RecoveryMetric[] {
  const latest = findLatestBackup(backups);
  const readiness = buildRecoveryReadiness(backups, plans, incidents);
  const frequencies = [...new Set(backups.map((backup) => backup.frequencyLabel))];

  const values: Record<string, string> = {
    "last-backup": latest ? new Date(latest.lastBackupAt).toLocaleString() : "—",
    "backup-frequency": frequencies.length === 1 ? frequencies[0] : "Mixed schedule",
    "recovery-readiness": `${readiness.score}% (${readiness.label})`,
    "retention-status": summarizeRetention(backups)
  };

  return RECOVERY_CENTER_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "—",
    numericValue: metric.id === "recovery-readiness" ? readiness.score : undefined
  }));
}

export function listBackupsByArea(backups: BackupStatusRecord[]): Record<BackupAreaId, BackupStatusRecord | null> {
  return Object.fromEntries(
    BACKUP_AREAS.map((area) => [
      area.id,
      backups.find((backup) => backup.areaId === area.id) ?? null
    ])
  ) as Record<BackupAreaId, BackupStatusRecord | null>;
}

export function listPlansByLevel(plans: RecoveryPlanRecord[]): Record<RecoveryLevelId, RecoveryPlanRecord | null> {
  return Object.fromEntries(
    RECOVERY_LEVELS.map((level) => [
      level.id,
      plans.find((plan) => plan.levelId === level.id) ?? null
    ])
  ) as Record<RecoveryLevelId, RecoveryPlanRecord | null>;
}

export function isBackupStale(backup: BackupStatusRecord): boolean {
  return Date.now() - new Date(backup.lastBackupAt).getTime() > STALE_BACKUP_MS;
}

export function emptyRecoveryFilters(): RecoveryFilterState {
  return {
    query: "",
    areaId: "all",
    levelId: "all"
  };
}
