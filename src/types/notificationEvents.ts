export type NotificationChannel = "email" | "whatsapp" | "sms" | "push";

export type NotificationEventType =
  | "application-received"
  | "consultation-scheduled"
  | "consultation-reminder"
  | "consultation-completed"
  | "application-approved"
  | "introduction-presented"
  | "introduction-accepted"
  | "follow-up-reminder"
  | "milestone-recorded"
  | "relationship-archived"
  | "invoice-issued"
  | "invoice-paid"
  | "consultant-assigned"
  | "status-updated"
  | "case-completed";

export type NotificationDeliveryStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "failed"
  | "cancelled";

export type NotificationTemplate = {
  eventType: NotificationEventType;
  subject: string;
  preview: string;
  dignityNote: string;
};

export type NotificationPreference = {
  memberId: string;
  channels: Record<NotificationChannel, boolean>;
  quietHoursEnabled: boolean;
  stewardCopyOnly: boolean;
  updatedAt: string;
};

export type NotificationEvent = {
  id: string;
  notificationId: string;
  memberId: string;
  journeyId?: string;
  memberName: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  subject: string;
  preview: string;
  queuedAt: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  cancelledAt?: string;
};

export type NotificationHistoryEntry = {
  id: string;
  notificationId: string;
  memberId: string;
  journeyId?: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  subject: string;
  preview: string;
  recordedAt: string;
};

/** Reserved — not implemented. */
export type NotificationProvider =
  | "resend"
  | "sendchamp"
  | "firebase"
  | "telegram";

/** Reserved — not implemented. */
export type NotificationFutureCapability = "ai-summaries";

export type NotificationFutureConfig = {
  provider?: NotificationProvider;
  capability?: NotificationFutureCapability;
  enabled?: boolean;
};

export type MemberNotificationBundle = {
  preferences: NotificationPreference;
  recent: NotificationEvent[];
  history: NotificationHistoryEntry[];
  summaryStatus: NotificationDeliveryStatus;
  narrative: string;
};
