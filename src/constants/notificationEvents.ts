import type {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationEventType,
  NotificationProvider
} from "../types/notificationEvents";

export const SIGNAL_CONCIERGE_NOTIFICATION_ENGINE_BRAND = "Signal Concierge Notification Engine™";

export const NOTIFICATION_PRIVACY_COPY =
  "Journey communications preserve privacy and dignity — never public, never loud.";

/** Permanent Notification IDs — BS-NTF-YYYY-#### */
export const NOTIFICATION_ID_PREFIX = "BS-NTF";
export const NOTIFICATION_ID_PATTERN = /^BS-NTF-\d{4}-\d{4}$/;
export const NOTIFICATION_ID_LABEL = "Notification ID";

export const NOTIFICATION_CHANNELS: {
  id: NotificationChannel;
  label: string;
  hint: string;
}[] = [
  { id: "email", label: "Email", hint: "Private updates to verified email." },
  { id: "whatsapp", label: "WhatsApp", hint: "Gentle reminders on WhatsApp." },
  { id: "sms", label: "SMS", hint: "Brief text when needed." },
  { id: "push", label: "Push", hint: "In-app alerts when available." }
];

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = Object.fromEntries(
  NOTIFICATION_CHANNELS.map((channel) => [channel.id, channel.label])
) as Record<NotificationChannel, string>;

export const NOTIFICATION_EVENT_TYPES: {
  id: NotificationEventType;
  label: string;
}[] = [
  { id: "application-received", label: "Application Received" },
  { id: "consultation-scheduled", label: "Consultation Scheduled" },
  { id: "consultation-reminder", label: "Consultation Reminder" },
  { id: "consultation-completed", label: "Consultation Completed" },
  { id: "application-approved", label: "Application Approved" },
  { id: "introduction-presented", label: "Introduction Presented" },
  { id: "introduction-accepted", label: "Introduction Accepted" },
  { id: "follow-up-reminder", label: "Follow-Up Reminder" },
  { id: "milestone-recorded", label: "Milestone Recorded" },
  { id: "relationship-archived", label: "Relationship Archived" },
  { id: "invoice-issued", label: "Invoice Issued" },
  { id: "invoice-paid", label: "Invoice Paid" },
  { id: "consultant-assigned", label: "Consultant Assigned" },
  { id: "status-updated", label: "Status Updated" },
  { id: "case-completed", label: "Case Completed" }
];

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEventType, string> = Object.fromEntries(
  NOTIFICATION_EVENT_TYPES.map((event) => [event.id, event.label])
) as Record<NotificationEventType, string>;

export const NOTIFICATION_STATUS_ORDER: NotificationDeliveryStatus[] = [
  "queued",
  "sent",
  "delivered",
  "failed",
  "cancelled"
];

export const NOTIFICATION_STATUS_LABELS: Record<NotificationDeliveryStatus, string> = {
  queued: "Queued",
  sent: "Sent",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled"
};

export const NOTIFICATION_STATUS_HINTS: Record<NotificationDeliveryStatus, string> = {
  queued: "Awaiting dignified delivery.",
  sent: "Message handed to channel — no content exposed publicly.",
  delivered: "Member received the communication privately.",
  failed: "Delivery did not complete — steward may follow up.",
  cancelled: "Notification withdrawn before delivery."
};

export const NOTIFICATION_DEFAULT_CHANNEL_PREFERENCES: Record<NotificationChannel, boolean> = {
  email: true,
  whatsapp: true,
  sms: false,
  push: false
};

export const NOTIFICATION_FUTURE_PROVIDERS: { id: NotificationProvider; label: string }[] = [
  { id: "resend", label: "Resend" },
  { id: "sendchamp", label: "Sendchamp" },
  { id: "firebase", label: "Firebase" },
  { id: "telegram", label: "Telegram" }
];

export const NOTIFICATION_FUTURE_CAPABILITIES = [
  { id: "ai-summaries" as const, label: "AI summaries" }
];

/**
 * Future-ready architecture hooks — not implemented.
 * Wire `NotificationFutureConfig` when provider adapters are enabled.
 */
export const NOTIFICATION_FUTURE_ARCHITECTURE = {
  resend: "Email delivery for dignified journey updates.",
  sendchamp: "WhatsApp and SMS delivery with steward oversight.",
  firebase: "Push notifications for in-app concierge alerts.",
  telegram: "Optional alternate channel for diaspora members.",
  aiSummaries: "Generate human-reviewed notification previews — never auto-send."
} as const;

export function formatNotificationId(year: number, sequence: number): string {
  return `${NOTIFICATION_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidNotificationId(value: string): boolean {
  return NOTIFICATION_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeNotificationId(value: string): string {
  return value.trim().toUpperCase();
}

export function parseNotificationId(value: string): { year: number; sequence: number } | null {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-NTF-(\d{4})-(\d{4})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (sequence < 1) return null;
  return { year, sequence };
}

export function notificationIdYearFromDate(
  isoDate: string,
  fallbackYear = new Date().getFullYear()
): number {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}
