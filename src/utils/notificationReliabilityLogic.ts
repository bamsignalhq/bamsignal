import {
  NOTIFICATION_RELIABILITY_METRICS,
  type DeliveryStatusId,
  type NotificationQueueId
} from "../constants/notificationReliability";
import type {
  NotificationOpsRecord,
  NotificationOpsStatus
} from "../types/notificationOperations";
import type {
  NotificationReliabilityMetric,
  ReliabilityNotificationRecord
} from "../types/notificationReliability";

const OPS_STATUS_TO_DELIVERY: Record<NotificationOpsStatus, DeliveryStatusId> = {
  queued: "queued",
  sent: "sending",
  delivered: "delivered",
  read: "opened",
  failed: "failed",
  retried: "retried",
  cancelled: "abandoned"
};

const CHANNEL_TO_QUEUE: Record<NotificationOpsRecord["channel"], NotificationQueueId> = {
  email: "email-queue",
  whatsapp: "whatsapp-queue",
  system: "system-queue"
};

export function mapOpsStatusToDeliveryStatus(status: NotificationOpsStatus): DeliveryStatusId {
  return OPS_STATUS_TO_DELIVERY[status];
}

export function mapOpsRecordToReliability(record: NotificationOpsRecord): ReliabilityNotificationRecord {
  const created = new Date(record.createdAt).getTime();
  const updated = new Date(record.updatedAt).getTime();
  const deliveredStatuses: DeliveryStatusId[] = ["delivered", "opened"];
  const status = mapOpsStatusToDeliveryStatus(record.status);
  const deliveryTimeMs =
    deliveredStatuses.includes(status) && updated >= created ? updated - created : null;

  return {
    id: record.id,
    queue: CHANNEL_TO_QUEUE[record.channel],
    status,
    recipientName: record.memberName,
    recipientRef: record.memberId,
    journeyId: record.journeyId,
    templateLabel: record.templateLabel,
    subject: record.subject,
    preview: record.preview,
    detail: record.detail,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    retryCount: record.retryCount,
    deliveryTimeMs
  };
}

export function isActiveDeliveryStatus(status: DeliveryStatusId): boolean {
  return status === "queued" || status === "sending" || status === "retried";
}

export function isFailedDeliveryStatus(status: DeliveryStatusId): boolean {
  return status === "failed";
}

export function isRetryEligible(record: ReliabilityNotificationRecord): boolean {
  return record.status === "failed" || record.status === "retried";
}

function isToday(iso: string, now = new Date()): boolean {
  return iso.slice(0, 10) === now.toISOString().slice(0, 10);
}

export function buildNotificationReliabilityMetrics(
  records: ReliabilityNotificationRecord[]
): NotificationReliabilityMetric[] {
  const sentToday = records.filter(
    (record) =>
      isToday(record.updatedAt) &&
      ["sending", "delivered", "opened", "failed", "retried"].includes(record.status)
  ).length;
  const delivered = records.filter((record) =>
    ["delivered", "opened"].includes(record.status)
  ).length;
  const failed = records.filter((record) => record.status === "failed").length;
  const retryCount = records.reduce((sum, record) => sum + record.retryCount, 0);
  const deliveryTimes = records
    .map((record) => record.deliveryTimeMs)
    .filter((value): value is number => value !== null);
  const averageDeliveryTimeMs =
    deliveryTimes.length > 0
      ? Math.round(deliveryTimes.reduce((sum, value) => sum + value, 0) / deliveryTimes.length)
      : 0;

  const values: Record<string, string> = {
    "sent-today": String(sentToday),
    delivered: String(delivered),
    failed: String(failed),
    "retry-count": String(retryCount),
    "average-delivery-time": averageDeliveryTimeMs ? `${averageDeliveryTimeMs} ms` : "—"
  };

  return NOTIFICATION_RELIABILITY_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue: Number(values[metric.id]?.replace(/[^\d.]/g, "") || 0)
  }));
}

export function sortReliabilityRecords(
  records: ReliabilityNotificationRecord[]
): ReliabilityNotificationRecord[] {
  return [...records].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

export function filterReliabilityByQueue(
  records: ReliabilityNotificationRecord[],
  queue: NotificationQueueId | "all"
): ReliabilityNotificationRecord[] {
  if (queue === "all") return records;
  return records.filter((record) => record.queue === queue);
}
