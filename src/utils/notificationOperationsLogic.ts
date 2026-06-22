import type { ConciergeEmailRecord, ConciergeEmailTemplateId, EmailTimelineEntry } from "../types/conciergeEmail";
import type { ConsultationPayment } from "../types/consultationPayment";
import type { ConciergeWhatsappRecord, WhatsappTemplateId, WhatsappTimelineEntry } from "../types/conciergeWhatsapp";
import type { NotificationEvent, NotificationEventType } from "../types/notificationEvents";
import type {
  NotificationDeliveryMetrics,
  NotificationOpsChannel,
  NotificationOpsEventType,
  NotificationOpsRecord,
  NotificationOpsStatus
} from "../types/notificationOperations";

const EMAIL_TEMPLATE_EVENT: Record<ConciergeEmailTemplateId, NotificationOpsEventType> = {
  "application-received": "application-received",
  "consultation-scheduled": "consultation-scheduled",
  "consultation-reminder": "consultation-reminder",
  "application-approved": "journey-update",
  "introduction-presented": "journey-update",
  "relationship-milestone": "relationship-milestone",
  "archive-congratulations": "journey-update"
};

const WHATSAPP_TEMPLATE_EVENT: Record<WhatsappTemplateId, NotificationOpsEventType> = {
  "consultation-reminder": "consultation-reminder",
  "meeting-starting-soon": "consultation-reminder",
  "introduction-accepted": "introduction-accepted",
  "follow-up-reminder": "journey-update",
  "milestone-congratulations": "relationship-milestone"
};

const NOTIFICATION_EVENT_TO_OPS: Partial<Record<NotificationEventType, NotificationOpsEventType>> = {
  "application-received": "application-received",
  "consultation-scheduled": "consultation-scheduled",
  "consultation-reminder": "consultation-reminder",
  "consultation-completed": "journey-update",
  "application-approved": "journey-update",
  "introduction-presented": "journey-update",
  "introduction-accepted": "introduction-accepted",
  "follow-up-reminder": "journey-update",
  "milestone-recorded": "relationship-milestone",
  "relationship-archived": "journey-update"
};

function countRetries(timeline: Array<{ detail?: string }>): number {
  return timeline.filter((entry) => entry.detail?.toLowerCase().includes("retry")).length;
}

function deriveOpsStatusFromTimeline(
  timeline: Array<{ status: string; detail?: string }>
): NotificationOpsStatus {
  if (timeline.length === 0) return "queued";

  const latest = timeline[timeline.length - 1];
  const hadRetry = timeline.some((entry) => entry.detail?.toLowerCase().includes("retry"));
  const hadFailed = timeline.some((entry) => entry.status === "failed");

  if (latest.detail?.toLowerCase().includes("read")) return "read";
  if (hadRetry && latest.status === "queued" && hadFailed) return "retried";

  switch (latest.status) {
    case "sent":
      return "sent";
    case "delivered":
      return "delivered";
    case "failed":
      return "failed";
    case "cancelled":
      return "cancelled";
    default:
      return "queued";
  }
}

function mapNotificationEventStatus(status: NotificationEvent["status"]): NotificationOpsStatus {
  if (status === "cancelled") return "cancelled";
  if (status === "failed") return "failed";
  if (status === "delivered") return "delivered";
  if (status === "sent") return "sent";
  return "queued";
}

export function emailRecordToOpsRecord(record: ConciergeEmailRecord): NotificationOpsRecord {
  const status = deriveOpsStatusFromTimeline(record.timeline);
  const latest = record.timeline[record.timeline.length - 1];

  return {
    id: record.id,
    channel: "email",
    eventType: EMAIL_TEMPLATE_EVENT[record.templateId],
    memberId: record.memberId,
    memberName: record.memberName,
    journeyId: record.journeyId,
    templateLabel: record.templateId,
    subject: record.subject,
    status,
    preview: record.preview,
    detail: latest?.detail,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    retryCount: countRetries(record.timeline)
  };
}

