import { STORAGE_KEYS } from "../constants/limits";
import {
  formatOperationId,
  isValidOperationId,
  normalizeOperationId,
  operationIdYearFromDate,
  parseOperationId
} from "../constants/operationId";
import { readJson, writeJson } from "./storage";

export type OperationRegistryEntry = {
  operationId: string;
  memberId: string;
  assignedAt: string;
};

export type OperationRegistryState = {
  entries: Record<string, OperationRegistryEntry>;
  memberIndex: Record<string, string>;
  yearCounters: Record<string, number>;
  updatedAt: string;
};

const REGISTRY_KEY = STORAGE_KEYS.conciergeOperationsRegistry;

export function createEmptyOperationRegistry(now = new Date().toISOString()): OperationRegistryState {
  return {
    entries: {},
    memberIndex: {},
    yearCounters: {},
    updatedAt: now
  };
}

function loadRegistry(): OperationRegistryState {
  return readJson<OperationRegistryState>(REGISTRY_KEY, createEmptyOperationRegistry());
}

function saveRegistry(state: OperationRegistryState): void {
  writeJson(REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function nextSequence(state: OperationRegistryState, year: number): number {
  const key = String(year);
  const current = state.yearCounters[key] ?? 0;
  const next = current + 1;
  if (next > 9999) throw new Error(`Operation ID sequence exhausted for ${year}`);
  return next;
}

function applyExistingOperationId(
  state: OperationRegistryState,
  input: { operationId: string; memberId: string; assignedAt: string }
): OperationRegistryState {
  const operationId = normalizeOperationId(input.operationId);
  if (!isValidOperationId(operationId)) throw new Error("Invalid operation ID");
  if (state.entries[operationId] && state.entries[operationId].memberId !== input.memberId) {
    throw new Error("Operation ID already assigned to another member");
  }
  if (state.memberIndex[input.memberId] && state.memberIndex[input.memberId] !== operationId) {
    throw new Error("Member already has a different operation ID");
  }

  const parsed = parseOperationId(operationId);
  if (!parsed) throw new Error("Invalid operation ID");

  const yearKey = String(parsed.year);
  const yearCounters = { ...state.yearCounters };
  if (parsed.sequence > (yearCounters[yearKey] ?? 0)) {
    yearCounters[yearKey] = parsed.sequence;
  }

  const entry: OperationRegistryEntry = {
    operationId,
    memberId: input.memberId,
    assignedAt: input.assignedAt
  };

  return {
    ...state,
    yearCounters,
    entries: { ...state.entries, [operationId]: entry },
    memberIndex: { ...state.memberIndex, [input.memberId]: operationId }
  };
}

export function registerExistingOperationId(input: {
  operationId: string;
  memberId: string;
  assignedAt: string;
}): OperationRegistryState {
  const next = applyExistingOperationId(loadRegistry(), input);
  saveRegistry(next);
  return next;
}

export function assignOperationIdForMember(input: {
  memberId: string;
  createdAt?: string;
}): { operationId: string; created: boolean } {
  let state = loadRegistry();
  const existing = state.memberIndex[input.memberId];
  if (existing) return { operationId: existing, created: false };

  const now = new Date().toISOString();
  const year = operationIdYearFromDate(input.createdAt ?? now);
  const sequence = nextSequence(state, year);
  const operationId = formatOperationId(year, sequence);

  state = applyExistingOperationId(state, {
    operationId,
    memberId: input.memberId,
    assignedAt: now
  });
  state = {
    ...state,
    yearCounters: { ...state.yearCounters, [String(year)]: sequence }
  };
  saveRegistry(state);
  return { operationId, created: true };
}

export function getOperationIdForMember(memberId: string): string | null {
  return loadRegistry().memberIndex[memberId] ?? null;
}

export function ensureMemberOperationId(
  memberId: string,
  createdAt: string,
  existing?: string
): string {
  if (existing && isValidOperationId(existing)) {
    registerExistingOperationId({ operationId: existing, memberId, assignedAt: createdAt });
    return normalizeOperationId(existing);
  }
  return assignOperationIdForMember({ memberId, createdAt }).operationId;
}

export function getMemberIdForOperation(operationId: string): string | null {
  const normalized = normalizeOperationId(operationId);
  return loadRegistry().entries[normalized]?.memberId ?? null;
}

export function listOperationRegistryEntries(): OperationRegistryEntry[] {
  const state = loadRegistry();
  return Object.values(state.entries).sort((a, b) => a.operationId.localeCompare(b.operationId));
}

export function resetOperationRegistryForTests(): void {
  writeJson(REGISTRY_KEY, createEmptyOperationRegistry());
}
