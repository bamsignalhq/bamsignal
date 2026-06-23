import { SAFETY_CASES_SEED } from "../data/safetyCenterSeed";
import type { SafetyCenterBundle, SafetyFilterState, SafetyCaseRecord } from "../types/safetyCenter";
import {
  assertSafetyIncidentImmutable,
  buildSafetyMetrics,
  emptySafetyFilters,
  filterEscalationQueue,
  filterSafetyCases,
  findCaseById,
  isOpenCase,
  listSafetyCases,
  sortCasesByReportedAt
} from "./safetyCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.safetyCenter.v2";

type SafetyCenterState = {
  cases: SafetyCaseRecord[];
  /** @deprecated */
  incidents?: SafetyCaseRecord[];
  updatedAt: string;
};

function normalizeCase(record: SafetyCaseRecord): SafetyCaseRecord {
  return {
    ...record,
    caseRef: record.caseRef ?? record.incidentRef ?? record.id,
    caseTypeId: record.caseTypeId ?? record.categoryId ?? "harassment",
    actionsTaken: record.actionsTaken ?? [],
    timeline: record.timeline ?? []
  };
}

function defaultState(): SafetyCenterState {
  return {
    cases: [...SAFETY_CASES_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): SafetyCenterState {
  const stored = readJson<SafetyCenterState>(STORAGE_KEY, defaultState());
  const cases = stored?.cases?.length ? stored.cases : stored?.incidents?.length ? stored.incidents : null;
  if (!cases?.length) return defaultState();
  return { cases: cases.map(normalizeCase), updatedAt: stored.updatedAt };
}

function saveState(state: SafetyCenterState): void {
  const previous = loadState().cases;
  assertSafetyIncidentImmutable(previous, state.cases);
  writeJson(STORAGE_KEY, state);
}

export function listSafetyCenterCases(): SafetyCaseRecord[] {
  return loadState().cases;
}

/** @deprecated Use listSafetyCenterCases */
export function listSafetyCenterIncidents(): SafetyCaseRecord[] {
  return listSafetyCenterCases();
}

export function buildSafetyCenterBundle(
  filters: SafetyFilterState = emptySafetyFilters(),
  selectedCaseId?: string | null
): SafetyCenterBundle {
  const allCases = listSafetyCenterCases();
  const filtered = sortCasesByReportedAt(filterSafetyCases(allCases, filters));
  const queue = sortCasesByReportedAt(filtered.filter((record) => isOpenCase(record)));
  const escalations = sortCasesByReportedAt(filterEscalationQueue(allCases));
  const selectedCase = findCaseById(filtered, selectedCaseId ?? null);

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildSafetyMetrics(allCases),
    queue,
    escalations,
    selectedCase,
    selectedIncident: selectedCase
  };
}

export function persistSafetyCenterState(state: SafetyCenterState): void {
  saveState(state);
}
