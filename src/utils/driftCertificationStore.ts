import type { DriftCertificationSnapshot } from "../types/driftCertification";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.driftCertification.v1";

type DriftCertificationState = {
  snapshots: DriftCertificationSnapshot[];
  updatedAt: string;
};

function defaultState(): DriftCertificationState {
  return { snapshots: [], updatedAt: new Date().toISOString() };
}

function loadState(): DriftCertificationState {
  const stored = readJson<DriftCertificationState>(STORAGE_KEY, defaultState());
  return stored?.snapshots ? stored : defaultState();
}

function saveState(state: DriftCertificationState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listDriftCertificationSnapshots(): DriftCertificationSnapshot[] {
  return [...loadState().snapshots].sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
}

export function getLatestDriftCertificationSnapshot(): DriftCertificationSnapshot | null {
  return listDriftCertificationSnapshots()[0] ?? null;
}

export function importDriftCertificationSnapshot(snapshot: DriftCertificationSnapshot): void {
  const state = loadState();
  const next = state.snapshots.filter((item) => item.runId !== snapshot.runId);
  next.unshift(snapshot);
  saveState({ snapshots: next.slice(0, 120), updatedAt: new Date().toISOString() });
}

export function clearDriftCertificationSnapshots(): void {
  saveState(defaultState());
}
