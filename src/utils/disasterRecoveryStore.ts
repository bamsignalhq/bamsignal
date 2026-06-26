import {
  DISASTER_BACKUP_MONITOR_SEED,
  DISASTER_COMPARISON_SEED,
  DISASTER_OPERATION_SEED,
  DISASTER_PLAN_SEED
} from "../data/disasterRecoverySeed";
import type {
  DisasterBackupMonitorRecord,
  DisasterPlanRecord,
  DisasterRecoveryOperationRecord,
  DisasterSnapshotComparison
} from "../types/disasterRecovery";
import type { DisasterRecoveryOperationId } from "../constants/disasterRecovery";

const STORAGE_KEY = "bamsignal.disasterRecoveryCenter.v1";

type DisasterRecoveryStoreState = {
  monitors: DisasterBackupMonitorRecord[];
  operations: DisasterRecoveryOperationRecord[];
  plans: DisasterPlanRecord[];
  comparisons: DisasterSnapshotComparison[];
  updatedAt: string;
};

function readState(): DisasterRecoveryStoreState {
  if (typeof window === "undefined") {
    return {
      monitors: [...DISASTER_BACKUP_MONITOR_SEED],
      operations: [...DISASTER_OPERATION_SEED],
      plans: [...DISASTER_PLAN_SEED],
      comparisons: [...DISASTER_COMPARISON_SEED],
      updatedAt: new Date().toISOString()
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        monitors: [...DISASTER_BACKUP_MONITOR_SEED],
        operations: [...DISASTER_OPERATION_SEED],
        plans: [...DISASTER_PLAN_SEED],
        comparisons: [...DISASTER_COMPARISON_SEED],
        updatedAt: new Date().toISOString()
      };
    }
    const parsed = JSON.parse(raw) as DisasterRecoveryStoreState;
    return {
      monitors: Array.isArray(parsed.monitors) ? parsed.monitors : [...DISASTER_BACKUP_MONITOR_SEED],
      operations: Array.isArray(parsed.operations) ? parsed.operations : [...DISASTER_OPERATION_SEED],
      plans: Array.isArray(parsed.plans) ? parsed.plans : [...DISASTER_PLAN_SEED],
      comparisons: Array.isArray(parsed.comparisons)
        ? parsed.comparisons
        : [...DISASTER_COMPARISON_SEED],
      updatedAt: parsed.updatedAt ?? new Date().toISOString()
    };
  } catch {
    return {
      monitors: [...DISASTER_BACKUP_MONITOR_SEED],
      operations: [...DISASTER_OPERATION_SEED],
      plans: [...DISASTER_PLAN_SEED],
      comparisons: [...DISASTER_COMPARISON_SEED],
      updatedAt: new Date().toISOString()
    };
  }
}

function writeState(state: DisasterRecoveryStoreState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function listDisasterBackupMonitors(): DisasterBackupMonitorRecord[] {
  return readState().monitors;
}

export function listDisasterOperations(): DisasterRecoveryOperationRecord[] {
  return readState().operations;
}

export function listDisasterPlans(): DisasterPlanRecord[] {
  return readState().plans;
}

export function listDisasterComparisons(): DisasterSnapshotComparison[] {
  return readState().comparisons;
}

export function applyDisasterRecoveryOperation(input: {
  operationId: DisasterRecoveryOperationId;
  target: string;
  actor: string;
  detail?: string;
}): DisasterRecoveryOperationRecord {
  const state = readState();
  const record: DisasterRecoveryOperationRecord = {
    id: `dro-${Date.now()}`,
    operationId: input.operationId,
    label: input.operationId.replace(/-/g, " "),
    target: input.target,
    status: "completed",
    initiatedBy: input.actor,
    initiatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    detail: input.detail ?? `${input.operationId} completed on ${input.target}`
  };
  state.operations = [record, ...state.operations].slice(0, 100);

  if (input.operationId === "run-backup") {
    const monitorId = input.target as DisasterBackupMonitorRecord["id"];
    state.monitors = state.monitors.map((monitor) =>
      monitor.id === monitorId
        ? {
            ...monitor,
            status: "healthy",
            lastBackupAt: new Date().toISOString(),
            lastVerifiedAt: new Date().toISOString()
          }
        : monitor
    );
  }

  state.updatedAt = new Date().toISOString();
  writeState(state);
  return record;
}
