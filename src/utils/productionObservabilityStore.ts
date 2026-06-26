import { OBSERVABILITY_ERROR_SEED } from "../data/productionObservabilitySeed";
import type { ObservabilityErrorRecord, ObservabilityErrorTriageInput } from "../types/productionObservability";
import { triageObservabilityError } from "./productionObservabilityLogic";

const STORAGE_KEY = "bamsignal.productionObservability.v1";

type ObservabilityStoreState = {
  errors: ObservabilityErrorRecord[];
  updatedAt: string;
};

function readState(): ObservabilityStoreState {
  if (typeof window === "undefined") {
    return { errors: [...OBSERVABILITY_ERROR_SEED], updatedAt: new Date().toISOString() };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { errors: [...OBSERVABILITY_ERROR_SEED], updatedAt: new Date().toISOString() };
    }
    const parsed = JSON.parse(raw) as ObservabilityStoreState;
    if (!Array.isArray(parsed.errors)) {
      return { errors: [...OBSERVABILITY_ERROR_SEED], updatedAt: new Date().toISOString() };
    }
    return parsed;
  } catch {
    return { errors: [...OBSERVABILITY_ERROR_SEED], updatedAt: new Date().toISOString() };
  }
}

function writeState(state: ObservabilityStoreState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function listObservabilityErrors(): ObservabilityErrorRecord[] {
  return readState().errors;
}

export function applyObservabilityErrorTriage(input: ObservabilityErrorTriageInput): ObservabilityErrorRecord {
  const state = readState();
  const index = state.errors.findIndex((item) => item.id === input.errorId);
  if (index < 0) {
    throw new Error(`Observability error not found: ${input.errorId}`);
  }
  const updated = triageObservabilityError(
    state.errors[index],
    input.action,
    input.actor,
    input.assignee
  );
  const errors = [...state.errors];
  errors[index] = updated;
  writeState({ errors, updatedAt: new Date().toISOString() });
  return updated;
}

export function resetObservabilityErrors() {
  writeState({ errors: [...OBSERVABILITY_ERROR_SEED], updatedAt: new Date().toISOString() });
}

export function getObservabilityStorageKey() {
  return STORAGE_KEY;
}
