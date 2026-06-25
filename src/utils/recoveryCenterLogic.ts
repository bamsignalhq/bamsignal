import type {
  BackupRecord,
  CriticalSystemRecord,
  DependencyLinkRecord,
  IncidentRecoveryRecord,
  PlaybookRecord,
  RecoveryHealthSummary,
  RecoveryOperationRecord,
  RecoveryReadinessSummary,
  RestoreHistoryRecord
} from "../types/recoveryCenter";
import type { RecoveryCenterAreaId } from "../constants/recoveryCenter";

export function buildRecoveryHealthSummary(
  backups: BackupRecord[],
  playbooks: PlaybookRecord[],
  restoreHistory: RestoreHistoryRecord[],
  operations: RecoveryOperationRecord[]
): RecoveryHealthSummary {
  const healthyBackups = backups.filter((item) => item.status === "healthy").length;
  const testedPlaybooks = playbooks.filter(
    (item) => item.status === "tested" || item.status === "ready"
  ).length;
  const activeRestores =
    restoreHistory.filter((item) => item.status === "in-progress").length +
    operations.filter((item) => item.status === "in-progress").length;
  const verifiedRestores = restoreHistory.filter((item) => item.status === "verified").length;

  const backupScore = backups.length ? (healthyBackups / backups.length) * 50 : 0;
  const playbookScore = playbooks.length ? (testedPlaybooks / playbooks.length) * 40 : 0;
  const restorePenalty = activeRestores * 5;
  const score = Math.max(0, Math.min(100, Math.round(backupScore + playbookScore + 10 - restorePenalty)));

  const label =
    score >= 85 ? "Ready" : score >= 65 ? "Needs attention" : score >= 40 ? "At risk" : "Critical";

  return {
    score,
    label,
    healthyBackups,
    totalBackups: backups.length,
    testedPlaybooks,
    totalPlaybooks: playbooks.length,
    activeRestores,
    verifiedRestores
  };
}

export function filterBackupsByArea(backups: BackupRecord[], areaId: RecoveryCenterAreaId) {
  if (areaId === "backups") return backups;
  return backups;
}

export function filterPlaybooksByArea(playbooks: PlaybookRecord[], areaId: RecoveryCenterAreaId) {
  if (areaId === "incident-playbooks" || areaId === "recovery-plans") return playbooks;
  return playbooks;
}

export function filterRestoreHistoryByArea(
  history: RestoreHistoryRecord[],
  areaId: RecoveryCenterAreaId
) {
  if (areaId === "restore" || areaId === "recovery-history") return history;
  return history;
}

export function listCriticalDependencies(dependencies: DependencyLinkRecord[]) {
  return dependencies.filter((item) => item.critical);
}

export function listTierOneSystems(systems: CriticalSystemRecord[]) {
  return systems.filter((item) => item.tier === "tier-1");
}

export function verifyRestoreComplete(restore: RestoreHistoryRecord): RestoreHistoryRecord {
  if (restore.status === "verified") {
    throw new Error("Recovery violation: restore already verified");
  }
  return {
    ...restore,
    status: "verified",
    verifiedAt: new Date().toISOString(),
    completedAt: restore.completedAt ?? new Date().toISOString()
  };
}

export function activatePlaybook(playbook: PlaybookRecord): PlaybookRecord {
  return {
    ...playbook,
    status: playbook.status === "draft" ? "ready" : playbook.status,
    lastTestedAt: playbook.lastTestedAt ?? new Date().toISOString()
  };
}

export function formatRecoverySummaryLine(summary: RecoveryHealthSummary) {
  return `${summary.healthyBackups}/${summary.totalBackups} backups healthy · ${summary.testedPlaybooks} playbooks ready · ${summary.verifiedRestores} verified restores`;
}

export function sortRestoreHistory(history: RestoreHistoryRecord[]) {
  return [...history].sort(
    (left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()
  );
}

export function sortIncidentsByDate(incidents: IncidentRecoveryRecord[]) {
  return [...incidents].sort(
    (left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()
  );
}

export function emptyRecoveryFilters() {
  return { query: "", areaId: "all" as const, levelId: "all" as const };
}

const STALE_BACKUP_MS = 36 * 60 * 60 * 1000;

export function isBackupStale(backup: BackupRecord): boolean {
  return Date.now() - new Date(backup.lastBackupAt).getTime() > STALE_BACKUP_MS;
}

export function toRecoveryReadinessSummary(summary: RecoveryHealthSummary): RecoveryReadinessSummary {
  return {
    ...summary,
    testedPlans: summary.testedPlaybooks,
    totalPlans: summary.totalPlaybooks,
    activeIncidents: summary.activeRestores
  };
}
