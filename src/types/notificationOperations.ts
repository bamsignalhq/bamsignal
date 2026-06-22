export type NotificationOpsChannel = "email" | "whatsapp" | "system";

export type NotificationOpsStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "retried"
  | "cancelled";

export type NotificationOpsEventType =
  | "application-received"
  | "consultation-scheduled"
  | "consultation-reminder"
  | "payment-received"
  | "introduction-accepted"
  | "journey-update"
  | "relationship-milestone";

export type NotificationOpsRecord = {
  id: string;
  channel: NotificationOpsChannel;
  eventType: NotificationOpsEventType;
  memberId: string;
  memberName: string;
  journeyId?: string;
  templateLabel: string;
  subject?: string;
  status: NotificationOpsStatus;
  preview: string;
  detail?: string;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
};

export type NotificationDeliveryMetrics = {
  queued: number;
  delivered: number;
  failed: number;
  successRate: number;
  retryRate: number;
};

export type NotificationOperationsBundle = {
  metrics: NotificationDeliveryMetrics;
  queue: NotificationOpsRecord[];
  history: NotificationOpsRecord[];
  failed: NotificationOpsRecord[];
};

/** Reserved — not implemented. */
export type NotificationOperationsFutureCapability =
  | "provider-webhooks"
  | "delivery-sla-alerts";

export type NotificationOperationsFutureConfig = {
  capability?: NotificationOperationsFutureCapability;
  enabled?: boolean;
};
