import type { RecoveryCenterAuditActionId } from "../constants/recoveryCenter";
import {
  BACKUP_RECORD_SEED,
  CRITICAL_SYSTEM_SEED,
  DEPENDENCY_LINK_SEED,
  INCIDENT_RECOVERY_SEED,
  PLAYBOOK_RECORD_SEED,
  RECOVERY_OPERATION_SEED,
  RECOVERY_TEST_SEED,
  RESTORE_HISTORY_SEED
} from "../data/recoveryCenterSeed";
import type { PlaybookRecord, RestoreHistoryRecord } from "../types/recoveryCenter";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { activatePlaybook, verifyRestoreComplete } from "./recoveryCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.recoveryCenter.v2";

type RecoveryCenterState = {
  backups: typeof BACKUP_RECORD_SEED;
  operations: typeof RECOVERY_OPERATION_SEED;
  playbooks: typeof PLAYBOOK_RECORD_SEED;
  restoreHistory: typeof RESTORE_HISTORY_SEED;
  recoveryTests: typeof RECOVERY_TEST_SEED;
  criticalSystems: typeof CRITICAL_SYSTEM_SEED;
  dependencies: typeof DEPENDENCY_LINK_SEED;
  incidents: typeof INCIDENT_RECOVERY_SEED;
  updatedAt: string;
};

function defaultState(): RecoveryCenterState {
  return {
    backups: [...BACKUP_RECORD_SEED],
    operations: [...RECOVERY_OPERATION_SEED],
    playbooks: [...PLAYBOOK_RECORD_SEED],
    restoreHistory: [...RESTORE_HISTORY_SEED],
    recoveryTests: [...RECOVERY_TEST_SEED],
    criticalSystems: [...CRITICAL_SYSTEM_SEED],
    dependencies: [...DEPENDENCY_LINK_SEED],
    incidents: [...INCIDENT_RECOVERY_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): RecoveryCenterState {
  const stored = readJson<RecoveryCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.backups?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: RecoveryCenterState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logRecoveryAudit(action: RecoveryCenterAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "recovery-center",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listRecoveryBackups() {
  return loadState().backups;
}

export function listRecoveryOperations() {
  return loadState().operations;
}

export function listRecoveryPlaybooks() {
  return loadState().playbooks;
}

export function listRestoreHistory() {
  return loadState().restoreHistory;
}

export function listRecoveryTests() {
  return loadState().recoveryTests;
}

export function listCriticalSystems() {
  return loadState().criticalSystems;
}

export function listRecoveryDependencies() {
  return loadState().dependencies;
}

export function listRecoveryIncidents() {
  return loadState().incidents;
}

export function verifyRecoveryRestore(restoreId: string, actor: string): RestoreHistoryRecord | null {
  const state = loadState();
  const index = state.restoreHistory.findIndex((item) => item.id === restoreId);
  if (index < 0) return null;
  state.restoreHistory[index] = verifyRestoreComplete(state.restoreHistory[index]);
  saveState(state);
  logRecoveryAudit(
    "restore-completed",
    `${state.restoreHistory[index].restoreRef} verified by ${actor}`,
    state.restoreHistory[index].restoreRef
  );
  return state.restoreHistory[index];
}

export function activateRecoveryPlaybook(playbookId: string, actor: string): PlaybookRecord | null {
  const state = loadState();
  const index = state.playbooks.findIndex((item) => item.id === playbookId);
  if (index < 0) return null;
  state.playbooks[index] = activatePlaybook(state.playbooks[index]);
  saveState(state);
  logRecoveryAudit(
    "playbook-activated",
    `${state.playbooks[index].playbookRef} by ${actor}`,
    state.playbooks[index].playbookRef
  );
  return state.playbooks[index];
}
