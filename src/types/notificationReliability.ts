import type {
  DeliveryStatusId,
  NotificationQueueId,
  NotificationReliabilityMetricId
} from "../constants/notificationReliability";

export type ReliabilityNotificationRecord = {
  id: string;
  queue: NotificationQueueId;
  status: DeliveryStatusId;
  recipientName: string;
  recipientRef: string;
  journeyId?: string;
  templateLabel: string;
  subject?: string;
  preview: string;
  detail?: string;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  deliveryTimeMs: number | null;
};

export type NotificationReliabilityMetric = {
  id: NotificationReliabilityMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type NotificationReliabilityBundle = {
  generatedAt: string;
  metrics: NotificationReliabilityMetric[];
  queue: ReliabilityNotificationRecord[];
  failed: ReliabilityNotificationRecord[];
  retryQueue: ReliabilityNotificationRecord[];
  all: ReliabilityNotificationRecord[];
};
