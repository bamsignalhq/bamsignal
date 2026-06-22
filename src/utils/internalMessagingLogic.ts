import { MESSAGE_CHANNELS } from "../constants/internalMessaging";
import { INTERNAL_MESSAGING_SEED } from "../data/internalMessagingSeed";
import type {
  InternalMessageRecord,
  InternalMessagingFilterState,
  MessageChannelSummary
} from "../types/internalMessaging";
import type { MessageChannelId, MessageTypeId } from "../constants/internalMessaging";

export function listInternalMessages(): InternalMessageRecord[] {
  return [...INTERNAL_MESSAGING_SEED];
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
      message.recipient ?? ""
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

export function emptyMessagingFilters(): InternalMessagingFilterState {
  return {
    query: "",
    channelId: "all",
    typeId: "all",
    unreadOnly: false
  };
}
