import type { BackupDisasterRecoveryCenterBundle } from "../types/disasterRecovery";
import { buildBackupDisasterRecoveryCenterBundle } from "./disasterRecoveryLogic";
import { applyDisasterRecoveryOperation } from "./disasterRecoveryStore";
import type { DisasterRecoveryOperationId } from "../constants/disasterRecovery";

export function buildDisasterRecoveryBundle(): BackupDisasterRecoveryCenterBundle {
  return buildBackupDisasterRecoveryCenterBundle();
}

export async function buildLiveDisasterRecoveryBundle(): Promise<BackupDisasterRecoveryCenterBundle> {
  return buildDisasterRecoveryBundle();
}

export function runDisasterRecoveryOperation(input: {
  operationId: DisasterRecoveryOperationId;
  target: string;
  actor?: string;
  detail?: string;
}): boolean {
  applyDisasterRecoveryOperation({
    operationId: input.operationId,
    target: input.target,
    actor: input.actor ?? "ops@bamsignal.com",
    detail: input.detail
  });
  return true;
}

export { buildBackupDisasterRecoveryCenterBundle };
