import type {
  NotificationOpsChannel,
  NotificationOpsEventType,
  NotificationOpsStatus
} from "../types/notificationOperations";

export const NOTIFICATION_OPERATIONS_CENTER_BRAND = "Notification Operations Center™";

export const NOTIFICATION_OPS_CHANNELS: { id: NotificationOpsChannel; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "system", label: "System" }
];

export const NOTIFICATION_OPS_CHANNEL_LABELS: Record<NotificationOpsChannel, string> = Object.fromEntries(
  NOTIFICATION_OPS_CHANNELS.map((channel) => [channel.id, channel.label])
) as Record<NotificationOpsChannel, string>;

export const NOTIFICATION_OPS_STATUSES: NotificationOpsStatus[] = [
  "queued",
  "sent",
  "delivered",
  "read",
  "failed",
  "retried",
  "cancelled"
];

export const NOTIFICATION_OPS_STATUS_LABELS: Record<NotificationOpsStatus, string> = {
  queued: "Queued",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Failed",
  retried: "Retried",
  cancelled: "Cancelled"
};

export const NOTIFICATION_OPS_EVENT_TYPES: { id: NotificationOpsEventType; label: string }[] = [
  { id: "application-received", label: "Application received" },
  { id: "consultation-scheduled", label: "Consultation scheduled" },
  { id: "consultation-reminder", label: "Consultation reminder" },
  { id: "payment-received", label: "Payment received" },
  { id: "introduction-accepted", label: "Introduction accepted" },
  { id: "journey-update", label: "Journey update" },
  { id: "relationship-milestone", label: "Relationship milestone" }
];

export const NOTIFICATION_OPS_EVENT_LABELS: Record<NotificationOpsEventType, string> = Object.fromEntries(
  NOTIFICATION_OPS_EVENT_TYPES.map((event) => [event.id, event.label])
) as Record<NotificationOpsEventType, string>;

export const NOTIFICATION_OPS_FILTER_ALL = "all" as const;
