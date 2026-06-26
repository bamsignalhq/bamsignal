import type {
  DeliveryStatusId,
  NotificationCenterMetricId,
  NotificationChannelId,
  NotificationQueueId,
  NotificationTemplateId
} from "../constants/notificationReliability";

export type EnterpriseNotificationRecord = {
  id: string;
  channel: NotificationChannelId;
  queue: NotificationQueueId;
  status: DeliveryStatusId;
  templateId: NotificationTemplateId;
  templateLabel: string;
  recipientName: string;
  recipientRef: string;
  journeyId?: string;
  subject?: string;
  preview: string;
  detail?: string;
  triggeredBy: string;
  providerResponse?: string;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  retryCount: number;
  deliveryTimeMs: number | null;
  opened: boolean;
  clicked: boolean;
};

export type NotificationCenterSummary = {
  sentToday: number;
  pending: number;
  queued: number;
  failed: number;
  retryQueue: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  lastCheckedAt: string;
};

export type NotificationCenterMetric = {
  id: NotificationCenterMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type NotificationQueueSnapshot = {
  id: NotificationQueueId;
  label: string;
  count: number;
  oldestAt: string | null;
};

export type NotificationTemplateRecord = {
  id: NotificationTemplateId;
  label: string;
  channels: NotificationChannelId[];
  subject?: string;
  preview: string;
  lastUsedAt: string;
  sentCount: number;
  enabled: boolean;
};

export type NotificationAuditRecord = {
  id: string;
  triggeredBy: string;
  triggeredAt: string;
  templateId: NotificationTemplateId;
  templateLabel: string;
  channel: NotificationChannelId;
  recipient: string;
  durationMs: number;
  providerResponse: string;
  status: DeliveryStatusId;
  messageId: string;
};

/** @deprecated Use EnterpriseNotificationRecord */
export type ReliabilityNotificationRecord = EnterpriseNotificationRecord;

/** @deprecated Use NotificationCenterMetric */
export type NotificationReliabilityMetric = NotificationCenterMetric;

export type EnterpriseNotificationCenterBundle = {
  generatedAt: string;
  summary: NotificationCenterSummary;
  metrics: NotificationCenterMetric[];
  channels: { id: NotificationChannelId; label: string; live: boolean; sentToday: number }[];
  queueSnapshots: NotificationQueueSnapshot[];
  templates: NotificationTemplateRecord[];
  messages: EnterpriseNotificationRecord[];
  queue: EnterpriseNotificationRecord[];
  failed: EnterpriseNotificationRecord[];
  retryQueue: EnterpriseNotificationRecord[];
  deadLetter: EnterpriseNotificationRecord[];
  scheduled: EnterpriseNotificationRecord[];
  audit: NotificationAuditRecord[];
  all: EnterpriseNotificationRecord[];
};

/** @deprecated Use EnterpriseNotificationCenterBundle */
export type NotificationReliabilityBundle = EnterpriseNotificationCenterBundle;
