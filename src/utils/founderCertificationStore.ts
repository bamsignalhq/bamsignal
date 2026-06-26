import type { FounderCertificationSnapshot } from "../types/founderCertification";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.founderCertification.v1";

type FounderCertificationState = {
  snapshots: FounderCertificationSnapshot[];
  updatedAt: string;
};

function defaultState(): FounderCertificationState {
  return { snapshots: [], updatedAt: new Date().toISOString() };
}

function loadState(): FounderCertificationState {
  const stored = readJson<FounderCertificationState>(STORAGE_KEY, defaultState());
  return stored?.snapshots ? stored : defaultState();
}

function saveState(state: FounderCertificationState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listFounderCertificationSnapshots(): FounderCertificationSnapshot[] {
  return [...loadState().snapshots].sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
}

export function getLatestFounderCertificationSnapshot(): FounderCertificationSnapshot | null {
  return listFounderCertificationSnapshots()[0] ?? null;
}

export function importFounderCertificationSnapshot(snapshot: FounderCertificationSnapshot): void {
  const state = loadState();
  const next = state.snapshots.filter((item) => item.runId !== snapshot.runId);
  next.unshift(snapshot);
  saveState({ snapshots: next.slice(0, 60), updatedAt: new Date().toISOString() });
}

export function clearFounderCertificationSnapshots(): void {
  saveState(defaultState());
}
