import type {
  MessageChannelId,
  MessagePriorityId,
  MessageTypeId,
  MessagingMetricId
} from "../constants/internalMessaging";

export type InternalMessageRecord = {
  id: string;
  messageRef: string;
  channelId: MessageChannelId;
  typeId: MessageTypeId;
  priority: MessagePriorityId;
  subject: string;
  body: string;
  author: string;
  recipient: string | null;
  departmentRoute: string;
  createdAt: string;
  read: boolean;
  readAt: string | null;
  readBy: string | null;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
};

export type InternalMessagingFilterState = {
  query: string;
  channelId: MessageChannelId | "all";
  typeId: MessageTypeId | "all";
  unreadOnly: boolean;
};

export type MessageChannelSummary = {
  channelId: MessageChannelId;
  hint: string;
  messageCount: number;
  unreadCount: number;
};

export type MessagingMetric = {
  id: MessagingMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type InternalMessagingBundle = {
  generatedAt: string;
  metrics: MessagingMetric[];
  channels: MessageChannelSummary[];
  messages: InternalMessageRecord[];
  selectedMessage: InternalMessageRecord | null;
  totalUnread: number;
};
