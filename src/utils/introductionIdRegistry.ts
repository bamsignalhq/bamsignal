import { STORAGE_KEYS } from "../constants/limits";
import {
  formatIntroductionId,
  introductionIdYearFromDate,
  isValidIntroductionId,
  normalizeIntroductionId
} from "../constants/introductionId";
import { readJson, writeJson } from "./storage";

type IntroductionRegistryState = {
  byIntroductionId: Record<string, string>;
  byRecordId: Record<string, string>;
  yearSequence: Record<number, number>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeIntroductionRegistry;

function loadRegistry(): IntroductionRegistryState {
  return readJson<IntroductionRegistryState>(STORE_KEY, {
    byIntroductionId: {},
    byRecordId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}

function saveRegistry(state: IntroductionRegistryState): void {
  writeJson(STORE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function assignIntroductionId(input: {
  recordId: string;
  createdAt: string;
}): string {
  const state = loadRegistry();
  const year = introductionIdYearFromDate(input.createdAt);
  const nextSequence = (state.yearSequence[year] ?? 0) + 1;
  const introductionId = formatIntroductionId(year, nextSequence);

  if (state.byIntroductionId[introductionId]) {
    throw new Error(`Introduction ID already allocated: ${introductionId}`);
  }

  saveRegistry({
    ...state,
    byIntroductionId: { ...state.byIntroductionId, [introductionId]: input.recordId },
    byRecordId: { ...state.byRecordId, [input.recordId]: introductionId },
    yearSequence: { ...state.yearSequence, [year]: nextSequence }
  });
  return introductionId;
}

export function registerExistingIntroductionId(input: {
  recordId: string;
  introductionId: string;
  createdAt: string;
}): void {
  const normalized = normalizeIntroductionId(input.introductionId);
  if (!isValidIntroductionId(normalized)) {
    throw new Error(`Invalid introduction ID: ${input.introductionId}`);
  }
  const state = loadRegistry();
  if (state.byIntroductionId[normalized]) return;

  const parsed = normalized.match(/^BS-IN-(\d{4})-(\d{4})$/);
  const year = parsed ? Number(parsed[1]) : introductionIdYearFromDate(input.createdAt);
  const sequence = parsed ? Number(parsed[2]) : 1;

  saveRegistry({
    ...state,
    byIntroductionId: { ...state.byIntroductionId, [normalized]: input.recordId },
    byRecordId: { ...state.byRecordId, [input.recordId]: normalized },
    yearSequence: {
      ...state.yearSequence,
      [year]: Math.max(state.yearSequence[year] ?? 0, sequence)
    }
  });
}

export function getIntroductionIdForRecord(recordId: string): string | null {
  return loadRegistry().byRecordId[recordId] ?? null;
}

export function ensureIntroductionId(recordId: string, createdAt: string): string {
  const existing = getIntroductionIdForRecord(recordId);
  if (existing) return existing;
  return assignIntroductionId({ recordId, createdAt });
}
