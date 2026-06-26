import {
  NOTIFICATION_CENTER_METRICS,
  NOTIFICATION_QUEUE_LABELS,
  NOTIFICATION_QUEUES,
  NOTIFICATION_TEMPLATE_LABELS,
  type DeliveryStatusId,
  type NotificationChannelId,
  type NotificationQueueId,
  type NotificationTemplateId
} from "../constants/notificationReliability";
import type { NotificationOpsRecord, NotificationOpsStatus } from "../types/notificationOperations";
import type {
  EnterpriseNotificationCenterBundle,
  EnterpriseNotificationRecord,
  NotificationAuditRecord,
  NotificationCenterMetric,
  NotificationCenterSummary,
  NotificationQueueSnapshot,
  NotificationTemplateRecord
} from "../types/notificationReliability";
import { listNotificationAudit, listNotificationTemplates } from "./notificationCenterStore";
import { buildNotificationOperationsBundle } from "./notificationOperationsEngine";

const OPS_STATUS_TO_DELIVERY: Record<NotificationOpsStatus, DeliveryStatusId> = {
  queued: "queued",
  sent: "sending",
  delivered: "delivered",
  read: "read",
  failed: "failed",
  retried: "retried",
  cancelled: "cancelled"
};

const CHANNEL_TO_QUEUE: Record<NotificationOpsRecord["channel"], NotificationQueueId> = {
  email: "email-queue",
  whatsapp: "whatsapp-queue",
  system: "push-queue"
};

const OPS_CHANNEL_TO_CENTER: Record<NotificationOpsRecord["channel"], NotificationChannelId> = {
  email: "email",
  whatsapp: "whatsapp",
  system: "in-app"
};

const TEMPLATE_KEYWORDS: Record<NotificationTemplateId, string[]> = {
  otp: ["otp", "verification code", "pin"],
  welcome: ["welcome", "account is ready"],
  verification: ["verify", "verification"],
  consultation: ["consultation", "meeting"],
  signal: ["signal"],
  message: ["message", "chat"],
  payment: ["payment", "paystack", "received"],
  reminder: ["reminder", "upcoming"],
  relationship: ["milestone", "relationship", "congratulations"],
  system: ["system", "notice"]
};

export function mapOpsStatusToDeliveryStatus(status: NotificationOpsStatus): DeliveryStatusId {
  return OPS_STATUS_TO_DELIVERY[status];
}

export function mapChannelToQueue(channel: NotificationOpsRecord["channel"]): NotificationQueueId {
  return CHANNEL_TO_QUEUE[channel];
}

export function mapOpsChannelToCenterChannel(channel: NotificationOpsRecord["channel"]): NotificationChannelId {
  return OPS_CHANNEL_TO_CENTER[channel];
}

function inferTemplateId(templateLabel: string): NotificationTemplateId {
  const normalized = templateLabel.toLowerCase();
  for (const [id, keywords] of Object.entries(TEMPLATE_KEYWORDS) as [NotificationTemplateId, string[]][]) {
    if (keywords.some((keyword) => normalized.includes(keyword))) return id;
  }
  return "system";
}

export function mapOpsRecordToEnterprise(record: NotificationOpsRecord): EnterpriseNotificationRecord {
  const created = new Date(record.createdAt).getTime();
  const updated = new Date(record.updatedAt).getTime();
  const status = mapOpsStatusToDeliveryStatus(record.status);
  const deliveredStatuses: DeliveryStatusId[] = ["delivered", "read"];
  const deliveryTimeMs =
    deliveredStatuses.includes(status) && updated >= created ? updated - created : null;
  const templateId = inferTemplateId(record.templateLabel);
  const channel = mapOpsChannelToCenterChannel(record.channel);
  let queue = mapChannelToQueue(record.channel);

  if (status === "retried" || (status === "failed" && record.retryCount > 0)) {
    queue = "retry-queue";
  }
  if (status === "failed" && record.retryCount >= 3) {
    queue = "dead-letter-queue";
  }
  if (status === "queued" && record.createdAt > new Date().toISOString()) {
    queue = "scheduled-queue";
  }

  return {
    id: record.id,
    channel,
    queue,
    status,
    templateId,
    templateLabel: NOTIFICATION_TEMPLATE_LABELS[templateId] ?? record.templateLabel,
    recipientName: record.memberName,
    recipientRef: record.memberId,
    journeyId: record.journeyId,
    subject: record.subject,
    preview: record.preview,
    detail: record.detail,
    triggeredBy: "system@bamsignal.com",
    providerResponse: record.detail,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    retryCount: record.retryCount,
    deliveryTimeMs,
    opened: status === "read",
    clicked: false
  };
}

export function isActiveDeliveryStatus(status: DeliveryStatusId): boolean {
  return status === "queued" || status === "sending" || status === "retried";
}

export function isFailedDeliveryStatus(status: DeliveryStatusId): boolean {
  return status === "failed";
}

export function isRetryEligible(record: EnterpriseNotificationRecord): boolean {
  return record.status === "failed" || record.status === "retried";
}

function isToday(iso: string, now = new Date()): boolean {
  return iso.slice(0, 10) === now.toISOString().slice(0, 10);
}

