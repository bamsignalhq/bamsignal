import { INTERNAL_MESSAGING_SEED } from "../data/internalMessagingSeed";
import type { InternalMessagingBundle, InternalMessagingFilterState, InternalMessageRecord } from "../types/internalMessaging";
import {
  buildChannelSummaries,
  buildMessagingMetrics,
  countUnread,
  emptyMessagingFilters,
  filterInternalMessages,
  findMessageById,
  sortMessagesByDate
} from "./internalMessagingLogic";
import { readJson } from "./storage";

const STORAGE_KEY = "bamsignal.internalMessaging.v2";

type InternalMessagingState = {
  messages: InternalMessageRecord[];
  updatedAt: string;
};

function normalizeMessage(message: InternalMessageRecord): InternalMessageRecord {
  return {
    ...message,
    departmentRoute: message.departmentRoute ?? "Operations",
    readAt: message.readAt ?? null,
    readBy: message.readBy ?? null
  };
}

function defaultState(): InternalMessagingState {
  return {
    messages: INTERNAL_MESSAGING_SEED.map(normalizeMessage),
    updatedAt: new Date().toISOString()
  };
}

function loadState(): InternalMessagingState {
  const stored = readJson<InternalMessagingState>(STORAGE_KEY, defaultState());
  if (!stored?.messages?.length) return defaultState();
  return {
    ...stored,
    messages: stored.messages.map(normalizeMessage)
  };
}

export function listInternalMessagingRecords(): InternalMessageRecord[] {
  return loadState().messages;
}

export function buildInternalMessagingBundle(
  filters: InternalMessagingFilterState = emptyMessagingFilters(),
  selectedMessageId?: string | null
): InternalMessagingBundle {
  const allMessages = listInternalMessagingRecords();
  const messages = sortMessagesByDate(filterInternalMessages(allMessages, filters));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildMessagingMetrics(allMessages),
    channels: buildChannelSummaries(allMessages),
    messages,
    selectedMessage: findMessageById(messages, selectedMessageId ?? null),
    totalUnread: countUnread(allMessages)
  };
}
