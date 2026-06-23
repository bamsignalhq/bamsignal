import { BACKUP_STATUS_SEED, INCIDENT_RECOVERY_SEED, RECOVERY_PLANS_SEED } from "../data/recoveryCenterSeed";
import type {
  BackupStatusRecord,
  IncidentRecoveryRecord,
  RecoveryCenterBundle,
  RecoveryFilterState,
  RecoveryPlanRecord
} from "../types/recoveryCenter";
import {
  buildRecoveryMetrics,
  buildRecoveryReadiness,
  emptyRecoveryFilters,
  filterIncidents,
  findIncidentById,
  sortIncidentsByDate
} from "./recoveryCenterLogic";
import { readJson } from "./storage";

const STORAGE_KEY = "bamsignal.recoveryCenter.v1";

type RecoveryCenterState = {
  backups: BackupStatusRecord[];
  plans: RecoveryPlanRecord[];
  incidents: IncidentRecoveryRecord[];
  updatedAt: string;
};

function normalizeBackup(backup: BackupStatusRecord): BackupStatusRecord {
  return {
    ...backup,
    verifiedAt: backup.verifiedAt ?? null
  };
}

function defaultState(): RecoveryCenterState {
  return {
    backups: BACKUP_STATUS_SEED.map(normalizeBackup),
    plans: [...RECOVERY_PLANS_SEED],
    incidents: [...INCIDENT_RECOVERY_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): RecoveryCenterState {
  const stored = readJson<RecoveryCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.backups?.length) return defaultState();
  return {
    ...stored,
    backups: stored.backups.map(normalizeBackup),
    plans: stored.plans ?? RECOVERY_PLANS_SEED,
    incidents: stored.incidents ?? INCIDENT_RECOVERY_SEED
  };
}

export function listRecoveryCenterBackups(): BackupStatusRecord[] {
  return loadState().backups;
}

export function listRecoveryCenterPlans(): RecoveryPlanRecord[] {
  return loadState().plans;
}

export function listRecoveryCenterIncidents(): IncidentRecoveryRecord[] {
  return loadState().incidents;
}

export function buildRecoveryCenterBundle(
  filters: RecoveryFilterState = emptyRecoveryFilters(),
  selectedIncidentId?: string | null
): RecoveryCenterBundle {
  const allBackups = listRecoveryCenterBackups();
  const plans = listRecoveryCenterPlans();
  const allIncidents = listRecoveryCenterIncidents();
  const incidents = sortIncidentsByDate(filterIncidents(allIncidents, filters));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildRecoveryMetrics(allBackups, plans, allIncidents),
    backups: allBackups,
    plans,
    incidents,
    readiness: buildRecoveryReadiness(allBackups, plans, allIncidents),
    selectedIncident: findIncidentById(incidents, selectedIncidentId ?? null)
  };
}

export { emptyRecoveryFilters };
