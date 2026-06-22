import { INTERNAL_MESSAGING_SEED } from "../data/internalMessagingSeed";
import type { InternalMessagingBundle, InternalMessagingFilterState } from "../types/internalMessaging";
import {
  buildChannelSummaries,
  countUnread,
  emptyMessagingFilters,
  filterInternalMessages,
  findMessageById,
  listInternalMessages,
  sortMessagesByDate
} from "./internalMessagingLogic";
import { readJson } from "./storage";

const STORAGE_KEY = "bamsignal.internalMessaging.v1";

type InternalMessagingState = {
  messages: typeof INTERNAL_MESSAGING_SEED;
  updatedAt: string;
};

function defaultState(): InternalMessagingState {
  return {
    messages: [...INTERNAL_MESSAGING_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): InternalMessagingState {
  const stored = readJson<InternalMessagingState>(STORAGE_KEY, defaultState());
  if (!stored?.messages?.length) return defaultState();
  return stored;
}

export function listInternalMessagingRecords() {
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
    channels: buildChannelSummaries(allMessages),
    messages,
    selectedMessage: findMessageById(messages, selectedMessageId ?? null),
    totalUnread: countUnread(allMessages)
  };
}