export function buildNotificationCenterSummary(
  records: EnterpriseNotificationRecord[]
): NotificationCenterSummary {
  const sentToday = records.filter(
    (record) =>
      isToday(record.updatedAt) &&
      ["sending", "delivered", "read", "failed", "retried"].includes(record.status)
  ).length;
  const pending = records.filter((record) => record.status === "sending").length;
  const queued = records.filter((record) => record.status === "queued").length;
  const failed = records.filter((record) => record.status === "failed").length;
  const retryQueue = records.filter((record) => isRetryEligible(record)).length;
  const attempted = records.filter((record) =>
    ["sending", "delivered", "read", "failed", "retried"].includes(record.status)
  ).length;
  const delivered = records.filter((record) => ["delivered", "read"].includes(record.status)).length;
  const read = records.filter((record) => record.status === "read" || record.opened).length;
  const clicked = records.filter((record) => record.clicked).length;

  return {
    sentToday,
    pending,
    queued,
    failed,
    retryQueue,
    deliveryRate: attempted > 0 ? Math.round((delivered / attempted) * 100) : 0,
    openRate: delivered > 0 ? Math.round((read / delivered) * 100) : 0,
    clickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0,
    lastCheckedAt: new Date().toISOString()
  };
}

export function buildNotificationCenterMetrics(
  summary: NotificationCenterSummary
): NotificationCenterMetric[] {
  const values: Record<string, string> = {
    "sent-today": String(summary.sentToday),
    pending: String(summary.pending),
    queued: String(summary.queued),
    failed: String(summary.failed),
    "retry-queue": String(summary.retryQueue),
    "delivery-rate": summary.deliveryRate > 0 ? `${summary.deliveryRate}%` : "—",
    "open-rate": summary.openRate > 0 ? `${summary.openRate}%` : "—",
    "click-rate": summary.clickRate > 0 ? `${summary.clickRate}%` : "—"
  };

  return NOTIFICATION_CENTER_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue: Number(values[metric.id]?.replace(/[^\d.]/g, "") || 0)
  }));
}

/** @deprecated Use buildNotificationCenterMetrics */
export function buildNotificationReliabilityMetrics(
  records: EnterpriseNotificationRecord[]
): NotificationCenterMetric[] {
  return buildNotificationCenterMetrics(buildNotificationCenterSummary(records));
}

export function buildQueueSnapshots(records: EnterpriseNotificationRecord[]): NotificationQueueSnapshot[] {
  return NOTIFICATION_QUEUES.map((queue) => {
    const items = records.filter((record) => record.queue === queue.id);
    const oldest = items.length
      ? items.reduce((earliest, item) =>
          item.createdAt < earliest ? item.createdAt : earliest
        , items[0].createdAt)
      : null;
    return {
      id: queue.id,
      label: NOTIFICATION_QUEUE_LABELS[queue.id],
      count: items.length,
      oldestAt: oldest
    };
  });
}

export function sortEnterpriseRecords(
  records: EnterpriseNotificationRecord[]
): EnterpriseNotificationRecord[] {
  return [...records].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

export function filterEnterpriseByQueue(
  records: EnterpriseNotificationRecord[],
  queue: NotificationQueueId | "all"
): EnterpriseNotificationRecord[] {
  if (queue === "all") return records;
  return records.filter((record) => record.queue === queue);
}

/** @deprecated Use filterEnterpriseByQueue */
export function filterReliabilityByQueue(
  records: EnterpriseNotificationRecord[],
  queue: NotificationQueueId | "all"
): EnterpriseNotificationRecord[] {
  return filterEnterpriseByQueue(records, queue);
}

/** @deprecated Use mapOpsRecordToEnterprise */
export function mapOpsRecordToReliability(record: NotificationOpsRecord): EnterpriseNotificationRecord {
  return mapOpsRecordToEnterprise(record);
}

export function buildChannelStats(
  records: EnterpriseNotificationRecord[]
): EnterpriseNotificationCenterBundle["channels"] {
  const channelIds: NotificationChannelId[] = ["email", "whatsapp", "push", "in-app"];
  return channelIds.map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1).replace("-", " "),
    live: true,
    sentToday: records.filter(
      (record) => record.channel === id && isToday(record.updatedAt)
    ).length
  }));
}

export function mergeAuditRecords(
  live: NotificationAuditRecord[],
  seeded: NotificationAuditRecord[]
): NotificationAuditRecord[] {
  const seen = new Set<string>();
  const merged: NotificationAuditRecord[] = [];
  for (const record of [...live, ...seeded]) {
    if (seen.has(record.id)) continue;
    seen.add(record.id);
    merged.push(record);
  }
  return merged.sort(
    (left, right) => new Date(right.triggeredAt).getTime() - new Date(left.triggeredAt).getTime()
  );
}

export function buildEnterpriseNotificationCenterBundle(input?: {
  templates?: NotificationTemplateRecord[];
  audit?: NotificationAuditRecord[];
}): EnterpriseNotificationCenterBundle {
  const opsBundle = buildNotificationOperationsBundle();
  const all = sortEnterpriseRecords(opsBundle.history.map(mapOpsRecordToEnterprise));
  const summary = buildNotificationCenterSummary(all);
  const templates = input?.templates ?? listNotificationTemplates();
  const audit = mergeAuditRecords(input?.audit ?? [], listNotificationAudit());

  return {
    generatedAt: new Date().toISOString(),
    summary,
    metrics: buildNotificationCenterMetrics(summary),
    channels: buildChannelStats(all),
    queueSnapshots: buildQueueSnapshots(all),
    templates,
    messages: all.filter((record) => isActiveDeliveryStatus(record.status)),
    queue: all.filter((record) => isActiveDeliveryStatus(record.status)),
    failed: all.filter((record) => isFailedDeliveryStatus(record.status)),
    retryQueue: all.filter((record) => isRetryEligible(record)),
    deadLetter: all.filter((record) => record.queue === "dead-letter-queue"),
    scheduled: all.filter((record) => record.queue === "scheduled-queue"),
    audit,
    all
  };
}

export function countByDeliveryStatus(records: { status: DeliveryStatusId }[]) {
  return records.reduce<Record<string, number>>((counts, record) => {
    counts[record.status] = (counts[record.status] ?? 0) + 1;
    return counts;
  }, {});
}
