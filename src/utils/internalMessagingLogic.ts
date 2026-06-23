import { MESSAGE_CHANNELS, MESSAGING_CENTER_METRICS } from "../constants/internalMessaging";
import { INTERNAL_MESSAGING_SEED } from "../data/internalMessagingSeed";
import type {
  InternalMessageRecord,
  InternalMessagingFilterState,
  MessageChannelSummary,
  MessagingMetric
} from "../types/internalMessaging";
import type { MessageChannelId, MessageTypeId } from "../constants/internalMessaging";

function normalizeMessage(message: InternalMessageRecord): InternalMessageRecord {
  return {
    ...message,
    departmentRoute: message.departmentRoute ?? "Operations",
    readAt: message.readAt ?? null,
    readBy: message.readBy ?? null
  };
}

export function listInternalMessages(): InternalMessageRecord[] {
  return INTERNAL_MESSAGING_SEED.map(normalizeMessage);
}

export function sortMessagesByDate(messages: InternalMessageRecord[]): InternalMessageRecord[] {
  return [...messages].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function findMessageById(
  messages: InternalMessageRecord[],
  messageId: string | null
): InternalMessageRecord | null {
  if (!messageId) return null;
  return messages.find((message) => message.id === messageId) ?? null;
}

export function filterInternalMessages(
  messages: InternalMessageRecord[],
  filters: InternalMessagingFilterState
): InternalMessageRecord[] {
  const query = filters.query.trim().toLowerCase();

  return messages.filter((message) => {
    if (filters.channelId !== "all" && message.channelId !== filters.channelId) return false;
    if (filters.typeId !== "all" && message.typeId !== filters.typeId) return false;
    if (filters.unreadOnly && message.read) return false;
    if (!query) return true;

    const haystack = [
      message.messageRef,
      message.subject,
      message.body,
      message.author,
      message.recipient ?? "",
      message.departmentRoute
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function countUnread(messages: InternalMessageRecord[]): number {
  return messages.filter((message) => !message.read).length;
}

export function countUnreadByChannel(
  messages: InternalMessageRecord[],
  channelId: MessageChannelId
): number {
  return messages.filter((message) => message.channelId === channelId && !message.read).length;
}

export function buildChannelSummaries(messages: InternalMessageRecord[]): MessageChannelSummary[] {
  return MESSAGE_CHANNELS.map((channel) => ({
    channelId: channel.id,
    hint: channel.hint,
    messageCount: messages.filter((message) => message.channelId === channel.id).length,
    unreadCount: countUnreadByChannel(messages, channel.id)
  }));
}

export function messagesByType(
  messages: InternalMessageRecord[],
  typeId: MessageTypeId
): InternalMessageRecord[] {
  return messages.filter((message) => message.typeId === typeId);
}

export function countEscalations(messages: InternalMessageRecord[]): number {
  return messages.filter((message) => message.typeId === "escalation" || message.typeId === "alert").length;
}

export function countAnnouncements(messages: InternalMessageRecord[]): number {
  return messages.filter((message) => message.typeId === "announcement").length;
}

export function buildMessagingMetrics(messages: InternalMessageRecord[]): MessagingMetric[] {
  const values: Record<string, string> = {
    messages: String(messages.length),
    unread: String(countUnread(messages)),
    escalations: String(countEscalations(messages)),
    announcements: String(countAnnouncements(messages))
  };

  return MESSAGING_CENTER_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue: Number(values[metric.id]) || undefined
  }));
}

export function emptyMessagingFilters(): InternalMessagingFilterState {
  return {
    query: "",
    channelId: "all",
    typeId: "all",
    unreadOnly: false
  };
}
