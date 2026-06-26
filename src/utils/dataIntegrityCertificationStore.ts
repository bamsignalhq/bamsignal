import type { DataIntegrityCertificationSnapshot } from "../types/dataIntegrityCertification";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.dataIntegrityCertification.v1";

type DataIntegrityCertificationState = {
  snapshots: DataIntegrityCertificationSnapshot[];
  updatedAt: string;
};

function defaultState(): DataIntegrityCertificationState {
  return { snapshots: [], updatedAt: new Date().toISOString() };
}

function loadState(): DataIntegrityCertificationState {
  const stored = readJson<DataIntegrityCertificationState>(STORAGE_KEY, defaultState());
  return stored?.snapshots ? stored : defaultState();
}

function saveState(state: DataIntegrityCertificationState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listDataIntegrityCertificationSnapshots(): DataIntegrityCertificationSnapshot[] {
  return [...loadState().snapshots].sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
}

export function getLatestDataIntegrityCertificationSnapshot(): DataIntegrityCertificationSnapshot | null {
  return listDataIntegrityCertificationSnapshots()[0] ?? null;
}

export function importDataIntegrityCertificationSnapshot(snapshot: DataIntegrityCertificationSnapshot): void {
  const state = loadState();
  const next = state.snapshots.filter((item) => item.runId !== snapshot.runId);
  next.unshift(snapshot);
  saveState({ snapshots: next.slice(0, 120), updatedAt: new Date().toISOString() });
}

export function clearDataIntegrityCertificationSnapshots(): void {
  saveState(defaultState());
}
