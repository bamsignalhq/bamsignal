import { SAFETY_INCIDENTS_SEED } from "../data/safetyCenterSeed";
import type { SafetyCenterBundle, SafetyFilterState, SafetyIncidentRecord } from "../types/safetyCenter";
import {
  assertSafetyIncidentImmutable,
  buildSafetyMetrics,
  emptySafetyFilters,
  filterSafetyIncidents,
  findIncidentById,
  isOpenIncident,
  listSafetyIncidents,
  sortIncidentsByReportedAt
} from "./safetyCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.safetyCenter.v1";

type SafetyCenterState = {
  incidents: SafetyIncidentRecord[];
  updatedAt: string;
};

function defaultState(): SafetyCenterState {
  return {
    incidents: [...SAFETY_INCIDENTS_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): SafetyCenterState {
  const stored = readJson<SafetyCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.incidents?.length) return defaultState();
  return stored;
}

function saveState(state: SafetyCenterState): void {
  const previous = loadState().incidents;
  assertSafetyIncidentImmutable(previous, state.incidents);
  writeJson(STORAGE_KEY, state);
}

export function listSafetyCenterIncidents(): SafetyIncidentRecord[] {
  return loadState().incidents;
}

export function buildSafetyCenterBundle(
  filters: SafetyFilterState = emptySafetyFilters(),
  selectedIncidentId?: string | null
): SafetyCenterBundle {
  const allIncidents = listSafetyCenterIncidents();
  const filtered = sortIncidentsByReportedAt(filterSafetyIncidents(allIncidents, filters));
  const queue = sortIncidentsByReportedAt(
    filtered.filter((incident) => isOpenIncident(incident))
  );

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildSafetyMetrics(allIncidents),
    queue,
    selectedIncident: findIncidentById(filtered, selectedIncidentId ?? null)
  };
}

export function persistSafetyCenterState(state: SafetyCenterState): void {
  saveState(state);
}
