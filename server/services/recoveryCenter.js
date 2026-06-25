/**
 * Business Continuity & Disaster Recovery Center™ — server-side resilience logic.
 */

export const RECOVERY_CENTER_DB_TABLES = [
  "recovery_backup_records",
  "recovery_restore_history",
  "recovery_playbook_records",
  "recovery_test_runs",
  "recovery_critical_systems",
  "recovery_dependency_links"
];

export function getRecoveryCenterDatabaseTableManifest() {
  return RECOVERY_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "recovery",
    migrationRef: "0015_disaster_recovery_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function canAccessRecoveryCenter(permissions = []) {
  return (
    permissions.includes("ManageRecovery") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ManageOperations")
  );
}

export function buildRecoveryHealthSummary(
  backups,
  playbooks,
  restoreHistory,
  operations
) {
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

export function filterBackupsByArea(backups, areaId) {
  if (!areaId || areaId === "backups") return backups;
  return backups;
}

export function filterPlaybooksByArea(playbooks, areaId) {
  if (areaId === "incident-playbooks" || areaId === "recovery-plans") return playbooks;
  return playbooks;
}

export function filterRestoreHistoryByArea(history, areaId) {
  if (areaId === "restore" || areaId === "recovery-history") return history;
  return history;
}

export function listCriticalDependencies(dependencies) {
  return dependencies.filter((item) => item.critical);
}

export function listTierOneSystems(systems) {
  return systems.filter((item) => item.tier === "tier-1");
}

export function verifyRestoreComplete(restore) {
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

export function activatePlaybook(playbook, actor) {
  return {
    ...playbook,
    status: playbook.status === "draft" ? "ready" : playbook.status,
    lastTestedAt: playbook.lastTestedAt ?? new Date().toISOString()
  };
}

export function formatRecoverySummaryLine(summary) {
  return `${summary.healthyBackups}/${summary.totalBackups} backups healthy · ${summary.testedPlaybooks} playbooks ready · ${summary.verifiedRestores} verified restores`;
}
