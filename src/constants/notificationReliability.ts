/** Notification Reliability Center™ — outbound communication visibility layer. */

import { NOTIFICATION_RELIABILITY_ADMIN_BRAND } from "./notificationReliabilityAdmin";

export const NOTIFICATION_RELIABILITY_BRAND = NOTIFICATION_RELIABILITY_ADMIN_BRAND;

export type NotificationQueueId = "email-queue" | "whatsapp-queue" | "system-queue";

export type DeliveryStatusId =
  | "queued"
  | "sending"
  | "delivered"
  | "opened"
  | "failed"
  | "retried"
  | "abandoned";

export type NotificationReliabilityMetricId =
  | "sent-today"
  | "delivered"
  | "failed"
  | "retry-count"
  | "average-delivery-time";

export const NOTIFICATION_QUEUES: { id: NotificationQueueId; label: string }[] = [
  { id: "email-queue", label: "Email Queue" },
  { id: "whatsapp-queue", label: "WhatsApp Queue" },
  { id: "system-queue", label: "System Queue" }
];

export const NOTIFICATION_QUEUE_LABELS: Record<NotificationQueueId, string> = Object.fromEntries(
  NOTIFICATION_QUEUES.map((item) => [item.id, item.label])
) as Record<NotificationQueueId, string>;

export const DELIVERY_STATUSES: { id: DeliveryStatusId; label: string }[] = [
  { id: "queued", label: "Queued" },
  { id: "sending", label: "Sending" },
  { id: "delivered", label: "Delivered" },
  { id: "opened", label: "Opened" },
  { id: "failed", label: "Failed" },
  { id: "retried", label: "Retried" },
  { id: "abandoned", label: "Abandoned" }
];

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatusId, string> = Object.fromEntries(
  DELIVERY_STATUSES.map((item) => [item.id, item.label])
) as Record<DeliveryStatusId, string>;

export const NOTIFICATION_RELIABILITY_METRICS: {
  id: NotificationReliabilityMetricId;
  label: string;
  hint: string;
}[] = [
  { id: "sent-today", label: "Sent today", hint: "Outbound notifications dispatched today." },
  { id: "delivered", label: "Delivered", hint: "Successfully delivered notifications." },
  { id: "failed", label: "Failed", hint: "Failed delivery attempts." },
  { id: "retry-count", label: "Retry count", hint: "Total retries across all queues." },
  {
    id: "average-delivery-time",
    label: "Average delivery time",
    hint: "Mean time from queue to delivered status."
  }
];

/** Future-ready capabilities — documented only, not yet implemented. */
export const NOTIFICATION_RELIABILITY_FUTURE_CAPABILITIES = [
  {
    id: "sms",
    label: "SMS",
    description: "Transactional SMS delivery with carrier-level delivery receipts and retry policy."
  },
  {
    id: "push-notifications",
    label: "Push notifications",
    description: "Firebase and native push delivery with open tracking and device reachability."
  },
  {
    id: "voice-calls",
    label: "Voice calls",
    description: "Outbound voice reminders and concierge call bridges with call outcome logging."
  }
] as const;
