import { PLATFORM_HEALTH_INCIDENT_SEED } from "../data/platformHealthSeed";
import type { PlatformHealthIncidentRecord } from "../types/platformHealth";
import { acknowledgePlatformHealthIncident } from "./platformHealthLogic";

const STORAGE_KEY = "bamsignal.platformHealthCenter.v1";

type PlatformHealthStoreState = {
  incidents: PlatformHealthIncidentRecord[];
  updatedAt: string;
};

function readState(): PlatformHealthStoreState {
  if (typeof window === "undefined") {
    return { incidents: [...PLATFORM_HEALTH_INCIDENT_SEED], updatedAt: new Date().toISOString() };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { incidents: [...PLATFORM_HEALTH_INCIDENT_SEED], updatedAt: new Date().toISOString() };
    }
    const parsed = JSON.parse(raw) as PlatformHealthStoreState;
    if (!Array.isArray(parsed.incidents)) {
      return { incidents: [...PLATFORM_HEALTH_INCIDENT_SEED], updatedAt: new Date().toISOString() };
    }
    return parsed;
  } catch {
    return { incidents: [...PLATFORM_HEALTH_INCIDENT_SEED], updatedAt: new Date().toISOString() };
  }
}

function writeState(state: PlatformHealthStoreState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function listPlatformHealthIncidents(): PlatformHealthIncidentRecord[] {
  return readState().incidents;
}

export function applyPlatformHealthAcknowledgement(input: {
  incidentId: string;
  actor: string;
  note?: string;
}): PlatformHealthIncidentRecord {
  const state = readState();
  const index = state.incidents.findIndex((item) => item.id === input.incidentId);
  if (index < 0) {
    throw new Error(`Platform health incident not found: ${input.incidentId}`);
  }
  const updated = acknowledgePlatformHealthIncident(
    state.incidents[index],
    input.actor,
    input.note
  );
  const incidents = [...state.incidents];
  incidents[index] = updated;
  writeState({ incidents, updatedAt: new Date().toISOString() });
  return updated;
}
