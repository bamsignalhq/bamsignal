import type { NotificationReliabilityBundle } from "../types/notificationReliability";
import {
  buildNotificationOperationsBundle,
  retryNotificationOpsRecord
} from "./notificationOperationsEngine";
import type { NotificationOpsRecord } from "../types/notificationOperations";
import {
  buildNotificationReliabilityMetrics,
  isActiveDeliveryStatus,
  isFailedDeliveryStatus,
  isRetryEligible,
  mapOpsRecordToReliability,
  sortReliabilityRecords
} from "./notificationReliabilityLogic";

export function buildNotificationReliabilityBundle(): NotificationReliabilityBundle {
  const opsBundle = buildNotificationOperationsBundle();
  const all = sortReliabilityRecords(opsBundle.history.map(mapOpsRecordToReliability));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildNotificationReliabilityMetrics(all),
    queue: all.filter((record) => isActiveDeliveryStatus(record.status)),
    failed: all.filter((record) => isFailedDeliveryStatus(record.status)),
    retryQueue: all.filter((record) => isRetryEligible(record)),
    all
  };
}

export function retryReliabilityNotification(recordId: string): boolean {
  const opsBundle = buildNotificationOperationsBundle();
  const opsRecord = opsBundle.history.find((record) => record.id === recordId);
  if (!opsRecord) return false;
  return retryNotificationOpsRecord(opsRecord) !== null;
}

export function findOpsRecordById(recordId: string): NotificationOpsRecord | null {
  const opsBundle = buildNotificationOperationsBundle();
  return opsBundle.history.find((record) => record.id === recordId) ?? null;
}
