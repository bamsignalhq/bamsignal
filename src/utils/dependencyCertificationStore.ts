import type { DependencyCertificationSnapshot } from "../types/dependencyCertification";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.dependencyCertification.v1";

type DependencyCertificationState = {
  snapshots: DependencyCertificationSnapshot[];
  updatedAt: string;
};

function defaultState(): DependencyCertificationState {
  return { snapshots: [], updatedAt: new Date().toISOString() };
}

function loadState(): DependencyCertificationState {
  const stored = readJson<DependencyCertificationState>(STORAGE_KEY, defaultState());
  return stored?.snapshots ? stored : defaultState();
}

function saveState(state: DependencyCertificationState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listDependencyCertificationSnapshots(): DependencyCertificationSnapshot[] {
  return [...loadState().snapshots].sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
}

export function getLatestDependencyCertificationSnapshot(): DependencyCertificationSnapshot | null {
  return listDependencyCertificationSnapshots()[0] ?? null;
}

export function importDependencyCertificationSnapshot(snapshot: DependencyCertificationSnapshot): void {
  const state = loadState();
  const next = state.snapshots.filter((item) => item.runId !== snapshot.runId);
  next.unshift(snapshot);
  saveState({ snapshots: next.slice(0, 120), updatedAt: new Date().toISOString() });
}

export function clearDependencyCertificationSnapshots(): void {
  saveState(defaultState());
}
