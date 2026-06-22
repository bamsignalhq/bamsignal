import { STORAGE_KEYS } from "../constants/limits";
import {
  formatJourneyId,
  isValidJourneyId,
  journeyIdYearFromDate,
  normalizeJourneyId,
  parseJourneyId
} from "../constants/journeyId";
import { readJson, writeJson } from "./storage";

export type JourneyRegistryEntry = {
  journeyId: string;
  memberId: string;
  assignedAt: string;
};

export type JourneyRegistryState = {
  entries: Record<string, JourneyRegistryEntry>;
  memberIndex: Record<string, string>;
  yearCounters: Record<string, number>;
  updatedAt: string;
};

const REGISTRY_KEY = STORAGE_KEYS.conciergeJourneyRegistry;

export function createEmptyJourneyRegistry(now = new Date().toISOString()): JourneyRegistryState {
  return {
    entries: {},
    memberIndex: {},
    yearCounters: {},
    updatedAt: now
  };
}

function loadRegistry(): JourneyRegistryState {
  return readJson<JourneyRegistryState>(REGISTRY_KEY, createEmptyJourneyRegistry());
}

function saveRegistry(state: JourneyRegistryState): void {
  writeJson(REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function nextSequence(state: JourneyRegistryState, year: number): number {
  const key = String(year);
  const current = state.yearCounters[key] ?? 0;
  const next = current + 1;
  if (next > 9999) throw new Error(`Journey ID sequence exhausted for ${year}`);
  return next;
}

function applyExistingJourneyId(
  state: JourneyRegistryState,
  input: { journeyId: string; memberId: string; assignedAt: string }
): JourneyRegistryState {
  const journeyId = normalizeJourneyId(input.journeyId);
  if (!isValidJourneyId(journeyId)) throw new Error("Invalid journey ID");
  if (state.entries[journeyId] && state.entries[journeyId].memberId !== input.memberId) {
    throw new Error("Journey ID already assigned to another member");
  }
  if (state.memberIndex[input.memberId] && state.memberIndex[input.memberId] !== journeyId) {
    throw new Error("Member already has a different journey ID");
  }

  const parsed = parseJourneyId(journeyId);
  if (!parsed) throw new Error("Invalid journey ID");

  const yearKey = String(parsed.year);
  const yearCounters = { ...state.yearCounters };
  if (parsed.sequence > (yearCounters[yearKey] ?? 0)) {
    yearCounters[yearKey] = parsed.sequence;
  }

  const entry: JourneyRegistryEntry = {
    journeyId,
    memberId: input.memberId,
    assignedAt: input.assignedAt
  };

  return {
    ...state,
    yearCounters,
    entries: { ...state.entries, [journeyId]: entry },
    memberIndex: { ...state.memberIndex, [input.memberId]: journeyId }
  };
}

export function registerExistingJourneyId(input: {
  journeyId: string;
  memberId: string;
  assignedAt: string;
}): JourneyRegistryState {
  const next = applyExistingJourneyId(loadRegistry(), input);
  saveRegistry(next);
  return next;
}

export function assignJourneyIdForMember(input: {
  memberId: string;
  createdAt?: string;
}): { journeyId: string; created: boolean } {
  let state = loadRegistry();
  const existing = state.memberIndex[input.memberId];
  if (existing) return { journeyId: existing, created: false };

  const now = new Date().toISOString();
  const year = journeyIdYearFromDate(input.createdAt ?? now);
  const sequence = nextSequence(state, year);
  const journeyId = formatJourneyId(year, sequence);

  state = applyExistingJourneyId(state, {
    journeyId,
    memberId: input.memberId,
    assignedAt: now
  });
  state = {
    ...state,
    yearCounters: { ...state.yearCounters, [String(year)]: sequence }
  };
  saveRegistry(state);
  return { journeyId, created: true };
}

export function getJourneyIdForMember(memberId: string): string | null {
  return loadRegistry().memberIndex[memberId] ?? null;
}

export function ensureMemberJourneyId(memberId: string, createdAt: string, existing?: string): string {
  if (existing && isValidJourneyId(existing)) {
    registerExistingJourneyId({ journeyId: existing, memberId, assignedAt: createdAt });
    return normalizeJourneyId(existing);
  }
  return assignJourneyIdForMember({ memberId, createdAt }).journeyId;
}

export function bootstrapJourneyRegistry(
  seeds: { memberId: string; journeyId: string; assignedAt: string }[]
): void {
  const state = loadRegistry();
  if (Object.keys(state.memberIndex).length) return;
  let next = state;
  for (const seed of seeds) {
    next = applyExistingJourneyId(next, seed);
  }
  saveRegistry(next);
}

export function resetJourneyRegistryForTests(): void {
  writeJson(REGISTRY_KEY, createEmptyJourneyRegistry());
}

export function listJourneyRegistryEntries(): JourneyRegistryEntry[] {
  const state = loadRegistry();
  return Object.values(state.entries).sort((a, b) => a.journeyId.localeCompare(b.journeyId));
}

export function getMemberIdForJourney(journeyId: string): string | null {
  const normalized = normalizeJourneyId(journeyId);
  return loadRegistry().entries[normalized]?.memberId ?? null;
}