export function whatsappRecordToOpsRecord(record: ConciergeWhatsappRecord): NotificationOpsRecord {
  const status = deriveOpsStatusFromTimeline(record.timeline);
  const latest = record.timeline[record.timeline.length - 1];

  return {
    id: record.id,
    channel: "whatsapp",
    eventType: WHATSAPP_TEMPLATE_EVENT[record.templateId],
    memberId: record.memberId,
    memberName: record.memberName,
    journeyId: record.journeyId,
    templateLabel: record.templateId,
    status,
    preview: record.preview,
    detail: latest?.detail,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    retryCount: countRetries(record.timeline)
  };
}

export function systemNotificationEventToOpsRecord(event: NotificationEvent): NotificationOpsRecord {
  return {
    id: event.id,
    channel: "system",
    eventType: NOTIFICATION_EVENT_TO_OPS[event.eventType] ?? "journey-update",
    memberId: event.memberId,
    memberName: event.memberName,
    journeyId: event.journeyId,
    templateLabel: event.eventType,
    subject: event.subject,
    status: mapNotificationEventStatus(event.status),
    preview: event.preview,
    createdAt: event.queuedAt,
    updatedAt: event.deliveredAt ?? event.sentAt ?? event.failedAt ?? event.cancelledAt ?? event.queuedAt,
    retryCount: 0
  };
}

export function paymentToOpsRecord(payment: ConsultationPayment): NotificationOpsRecord | null {
  if (payment.status !== "paid") return null;

  const completedAt =
    payment.timeline.find((entry) => entry.kind === "payment-completed")?.at ?? payment.updatedAt;

  return {
    id: `payment-ops-${payment.id}`,
    channel: "system",
    eventType: "payment-received",
    memberId: payment.memberId,
    memberName: payment.memberName,
    journeyId: payment.journeyId,
    templateLabel: "payment-received",
    subject: "Payment received",
    status: "delivered",
    preview: payment.receipt?.narrative ?? `${payment.amountLabel} consultation fee confirmed.`,
    detail: payment.paystackReference,
    createdAt: payment.createdAt,
    updatedAt: completedAt,
    retryCount: 0
  };
}

export function buildNotificationDeliveryMetrics(records: NotificationOpsRecord[]): NotificationDeliveryMetrics {
  const queued = records.filter((record) => record.status === "queued" || record.status === "sent").length;
  const delivered = records.filter(
    (record) => record.status === "delivered" || record.status === "read"
  ).length;
  const failed = records.filter((record) => record.status === "failed").length;
  const retried = records.filter((record) => record.retryCount > 0 || record.status === "retried").length;
  const terminal = delivered + failed;
  const successRate = terminal > 0 ? Math.round((delivered / terminal) * 100) : 100;
  const retryRate = records.length > 0 ? Math.round((retried / records.length) * 100) : 0;

  return { queued, delivered, failed, successRate, retryRate };
}

export function filterNotificationOpsRecords(
  records: NotificationOpsRecord[],
  input: { status?: NotificationOpsStatus | "all"; journeyQuery?: string; channel?: NotificationOpsChannel | "all" }
): NotificationOpsRecord[] {
  const journeyQuery = input.journeyQuery?.trim().toLowerCase() ?? "";

  return records.filter((record) => {
    if (input.status && input.status !== "all" && record.status !== input.status) return false;
    if (input.channel && input.channel !== "all" && record.channel !== input.channel) return false;
    if (journeyQuery && !record.journeyId?.toLowerCase().includes(journeyQuery)) return false;
    return true;
  });
}

export function sortNotificationOpsRecords(records: NotificationOpsRecord[]): NotificationOpsRecord[] {
  return [...records].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function isActiveQueueStatus(status: NotificationOpsStatus): boolean {
  return status === "queued" || status === "sent" || status === "retried";
}

export function timelineIntegrityGuard(
  before: EmailTimelineEntry[] | WhatsappTimelineEntry[],
  after: EmailTimelineEntry[] | WhatsappTimelineEntry[]
): void {
  if (after.length < before.length) {
    throw new Error("Notification delivery timeline cannot shrink.");
  }
}
