import { NOTIFICATION_OPERATIONS_CENTER_BRAND } from "../constants/notificationOperations";
import type { NotificationOpsRecord, NotificationOperationsBundle } from "../types/notificationOperations";
import { listConsultationPayments } from "./ConsultationPaymentEngine";
import { listConciergeEmailRecords, markConciergeEmailStatus } from "./EmailNotificationEngine";
import {
  applyWhatsappSendResult,
  listConciergeWhatsappRecords
} from "./WhatsappNotificationEngine";
import { appendWhatsappTimelineEntry } from "./whatsappNotificationLogic";
import { listAllConciergeNotificationEvents } from "./SignalConciergeNotificationEngine";
import {
  buildNotificationDeliveryMetrics,
  emailRecordToOpsRecord,
  isActiveQueueStatus,
  paymentToOpsRecord,
  sortNotificationOpsRecords,
  systemNotificationEventToOpsRecord,
  whatsappRecordToOpsRecord
} from "./notificationOperationsLogic";

export { NOTIFICATION_OPERATIONS_CENTER_BRAND };

function collectNotificationOpsRecords(): NotificationOpsRecord[] {
  const records: NotificationOpsRecord[] = [];

  for (const record of listConciergeEmailRecords()) {
    records.push(emailRecordToOpsRecord(record));
  }

  for (const record of listConciergeWhatsappRecords()) {
    records.push(whatsappRecordToOpsRecord(record));
  }

  for (const event of listAllConciergeNotificationEvents()) {
    if (event.channel === "email" || event.channel === "whatsapp") continue;
    records.push(systemNotificationEventToOpsRecord(event));
  }

  for (const payment of listConsultationPayments()) {
    const opsRecord = paymentToOpsRecord(payment);
    if (opsRecord) records.push(opsRecord);
  }

  return sortNotificationOpsRecords(records);
}

export function buildNotificationOperationsBundle(): NotificationOperationsBundle {
  const all = collectNotificationOpsRecords();

  return {
    metrics: buildNotificationDeliveryMetrics(all),
    queue: all.filter((record) => isActiveQueueStatus(record.status)),
    history: all,
    failed: all.filter((record) => record.status === "failed")
  };
}

export function retryNotificationOpsRecord(record: NotificationOpsRecord): NotificationOpsRecord | null {
  if (record.channel === "email") {
    const updated = markConciergeEmailStatus(
      record.id,
      "queued",
      "Retry queued from Notification Operations Center™"
    );
    if (!updated) return null;
    return emailRecordToOpsRecord(updated);
  }

  if (record.channel === "whatsapp") {
    const existing = listConciergeWhatsappRecords().find((item) => item.id === record.id);
    if (!existing) return null;
    const timeline = appendWhatsappTimelineEntry(
      existing.timeline,
      "queued",
      new Date().toISOString(),
      "Retry queued from Notification Operations Center™"
    );
    const updated = applyWhatsappSendResult({ recordId: record.id, timeline });
    if (!updated) return null;
    return whatsappRecordToOpsRecord(updated);
  }

  return null;
}

export function getNotificationOperationsSnapshot() {
  return buildNotificationOperationsBundle();
}
