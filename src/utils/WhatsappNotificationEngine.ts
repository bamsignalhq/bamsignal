import {
  formatWhatsappMessageId,
  isValidWhatsappMessageId,
  normalizeWhatsappMessageId,
  parseWhatsappMessageId,
  whatsappMessageIdYearFromDate
} from "../constants/whatsappTemplates";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConciergeWhatsappRecord,
  MemberWhatsappBundle,
  WhatsappDeliveryStatus,
  WhatsappTemplateId,
  WhatsappTimelineEntry
} from "../types/conciergeWhatsapp";
import {
  appendWhatsappTimelineEntry,
  buildMemberWhatsappBundle,
  latestWhatsappStatus
} from "./whatsappNotificationLogic";
import { readJson, writeJson } from "./storage";

type WhatsappRegistryState = {
  byMessageId: Record<string, string>;
  byRecordId: Record<string, string>;
  yearSequence: Record<number, number>;
  updatedAt: string;
};

type WhatsappStore = {
  records: Record<string, ConciergeWhatsappRecord>;
  byMemberId: Record<string, string[]>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeWhatsappStore;
const REGISTRY_KEY = STORAGE_KEYS.conciergeWhatsappRegistry;

function loadRegistry(): WhatsappRegistryState {
  return readJson<WhatsappRegistryState>(REGISTRY_KEY, {
    byMessageId: {},
    byRecordId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}

function saveRegistry(state: WhatsappRegistryState): void {
  writeJson(REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function loadStore(): WhatsappStore {
  return readJson<WhatsappStore>(STORE_KEY, {
    records: {},
    byMemberId: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: WhatsappStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function assignMessageId(recordId: string, createdAt: string): string {
  const state = loadRegistry();
  const existing = state.byRecordId[recordId];
  if (existing) return existing;

  const year = whatsappMessageIdYearFromDate(createdAt);
  const nextSequence = (state.yearSequence[year] ?? 0) + 1;
  const messageId = formatWhatsappMessageId(year, nextSequence);

  if (state.byMessageId[messageId]) {
    throw new Error(`WhatsApp message ID already allocated: ${messageId}`);
  }

  saveRegistry({
    ...state,
    byMessageId: { ...state.byMessageId, [messageId]: recordId },
    byRecordId: { ...state.byRecordId, [recordId]: messageId },
    yearSequence: { ...state.yearSequence, [year]: nextSequence }
  });
  return messageId;
}

function ensureMessageId(recordId: string, at: string, existing?: string): string {
  if (existing && isValidWhatsappMessageId(existing)) {
    const normalized = normalizeWhatsappMessageId(existing);
    const state = loadRegistry();
    if (!state.byMessageId[normalized]) {
      const parsed = parseWhatsappMessageId(normalized);
      const year = parsed ? parsed.year : whatsappMessageIdYearFromDate(at);
      const sequence = parsed ? parsed.sequence : 1;
      saveRegistry({
        ...state,
        byMessageId: { ...state.byMessageId, [normalized]: recordId },
        byRecordId: { ...state.byRecordId, [recordId]: normalized },
        yearSequence: {
          ...state.yearSequence,
          [year]: Math.max(state.yearSequence[year] ?? 0, sequence)
        }
      });
    }
    return normalized;
  }
  return assignMessageId(recordId, at);
}

export function listConciergeWhatsappRecords(): ConciergeWhatsappRecord[] {
  const store = loadStore();
  return Object.values(store.records).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function listConciergeWhatsappForMember(memberId: string): ConciergeWhatsappRecord[] {
  const store = loadStore();
  const ids = store.byMemberId[memberId] ?? [];
  return ids
    .map((id) => store.records[id])
    .filter((record): record is ConciergeWhatsappRecord => Boolean(record))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function queueWhatsappNotificationDraft(input: {
  memberId: string;
  memberName: string;
  memberPhone: string;
  journeyId?: string;
  templateId: WhatsappTemplateId;
  preview: string;
  recordId?: string;
}): ConciergeWhatsappRecord {
  const store = loadStore();
  const now = new Date().toISOString();
  const recordId =
    input.recordId ?? `wa_${input.memberId}_${input.templateId}_${Date.now().toString(36)}`;
  const messageId = ensureMessageId(recordId, now);

  const existing = store.records[recordId];
  if (existing) {
    const timeline = appendWhatsappTimelineEntry(existing.timeline, "queued", now);
    const updated: ConciergeWhatsappRecord = {
      ...existing,
      preview: input.preview,
      timeline,
      updatedAt: now
    };
    store.records[recordId] = updated;
    saveStore(store);
    return updated;
  }

  const record: ConciergeWhatsappRecord = {
    id: recordId,
    messageId,
    memberId: input.memberId,
    memberName: input.memberName,
    memberPhone: input.memberPhone,
    journeyId: input.journeyId,
    templateId: input.templateId,
    preview: input.preview,
    timeline: [{ status: "queued", at: now }],
    createdAt: now,
    updatedAt: now
  };

  const memberIds = store.byMemberId[input.memberId] ?? [];
  store.records[recordId] = record;
  store.byMemberId[input.memberId] = memberIds.includes(recordId)
    ? memberIds
    : [...memberIds, recordId];
  saveStore(store);
  return record;
}

export function applyWhatsappSendResult(input: {
  recordId: string;
  timeline: WhatsappTimelineEntry[];
  sendchampReference?: string;
  preview?: string;
  messageId?: string;
}): ConciergeWhatsappRecord | null {
  const store = loadStore();
  const existing = store.records[input.recordId];
  if (!existing) return null;

  const now = new Date().toISOString();
  const messageId = input.messageId
    ? ensureMessageId(input.recordId, existing.createdAt, input.messageId)
    : existing.messageId;

  const updated: ConciergeWhatsappRecord = {
    ...existing,
    messageId,
    preview: input.preview ?? existing.preview,
    sendchampReference: input.sendchampReference ?? existing.sendchampReference,
    timeline: input.timeline.length > 0 ? input.timeline : existing.timeline,
    updatedAt: now
  };

  store.records[input.recordId] = updated;
  saveStore(store);
  return updated;
}

export function ensureMemberWhatsappBundle(member: ConciergeMemberRecord): MemberWhatsappBundle {
  const records = listConciergeWhatsappForMember(member.id);
  return buildMemberWhatsappBundle({ member, records });
}

export function summarizeMemberWhatsappStatus(memberId: string): WhatsappDeliveryStatus {
  const records = listConciergeWhatsappForMember(memberId);
  const latest = records[0];
  return latest ? latestWhatsappStatus(latest.timeline) : "queued";
}
