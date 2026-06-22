import { STORAGE_KEYS } from "../constants/limits";
import {
  formatConsultationMeetingId,
  isValidConsultationMeetingId,
  normalizeConsultationMeetingId,
  parseConsultationMeetingId,
  consultationMeetingIdYearFromDate
} from "../constants/consultationMeetingId";
import { readJson, writeJson } from "./storage";

type ConsultationMeetingRegistryState = {
  byMeetingId: Record<string, string>;
  byRecordId: Record<string, string>;
  yearSequence: Record<number, number>;
  updatedAt: string;
};

const REGISTRY_KEY = STORAGE_KEYS.conciergeConsultationMeetingRegistry;

function loadRegistry(): ConsultationMeetingRegistryState {
  return readJson<ConsultationMeetingRegistryState>(REGISTRY_KEY, {
    byMeetingId: {},
    byRecordId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}

function saveRegistry(state: ConsultationMeetingRegistryState): void {
  writeJson(REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function assignConsultationMeetingId(input: {
  recordId: string;
  createdAt: string;
}): string {
  const state = loadRegistry();
  const existing = state.byRecordId[input.recordId];
  if (existing) return existing;

  const year = consultationMeetingIdYearFromDate(input.createdAt);
  const nextSequence = (state.yearSequence[year] ?? 0) + 1;
  const meetingId = formatConsultationMeetingId(year, nextSequence);

  if (state.byMeetingId[meetingId]) {
    throw new Error(`Consultation meeting ID already allocated: ${meetingId}`);
  }

  saveRegistry({
    ...state,
    byMeetingId: { ...state.byMeetingId, [meetingId]: input.recordId },
    byRecordId: { ...state.byRecordId, [input.recordId]: meetingId },
    yearSequence: { ...state.yearSequence, [year]: nextSequence }
  });
  return meetingId;
}

export function registerExistingConsultationMeetingId(input: {
  recordId: string;
  meetingId: string;
  createdAt: string;
}): void {
  const normalized = normalizeConsultationMeetingId(input.meetingId);
  if (!isValidConsultationMeetingId(normalized)) {
    throw new Error(`Invalid consultation meeting ID: ${input.meetingId}`);
  }
  const state = loadRegistry();
  if (state.byMeetingId[normalized]) return;

  const parsed = parseConsultationMeetingId(normalized);
  const year = parsed ? parsed.year : consultationMeetingIdYearFromDate(input.createdAt);
  const sequence = parsed ? parsed.sequence : 1;

  saveRegistry({
    ...state,
    byMeetingId: { ...state.byMeetingId, [normalized]: input.recordId },
    byRecordId: { ...state.byRecordId, [input.recordId]: normalized },
    yearSequence: {
      ...state.yearSequence,
      [year]: Math.max(state.yearSequence[year] ?? 0, sequence)
    }
  });
}

export function ensureConsultationMeetingId(recordId: string, createdAt: string): string {
  const state = loadRegistry();
  const existing = state.byRecordId[recordId];
  if (existing) return existing;
  return assignConsultationMeetingId({ recordId, createdAt });
}

export function resetConsultationMeetingRegistryForTests(): void {
  writeJson(REGISTRY_KEY, {
    byMeetingId: {},
    byRecordId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}
