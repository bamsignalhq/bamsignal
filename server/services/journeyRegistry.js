import {
  formatJourneyId,
  isValidJourneyId,
  journeyIdYearFromDate,
  normalizeJourneyId,
  parseJourneyId
} from "./journeyId.js";

export function createEmptyJourneyRegistry(now = new Date().toISOString()) {
  return {
    entries: {},
    memberIndex: {},
    yearCounters: {},
    updatedAt: now
  };
}

function nextSequence(state, year) {
  const key = String(year);
  const current = state.yearCounters[key] ?? 0;
  const next = current + 1;
  if (next > 9999) {
    throw new Error(`Journey ID sequence exhausted for ${year}`);
  }
  state.yearCounters[key] = next;
  return next;
}

export function registerExistingJourneyId(state, input) {
  const journeyId = normalizeJourneyId(input.journeyId);
  if (!isValidJourneyId(journeyId)) {
    throw new Error("Invalid journey ID");
  }
  if (state.entries[journeyId] && state.entries[journeyId].memberId !== input.memberId) {
    throw new Error("Journey ID already assigned to another member");
  }
  if (state.memberIndex[input.memberId] && state.memberIndex[input.memberId] !== journeyId) {
    throw new Error("Member already has a different journey ID");
  }

  const parsed = parseJourneyId(journeyId);
  if (!parsed) throw new Error("Invalid journey ID");

  const yearKey = String(parsed.year);
  const existingCounter = state.yearCounters[yearKey] ?? 0;
  if (parsed.sequence > existingCounter) {
    state.yearCounters[yearKey] = parsed.sequence;
  }

  const entry = {
    journeyId,
    memberId: input.memberId,
    assignedAt: input.assignedAt
  };

  return {
    ...state,
    entries: { ...state.entries, [journeyId]: entry },
    memberIndex: { ...state.memberIndex, [input.memberId]: journeyId },
    updatedAt: new Date().toISOString()
  };
}

export function assignJourneyId(state, input) {
  const existing = state.memberIndex[input.memberId];
  if (existing) {
    return { state, journeyId: existing, created: false };
  }

  const now = input.now ?? new Date().toISOString();
  const year = journeyIdYearFromDate(input.createdAt ?? now);
  const draft = { ...state };
  const sequence = nextSequence(draft, year);
  const journeyId = formatJourneyId(year, sequence);

  const next = registerExistingJourneyId(draft, {
    journeyId,
    memberId: input.memberId,
    assignedAt: now
  });

  return { state: next, journeyId, created: true };
}

export function getJourneyIdForMember(state, memberId) {
  return state.memberIndex[memberId] ?? null;
}

export function getMemberIdForJourney(state, journeyId) {
  const normalized = normalizeJourneyId(journeyId);
  return state.entries[normalized]?.memberId ?? null;
}

export function listJourneyRegistryEntries(state) {
  return Object.values(state.entries).sort((a, b) => a.journeyId.localeCompare(b.journeyId));
}
