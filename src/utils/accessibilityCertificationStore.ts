import type { AccessibilityCertificationSnapshot } from "../types/accessibilityCertification";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.accessibilityCertification.v1";

type AccessibilityCertificationState = {
  snapshots: AccessibilityCertificationSnapshot[];
  updatedAt: string;
};

function defaultState(): AccessibilityCertificationState {
  return { snapshots: [], updatedAt: new Date().toISOString() };
}

function loadState(): AccessibilityCertificationState {
  const stored = readJson<AccessibilityCertificationState>(STORAGE_KEY, defaultState());
  return stored?.snapshots ? stored : defaultState();
}

function saveState(state: AccessibilityCertificationState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listAccessibilityCertificationSnapshots(): AccessibilityCertificationSnapshot[] {
  return [...loadState().snapshots].sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
}

export function getLatestAccessibilityCertificationSnapshot(): AccessibilityCertificationSnapshot | null {
  return listAccessibilityCertificationSnapshots()[0] ?? null;
}

export function importAccessibilityCertificationSnapshot(
  snapshot: AccessibilityCertificationSnapshot
): void {
  const state = loadState();
  const next = state.snapshots.filter((item) => item.runId !== snapshot.runId);
  next.unshift(snapshot);
  saveState({ snapshots: next.slice(0, 120), updatedAt: new Date().toISOString() });
}

export function clearAccessibilityCertificationSnapshots(): void {
  saveState(defaultState());
}
