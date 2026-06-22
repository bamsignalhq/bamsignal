import {
  consultationPaymentIdYearFromDate,
  formatConsultationPaymentId,
  isValidConsultationPaymentId,
  normalizeConsultationPaymentId,
  parseConsultationPaymentId
} from "../constants/consultationPayment";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConsultationPayment, ConsultationPaymentStatus } from "../types/consultationPayment";
import { listConciergeMembers } from "./conciergeConsultantStore";
import { ensureMemberJourneyId } from "./conciergeJourneyRegistry";
import {
  buildPaymentReceipt,
  buildPaymentSummary,
  createConsultationPaymentDraft,
  isConsultationEligibleForMember,
  withConsultationPaymentStatus
} from "./consultationPaymentLogic";
import { readJson, writeJson } from "./storage";

type ConsultationPaymentRegistryState = {
  byPaymentId: Record<string, string>;
  byRecordId: Record<string, string>;
  byMemberId: Record<string, string>;
  yearSequence: Record<number, number>;
  updatedAt: string;
};

type ConsultationPaymentStore = {
  payments: Record<string, ConsultationPayment>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeConsultationPaymentStore;
const REGISTRY_KEY = STORAGE_KEYS.conciergeConsultationPaymentRegistry;

function loadRegistry(): ConsultationPaymentRegistryState {
  return readJson<ConsultationPaymentRegistryState>(REGISTRY_KEY, {
    byPaymentId: {},
    byRecordId: {},
    byMemberId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}

function saveRegistry(state: ConsultationPaymentRegistryState): void {
  writeJson(REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function loadStore(): ConsultationPaymentStore {
  return readJson<ConsultationPaymentStore>(STORE_KEY, {
    payments: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: ConsultationPaymentStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function assignPaymentId(input: { recordId: string; memberId: string; createdAt: string }): string {
  const state = loadRegistry();
  const existing = state.byRecordId[input.recordId] ?? state.byMemberId[input.memberId];
  if (existing) return existing;

  const year = consultationPaymentIdYearFromDate(input.createdAt);
  const nextSequence = (state.yearSequence[year] ?? 0) + 1;
  const paymentId = formatConsultationPaymentId(year, nextSequence);

  if (state.byPaymentId[paymentId]) {
    throw new Error(`Consultation payment ID already allocated: ${paymentId}`);
  }

  saveRegistry({
    ...state,
    byPaymentId: { ...state.byPaymentId, [paymentId]: input.recordId },
    byRecordId: { ...state.byRecordId, [input.recordId]: paymentId },
    byMemberId: { ...state.byMemberId, [input.memberId]: paymentId },
    yearSequence: { ...state.yearSequence, [year]: nextSequence }
  });
  return paymentId;
}

function registerExistingPaymentId(input: {
  recordId: string;
  memberId: string;
  paymentId: string;
  createdAt: string;
}): void {
  const normalized = normalizeConsultationPaymentId(input.paymentId);
  if (!isValidConsultationPaymentId(normalized)) {
    throw new Error(`Invalid consultation payment ID: ${input.paymentId}`);
  }

  const state = loadRegistry();
  if (state.byPaymentId[normalized]) return;

  const parsed = parseConsultationPaymentId(normalized);
  const year = parsed ? parsed.year : consultationPaymentIdYearFromDate(input.createdAt);
  const sequence = parsed ? parsed.sequence : 1;

  saveRegistry({
    ...state,
    byPaymentId: { ...state.byPaymentId, [normalized]: input.recordId },
    byRecordId: { ...state.byRecordId, [input.recordId]: normalized },
    byMemberId: { ...state.byMemberId, [input.memberId]: normalized },
    yearSequence: {
      ...state.yearSequence,
      [year]: Math.max(state.yearSequence[year] ?? 0, sequence)
    }
  });
}

function ensurePaymentId(
  recordId: string,
  memberId: string,
  createdAt: string,
  existing?: string
): string {
  if (existing && isValidConsultationPaymentId(existing)) {
    registerExistingPaymentId({ recordId, memberId, paymentId: existing, createdAt });
    return normalizeConsultationPaymentId(existing);
  }
  return assignPaymentId({ recordId, memberId, createdAt });
}

function paymentRecordId(memberId: string): string {
  return `consultation_payment_${memberId}`;
}

function syncMemberPayment(member: ConciergeMemberRecord, store: ConsultationPaymentStore): ConsultationPayment {
  const recordId = paymentRecordId(member.id);
  const createdAt = member.createdAt;
  const paymentId = ensurePaymentId(recordId, member.id, createdAt, store.payments[recordId]?.paymentId);
  const journeyId = member.journeyId
    ? ensureMemberJourneyId(member.id, member.createdAt, member.journeyId)
    : undefined;

  const existing = store.payments[recordId];
  if (!existing) {
    const draft = createConsultationPaymentDraft({
      id: recordId,
      paymentId,
      member: { ...member, journeyId },
      createdAt
    });
    return draft;
  }

  const eligible = isConsultationEligibleForMember(member);
  let next: ConsultationPayment = {
    ...existing,
    journeyId: journeyId ?? existing.journeyId,
    memberName: member.aboutYou.name
  };

  if (eligible && next.status === "paid" && !next.consultationEligibleAt) {
    next = withConsultationPaymentStatus(next, "paid", next.paidAt ?? new Date().toISOString());
  }

  const receipt = buildPaymentReceipt(next);
  return receipt ? { ...next, receipt } : next;
}

export function syncConsultationPaymentsFromMembers(): ConsultationPayment[] {
  const members = listConciergeMembers();
  const store = loadStore();
  const payments = { ...store.payments };

  for (const member of members) {
    const recordId = paymentRecordId(member.id);
    payments[recordId] = syncMemberPayment(member, { payments, updatedAt: store.updatedAt });
  }

  saveStore({ payments, updatedAt: new Date().toISOString() });
  return Object.values(payments).sort((a, b) => a.paymentId.localeCompare(b.paymentId));
}

export function ensureConsultationPaymentForMember(member: ConciergeMemberRecord): ConsultationPayment {
  const store = loadStore();
  const recordId = paymentRecordId(member.id);
  const payment = syncMemberPayment(member, store);
  saveStore({
    payments: { ...store.payments, [recordId]: payment },
    updatedAt: new Date().toISOString()
  });
  return payment;
}

export function getConsultationPaymentForMember(memberId: string): ConsultationPayment | null {
  const store = loadStore();
  const recordId = paymentRecordId(memberId);
  return store.payments[recordId] ?? null;
}

export function listConsultationPayments(): ConsultationPayment[] {
  return syncConsultationPaymentsFromMembers();
}

export function getConsultationPaymentSummaryForMember(member: ConciergeMemberRecord) {
  const payment = ensureConsultationPaymentForMember(member);
  return buildPaymentSummary(payment);
}

export function initializeConsultationPayment(memberId: string): ConsultationPayment | null {
  const store = loadStore();
  const recordId = paymentRecordId(memberId);
  const existing = store.payments[recordId];
  if (!existing) return null;

  const next = withConsultationPaymentStatus(existing, "initialized");
  saveStore({
    payments: { ...store.payments, [recordId]: next },
    updatedAt: new Date().toISOString()
  });
  return next;
}

export function completeConsultationPayment(memberId: string): ConsultationPayment | null {
  const store = loadStore();
  const recordId = paymentRecordId(memberId);
  const existing = store.payments[recordId];
  if (!existing) return null;

  let next = withConsultationPaymentStatus(existing, "paid");
  if (!next.consultationEligibleAt) {
    next = {
      ...next,
      consultationEligibleAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    next = withConsultationPaymentStatus(next, "paid", next.paidAt);
  }

  const receipt = buildPaymentReceipt(next);
  next = receipt ? { ...next, receipt } : next;

  saveStore({
    payments: { ...store.payments, [recordId]: next },
    updatedAt: new Date().toISOString()
  });
  return next;
}

export function updateConsultationPaymentStatus(
  memberId: string,
  status: ConsultationPaymentStatus
): ConsultationPayment | null {
  const store = loadStore();
  const recordId = paymentRecordId(memberId);
  const existing = store.payments[recordId];
  if (!existing) return null;

  let next = withConsultationPaymentStatus(existing, status);
  const receipt = buildPaymentReceipt(next);
  next = receipt ? { ...next, receipt } : next;

  saveStore({
    payments: { ...store.payments, [recordId]: next },
    updatedAt: new Date().toISOString()
  });
  return next;
}

export function resetConsultationPaymentStoreForTests(): void {
  writeJson(STORE_KEY, { payments: {}, updatedAt: new Date().toISOString() });
  writeJson(REGISTRY_KEY, {
    byPaymentId: {},
    byRecordId: {},
    byMemberId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}
