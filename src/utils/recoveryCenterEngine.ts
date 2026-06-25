import type { RecoveryCenterBundle } from "../types/recoveryCenter";
import type { RecoveryCenterAreaId } from "../constants/recoveryCenter";
import {
  buildRecoveryHealthSummary,
  filterBackupsByArea,
  filterPlaybooksByArea,
  filterRestoreHistoryByArea,
  sortIncidentsByDate,
  sortRestoreHistory
} from "./recoveryCenterLogic";
import {
  listCriticalSystems,
  listRecoveryBackups,
  listRecoveryDependencies,
  listRecoveryIncidents,
  listRecoveryOperations,
  listRecoveryPlaybooks,
  listRecoveryTests,
  listRestoreHistory
} from "./recoveryCenterStore";

export function buildRecoveryCenterBundle(
  areaId: RecoveryCenterAreaId = "backups"
): RecoveryCenterBundle {
  const backups = listRecoveryBackups();
  const operations = listRecoveryOperations();
  const playbooks = listRecoveryPlaybooks();
  const restoreHistory = listRestoreHistory();
  const recoveryTests = listRecoveryTests();
  const criticalSystems = listCriticalSystems();
  const dependencies = listRecoveryDependencies();
  const incidents = listRecoveryIncidents();

  return {
    generatedAt: new Date().toISOString(),
    summary: buildRecoveryHealthSummary(backups, playbooks, restoreHistory, operations),
    backups: filterBackupsByArea(backups, areaId),
    operations,
    playbooks: filterPlaybooksByArea(playbooks, areaId),
    restoreHistory: sortRestoreHistory(filterRestoreHistoryByArea(restoreHistory, areaId)),
    recoveryTests: areaId === "recovery-testing" ? recoveryTests : recoveryTests,
    criticalSystems: areaId === "critical-systems" ? criticalSystems : criticalSystems,
    dependencies: areaId === "dependencies" ? dependencies : dependencies,
    incidents: sortIncidentsByDate(incidents)
  };
}

export { emptyRecoveryFilters } from "./recoveryCenterLogic";
