/** Enterprise Notification Center™ — unified outbound communication control plane. */

import { NOTIFICATION_RELIABILITY_ADMIN_BRAND } from "./notificationReliabilityAdmin";

export const NOTIFICATION_RELIABILITY_BRAND = NOTIFICATION_RELIABILITY_ADMIN_BRAND;

export const NOTIFICATION_CENTER_REFRESH_INTERVAL_MS = 30_000;

export type NotificationChannelId =
  | "email"
  | "whatsapp"
  | "push"
  | "in-app"
  | "sms"
  | "telegram";

export type NotificationQueueId =
  | "email-queue"
  | "whatsapp-queue"
  | "push-queue"
  | "scheduled-queue"
  | "retry-queue"
  | "dead-letter-queue";

export type DeliveryStatusId =
  | "queued"
  | "sending"
  | "delivered"
  | "read"
  | "failed"
  | "retried"
  | "cancelled";

export type NotificationTemplateId =
  | "otp"
  | "welcome"
  | "verification"
  | "consultation"
  | "signal"
  | "message"
  | "payment"
  | "reminder"
  | "relationship"
  | "system";

export type NotificationCenterToolId =
  | "retry"
  | "cancel"
  | "preview"
  | "duplicate"
  | "send-test"
  | "bulk-send";

export type NotificationCenterMetricId =
  | "sent-today"
  | "pending"
  | "queued"
  | "failed"
  | "retry-queue"
  | "delivery-rate"
  | "open-rate"
  | "click-rate";

export const NOTIFICATION_CHANNELS: { id: NotificationChannelId; label: string; live: boolean }[] = [
  { id: "email", label: "Email", live: true },
  { id: "whatsapp", label: "WhatsApp", live: true },
  { id: "push", label: "Push", live: true },
  { id: "in-app", label: "In-App", live: true },
  { id: "sms", label: "SMS", live: false },
  { id: "telegram", label: "Telegram", live: false }
];

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannelId, string> = Object.fromEntries(
  NOTIFICATION_CHANNELS.map((item) => [item.id, item.label])
) as Record<NotificationChannelId, string>;

export const NOTIFICATION_QUEUES: { id: NotificationQueueId; label: string }[] = [
  { id: "email-queue", label: "Email Queue" },
  { id: "whatsapp-queue", label: "WhatsApp Queue" },
  { id: "push-queue", label: "Push Queue" },
  { id: "scheduled-queue", label: "Scheduled Queue" },
  { id: "retry-queue", label: "Retry Queue" },
  { id: "dead-letter-queue", label: "Dead Letter Queue" }
];

export const NOTIFICATION_QUEUE_LABELS: Record<NotificationQueueId, string> = Object.fromEntries(
  NOTIFICATION_QUEUES.map((item) => [item.id, item.label])
) as Record<NotificationQueueId, string>;

export const NOTIFICATION_TEMPLATES: { id: NotificationTemplateId; label: string }[] = [
  { id: "otp", label: "OTP" },
  { id: "welcome", label: "Welcome" },
  { id: "verification", label: "Verification" },
  { id: "consultation", label: "Consultation" },
  { id: "signal", label: "Signal" },
  { id: "message", label: "Message" },
  { id: "payment", label: "Payment" },
  { id: "reminder", label: "Reminder" },
  { id: "relationship", label: "Relationship" },
  { id: "system", label: "System" }
];

export const NOTIFICATION_TEMPLATE_LABELS: Record<NotificationTemplateId, string> = Object.fromEntries(
  NOTIFICATION_TEMPLATES.map((item) => [item.id, item.label])
) as Record<NotificationTemplateId, string>;

export const DELIVERY_STATUSES: { id: DeliveryStatusId; label: string }[] = [
  { id: "queued", label: "Queued" },
  { id: "sending", label: "Sending" },
  { id: "delivered", label: "Delivered" },
  { id: "read", label: "Read" },
  { id: "failed", label: "Failed" },
  { id: "retried", label: "Retried" },
  { id: "cancelled", label: "Cancelled" }
];

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatusId, string> = Object.fromEntries(
  DELIVERY_STATUSES.map((item) => [item.id, item.label])
) as Record<DeliveryStatusId, string>;

export const NOTIFICATION_CENTER_TOOLS: { id: NotificationCenterToolId; label: string }[] = [
  { id: "retry", label: "Retry" },
  { id: "cancel", label: "Cancel" },
  { id: "preview", label: "Preview" },
  { id: "duplicate", label: "Duplicate" },
  { id: "send-test", label: "Send Test" },
  { id: "bulk-send", label: "Bulk Send" }
];

export const NOTIFICATION_CENTER_METRICS: {
  id: NotificationCenterMetricId;
  label: string;
  hint: string;
}[] = [
  { id: "sent-today", label: "Sent Today", hint: "Outbound messages dispatched today." },
  { id: "pending", label: "Pending", hint: "Awaiting provider handoff." },
  { id: "queued", label: "Queued", hint: "Messages waiting in active queues." },
  { id: "failed", label: "Failed", hint: "Delivery failures requiring attention." },
  { id: "retry-queue", label: "Retry Queue", hint: "Messages eligible for retry." },
  { id: "delivery-rate", label: "Delivery Rate", hint: "Delivered ÷ attempted." },
  { id: "open-rate", label: "Open Rate", hint: "Read ÷ delivered (email/push)." },
  { id: "click-rate", label: "Click Rate", hint: "Clicked ÷ delivered (tracked links)." }
];

/** @deprecated Use NOTIFICATION_CENTER_METRICS */
export const NOTIFICATION_RELIABILITY_METRICS = NOTIFICATION_CENTER_METRICS;

/** Future-ready channels — documented only, not yet implemented. */
export const NOTIFICATION_RELIABILITY_FUTURE_CAPABILITIES = [
  {
    id: "sms",
    label: "SMS",
    description: "Transactional SMS delivery with carrier-level delivery receipts and retry policy."
  },
  {
    id: "telegram",
    label: "Telegram",
    description: "Bot-based concierge alerts with read receipts and template governance."
  },
  {
    id: "push-notifications",
    label: "Push notifications",
    description: "Firebase and native push delivery with open tracking and device reachability."
  }
] as const;

export const NOTIFICATION_CENTER_DB_TABLES = [
  "notification_messages",
  "notification_templates",
  "notification_audit_log",
  "notification_dead_letter"
] as const;
