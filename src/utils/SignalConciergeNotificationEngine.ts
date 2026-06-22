import {
  formatNotificationId,
  isValidNotificationId,
  normalizeNotificationId,
  notificationIdYearFromDate,
  parseNotificationId
} from "../constants/notificationEvents";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  MemberNotificationBundle,
  NotificationDeliveryStatus,
  NotificationEvent,
  NotificationPreference
} from "../types/notificationEvents";
import { listConciergeMembers } from "./conciergeConsultantStore";
import {
  buildMemberNotificationBundle,
  createDefaultNotificationPreferences,
  deriveNotificationEventsFromMember,
  updateNotificationPreferences
} from "./notificationLogic";
import { readJson, writeJson } from "./storage";

type NotificationRegistryState = {
  byNotificationId: Record<string, string>;
  byRecordId: Record<string, string>;
  yearSequence: Record<number, number>;
  updatedAt: string;
};

type NotificationStore = {
  preferences: Record<string, NotificationPreference>;
  events: Record<string, NotificationEvent>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeNotificationStore;
const REGISTRY_KEY = STORAGE_KEYS.conciergeNotificationRegistry;

function loadRegistry(): NotificationRegistryState {
  return readJson<NotificationRegistryState>(REGISTRY_KEY, {
    byNotificationId: {},
    byRecordId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}

function saveRegistry(state: NotificationRegistryState): void {
  writeJson(REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function loadStore(): NotificationStore {
  return readJson<NotificationStore>(STORE_KEY, {
    preferences: {},
    events: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: NotificationStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function assignNotificationId(recordId: string, createdAt: string): string {
  const state = loadRegistry();
  const existing = state.byRecordId[recordId];
  if (existing) return existing;

  const year = notificationIdYearFromDate(createdAt);
  const nextSequence = (state.yearSequence[year] ?? 0) + 1;
  const notificationId = formatNotificationId(year, nextSequence);

  if (state.byNotificationId[notificationId]) {
    throw new Error(`Notification ID already allocated: ${notificationId}`);
  }

  saveRegistry({
    ...state,
    byNotificationId: { ...state.byNotificationId, [notificationId]: recordId },
    byRecordId: { ...state.byRecordId, [recordId]: notificationId },
    yearSequence: { ...state.yearSequence, [year]: nextSequence }
  });
  return notificationId;
}

function registerExistingNotificationId(input: {
  recordId: string;
  notificationId: string;
  createdAt: string;
}): void {
  const normalized = normalizeNotificationId(input.notificationId);
  if (!isValidNotificationId(normalized)) return;

  const state = loadRegistry();
  if (state.byNotificationId[normalized]) return;

  const parsed = parseNotificationId(normalized);
  const year = parsed ? parsed.year : notificationIdYearFromDate(input.createdAt);
  const sequence = parsed ? parsed.sequence : 1;

  saveRegistry({
    ...state,
    byNotificationId: { ...state.byNotificationId, [normalized]: input.recordId },
    byRecordId: { ...state.byRecordId, [input.recordId]: normalized },
    yearSequence: {
      ...state.yearSequence,
      [year]: Math.max(state.yearSequence[year] ?? 0, sequence)
    }
  });
}

function ensureNotificationId(recordId: string, at: string, existing?: string): string {
  if (existing && isValidNotificationId(existing)) {
    registerExistingNotificationId({ recordId, notificationId: existing, createdAt: at });
    return normalizeNotificationId(existing);
  }
  return assignNotificationId(recordId, at);
}

function syncMemberNotifications(
  member: ConciergeMemberRecord,
  store: NotificationStore
): { preferences: NotificationPreference; events: NotificationEvent[] } {
  const preferences =
    store.preferences[member.id] ??
    createDefaultNotificationPreferences(member.id, member.createdAt);

  const derived = deriveNotificationEventsFromMember(member, (recordId, at) =>
    ensureNotificationId(recordId, at, store.events[recordId]?.notificationId)
  );

  const events = derived.map((event) => {
    const existing = store.events[event.id];
    if (!existing) return event;
    return {
      ...event,
      notificationId: existing.notificationId,
      status: existing.status,
      sentAt: existing.sentAt ?? event.sentAt,
      deliveredAt: existing.deliveredAt ?? event.deliveredAt,
      failedAt: existing.failedAt,
      cancelledAt: existing.cancelledAt
    };
  });

  return { preferences, events };
}

export function syncConciergeNotificationsFromMembers(): NotificationEvent[] {
  const members = listConciergeMembers();
  const store = loadStore();
  const preferences = { ...store.preferences };
  const events = { ...store.events };

  for (const member of members) {
    const synced = syncMemberNotifications(member, store);
    preferences[member.id] = synced.preferences;
    for (const event of synced.events) {
      events[event.id] = event;
    }
  }

  saveStore({ preferences, events, updatedAt: new Date().toISOString() });
  return Object.values(events).sort((a, b) => Date.parse(b.queuedAt) - Date.parse(a.queuedAt));
}

export function ensureMemberNotificationBundle(member: ConciergeMemberRecord): MemberNotificationBundle {
  const store = loadStore();
  const synced = syncMemberNotifications(member, store);
  const events = { ...store.events };
  for (const event of synced.events) {
    events[event.id] = event;
  }
  saveStore({
    preferences: { ...store.preferences, [member.id]: synced.preferences },
    events,
    updatedAt: new Date().toISOString()
  });
  return buildMemberNotificationBundle({
    member,
    preferences: synced.preferences,
    events: synced.events
  });
}

export function getNotificationPreferences(memberId: string): NotificationPreference {
  const store = loadStore();
  return store.preferences[memberId] ?? createDefaultNotificationPreferences(memberId);
}

export function saveNotificationPreferences(
  memberId: string,
  patch: Partial<Pick<NotificationPreference, "channels" | "quietHoursEnabled" | "stewardCopyOnly">>
): NotificationPreference {
  const store = loadStore();
  const existing = store.preferences[memberId] ?? createDefaultNotificationPreferences(memberId);
  const next = updateNotificationPreferences(existing, patch);
  saveStore({
    ...store,
    preferences: { ...store.preferences, [memberId]: next },
    updatedAt: new Date().toISOString()
  });
  return next;
}

export function listNotificationsForMember(memberId: string): NotificationEvent[] {
  const store = loadStore();
  return Object.values(store.events)
    .filter((event) => event.memberId === memberId)
    .sort((a, b) => Date.parse(b.queuedAt) - Date.parse(a.queuedAt));
}

export function listAllConciergeNotificationEvents(): NotificationEvent[] {
  const store = loadStore();
  return Object.values(store.events).sort((a, b) => Date.parse(b.queuedAt) - Date.parse(a.queuedAt));
}

export function updateNotificationStatus(
  eventId: string,
  status: NotificationDeliveryStatus
): NotificationEvent | null {
  const store = loadStore();
  const existing = store.events[eventId];
  if (!existing) return null;

  const at = new Date().toISOString();
  const next: NotificationEvent = {
    ...existing,
    status,
    sentAt: status === "sent" || status === "delivered" ? existing.sentAt ?? at : existing.sentAt,
    deliveredAt: status === "delivered" ? existing.deliveredAt ?? at : existing.deliveredAt,
    failedAt: status === "failed" ? existing.failedAt ?? at : existing.failedAt,
    cancelledAt: status === "cancelled" ? existing.cancelledAt ?? at : existing.cancelledAt
  };

  saveStore({
    ...store,
    events: { ...store.events, [eventId]: next },
    updatedAt: new Date().toISOString()
  });
  return next;
}

export function resetConciergeNotificationStoreForTests(): void {
  writeJson(STORE_KEY, { preferences: {}, events: {}, updatedAt: new Date().toISOString() });
  writeJson(REGISTRY_KEY, {
    byNotificationId: {},
    byRecordId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}
