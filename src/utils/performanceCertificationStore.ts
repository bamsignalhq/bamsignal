import type { PerformanceCertificationSnapshot } from "../types/performanceCertification";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.performanceCertification.v1";

type PerformanceCertificationState = {
  snapshots: PerformanceCertificationSnapshot[];
  updatedAt: string;
};

function defaultState(): PerformanceCertificationState {
  return { snapshots: [], updatedAt: new Date().toISOString() };
}

function loadState(): PerformanceCertificationState {
  const stored = readJson<PerformanceCertificationState>(STORAGE_KEY, defaultState());
  return stored?.snapshots ? stored : defaultState();
}

function saveState(state: PerformanceCertificationState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listPerformanceCertificationSnapshots(): PerformanceCertificationSnapshot[] {
  return [...loadState().snapshots].sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
}

export function getLatestPerformanceCertificationSnapshot(): PerformanceCertificationSnapshot | null {
  return listPerformanceCertificationSnapshots()[0] ?? null;
}

export function importPerformanceCertificationSnapshot(snapshot: PerformanceCertificationSnapshot): void {
  const state = loadState();
  const next = state.snapshots.filter((item) => item.runId !== snapshot.runId);
  next.unshift(snapshot);
  saveState({ snapshots: next.slice(0, 120), updatedAt: new Date().toISOString() });
}

export function clearPerformanceCertificationSnapshots(): void {
  saveState(defaultState());
}
