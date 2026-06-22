import {
  formatConciergeEmailId,
  isValidConciergeEmailId,
  normalizeConciergeEmailId,
  parseConciergeEmailId,
  conciergeEmailIdYearFromDate
} from "../constants/emailTemplates";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConciergeEmailRecord,
  ConciergeEmailTemplateId,
  EmailDeliveryStatus,
  EmailTimelineEntry,
  MemberEmailBundle
} from "../types/conciergeEmail";
import {
  appendEmailTimelineEntry,
  buildMemberEmailBundle,
  latestEmailStatus
} from "./emailNotificationLogic";
import { readJson, writeJson } from "./storage";

type EmailRegistryState = {
  byEmailId: Record<string, string>;
  byRecordId: Record<string, string>;
  yearSequence: Record<number, number>;
  updatedAt: string;
};

type EmailStore = {
  records: Record<string, ConciergeEmailRecord>;
  byMemberId: Record<string, string[]>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeEmailStore;
const REGISTRY_KEY = STORAGE_KEYS.conciergeEmailRegistry;

function loadRegistry(): EmailRegistryState {
  return readJson<EmailRegistryState>(REGISTRY_KEY, {
    byEmailId: {},
    byRecordId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}

function saveRegistry(state: EmailRegistryState): void {
  writeJson(REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function loadStore(): EmailStore {
  return readJson<EmailStore>(STORE_KEY, {
    records: {},
    byMemberId: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: EmailStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function assignEmailId(recordId: string, createdAt: string): string {
  const state = loadRegistry();
  const existing = state.byRecordId[recordId];
  if (existing) return existing;

  const year = conciergeEmailIdYearFromDate(createdAt);
  const nextSequence = (state.yearSequence[year] ?? 0) + 1;
  const emailId = formatConciergeEmailId(year, nextSequence);

  if (state.byEmailId[emailId]) {
    throw new Error(`Email ID already allocated: ${emailId}`);
  }

  saveRegistry({
    ...state,
    byEmailId: { ...state.byEmailId, [emailId]: recordId },
    byRecordId: { ...state.byRecordId, [recordId]: emailId },
    yearSequence: { ...state.yearSequence, [year]: nextSequence }
  });
  return emailId;
}

function ensureEmailId(recordId: string, at: string, existing?: string): string {
  if (existing && isValidConciergeEmailId(existing)) {
    const normalized = normalizeConciergeEmailId(existing);
    const state = loadRegistry();
    if (!state.byEmailId[normalized]) {
      const parsed = parseConciergeEmailId(normalized);
      const year = parsed ? parsed.year : conciergeEmailIdYearFromDate(at);
      const sequence = parsed ? parsed.sequence : 1;
      saveRegistry({
        ...state,
        byEmailId: { ...state.byEmailId, [normalized]: recordId },
        byRecordId: { ...state.byRecordId, [recordId]: normalized },
        yearSequence: {
          ...state.yearSequence,
          [year]: Math.max(state.yearSequence[year] ?? 0, sequence)
        }
      });
    }
    return normalized;
  }
  return assignEmailId(recordId, at);
}

export function listConciergeEmailRecords(): ConciergeEmailRecord[] {
  const store = loadStore();
  return Object.values(store.records).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function listConciergeEmailsForMember(memberId: string): ConciergeEmailRecord[] {
  const store = loadStore();
  const ids = store.byMemberId[memberId] ?? [];
  return ids
    .map((id) => store.records[id])
    .filter((record): record is ConciergeEmailRecord => Boolean(record))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getConciergeEmailRecord(recordId: string): ConciergeEmailRecord | null {
  const store = loadStore();
  return store.records[recordId] ?? null;
}

export function queueConciergeEmailDraft(input: {
  memberId: string;
  memberName: string;
  memberEmail: string;
  journeyId?: string;
  templateId: ConciergeEmailTemplateId;
  subject: string;
  preview: string;
  recordId?: string;
}): ConciergeEmailRecord {
  const store = loadStore();
  const now = new Date().toISOString();
  const recordId = input.recordId ?? `email_${input.memberId}_${input.templateId}_${Date.now().toString(36)}`;
  const emailId = ensureEmailId(recordId, now);

  const existing = store.records[recordId];
  if (existing) {
    const timeline = appendEmailTimelineEntry(existing.timeline, "queued", now);
    const updated: ConciergeEmailRecord = {
      ...existing,
      subject: input.subject,
      preview: input.preview,
      timeline,
      updatedAt: now
    };
    store.records[recordId] = updated;
    saveStore(store);
    return updated;
  }

  const record: ConciergeEmailRecord = {
    id: recordId,
    emailId,
    memberId: input.memberId,
    memberName: input.memberName,
    memberEmail: input.memberEmail,
    journeyId: input.journeyId,
    templateId: input.templateId,
    subject: input.subject,
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

export function applyConciergeEmailSendResult(input: {
  recordId: string;
  timeline: EmailTimelineEntry[];
  resendId?: string;
  subject?: string;
  preview?: string;
  emailId?: string;
}): ConciergeEmailRecord | null {
  const store = loadStore();
  const existing = store.records[input.recordId];
  if (!existing) return null;

  const now = new Date().toISOString();
  const emailId = input.emailId
    ? ensureEmailId(input.recordId, existing.createdAt, input.emailId)
    : existing.emailId;

  const updated: ConciergeEmailRecord = {
    ...existing,
    emailId,
    subject: input.subject ?? existing.subject,
    preview: input.preview ?? existing.preview,
    resendId: input.resendId ?? existing.resendId,
    timeline: input.timeline.length > 0 ? input.timeline : existing.timeline,
    updatedAt: now
  };

  store.records[input.recordId] = updated;
  saveStore(store);
  return updated;
}

export function markConciergeEmailStatus(
  recordId: string,
  status: EmailDeliveryStatus,
  detail?: string
): ConciergeEmailRecord | null {
  const store = loadStore();
  const existing = store.records[recordId];
  if (!existing) return null;

  const timeline = appendEmailTimelineEntry(existing.timeline, status, new Date().toISOString(), detail);
  const updated: ConciergeEmailRecord = {
    ...existing,
    timeline,
    updatedAt: new Date().toISOString()
  };
  store.records[recordId] = updated;
  saveStore(store);
  return updated;
}

export function ensureMemberEmailBundle(member: ConciergeMemberRecord): MemberEmailBundle {
  const records = listConciergeEmailsForMember(member.id);
  return buildMemberEmailBundle({ member, records });
}

export function summarizeMemberEmailStatus(memberId: string): EmailDeliveryStatus {
  const records = listConciergeEmailsForMember(memberId);
  const latest = records[0];
  return latest ? latestEmailStatus(latest.timeline) : "queued";
}
