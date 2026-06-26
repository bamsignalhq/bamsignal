import type { EnterpriseNotificationCenterBundle } from "../types/notificationReliability";
import {
  buildEnterpriseNotificationCenterBundle,
  sortEnterpriseRecords
} from "./notificationReliabilityLogic";
import {
  buildNotificationOperationsBundle,
  retryNotificationOpsRecord
} from "./notificationOperationsEngine";
import type { NotificationOpsRecord } from "../types/notificationOperations";
import {
  isActiveDeliveryStatus,
  isFailedDeliveryStatus,
  isRetryEligible,
  mapOpsRecordToEnterprise
} from "./notificationReliabilityLogic";
import { applyNotificationCenterAction, listNotificationAudit, listNotificationTemplates } from "./notificationCenterStore";

export function buildNotificationReliabilityBundle(): EnterpriseNotificationCenterBundle {
  return buildEnterpriseNotificationCenterBundle({
    templates: listNotificationTemplates(),
    audit: listNotificationAudit()
  });
}

export async function buildLiveNotificationCenterBundle(): Promise<EnterpriseNotificationCenterBundle> {
  return buildNotificationReliabilityBundle();
}

export function retryReliabilityNotification(recordId: string, actor = "operator@bamsignal.com"): boolean {
  const opsBundle = buildNotificationOperationsBundle();
  const opsRecord = opsBundle.history.find((record) => record.id === recordId);
  if (!opsRecord) return false;
  const result = retryNotificationOpsRecord(opsRecord) !== null;
  if (result) {
    applyNotificationCenterAction({ tool: "retry", messageId: recordId, actor });
  }
  return result;
}

export function cancelReliabilityNotification(recordId: string, actor = "operator@bamsignal.com"): void {
  applyNotificationCenterAction({ tool: "cancel", messageId: recordId, actor });
}

export function previewReliabilityNotification(recordId: string, actor = "operator@bamsignal.com"): string | null {
  const bundle = buildNotificationReliabilityBundle();
  const record = bundle.all.find((item) => item.id === recordId);
  if (!record) return null;
  applyNotificationCenterAction({
    tool: "preview",
    messageId: recordId,
    actor,
    detail: record.preview
  });
  return record.preview;
}

export function duplicateReliabilityNotification(recordId: string, actor = "operator@bamsignal.com"): boolean {
  const bundle = buildNotificationReliabilityBundle();
  const record = bundle.all.find((item) => item.id === recordId);
  if (!record) return false;
  applyNotificationCenterAction({
    tool: "duplicate",
    messageId: recordId,
    actor,
    detail: `Duplicated ${record.templateLabel} for ${record.recipientName}`
  });
  return true;
}

export function sendTestReliabilityNotification(recordId: string, actor = "operator@bamsignal.com"): boolean {
  applyNotificationCenterAction({
    tool: "send-test",
    messageId: recordId,
    actor,
    detail: "Test send queued to operator inbox"
  });
  return true;
}

export function findOpsRecordById(recordId: string): NotificationOpsRecord | null {
  const opsBundle = buildNotificationOperationsBundle();
  return opsBundle.history.find((record) => record.id === recordId) ?? null;
}

export { buildEnterpriseNotificationCenterBundle };
