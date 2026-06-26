import type { ReliabilityCertificationSnapshot } from "../types/reliabilityCertification";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.reliabilityCertification.v1";

type ReliabilityCertificationState = {
  snapshots: ReliabilityCertificationSnapshot[];
  updatedAt: string;
};

function defaultState(): ReliabilityCertificationState {
  return { snapshots: [], updatedAt: new Date().toISOString() };
}

function loadState(): ReliabilityCertificationState {
  const stored = readJson<ReliabilityCertificationState>(STORAGE_KEY, defaultState());
  return stored?.snapshots ? stored : defaultState();
}

function saveState(state: ReliabilityCertificationState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listReliabilityCertificationSnapshots(): ReliabilityCertificationSnapshot[] {
  return [...loadState().snapshots].sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
}

export function getLatestReliabilityCertificationSnapshot(): ReliabilityCertificationSnapshot | null {
  return listReliabilityCertificationSnapshots()[0] ?? null;
}

export function importReliabilityCertificationSnapshot(snapshot: ReliabilityCertificationSnapshot): void {
  const state = loadState();
  const next = state.snapshots.filter((item) => item.runId !== snapshot.runId);
  next.unshift(snapshot);
  saveState({ snapshots: next.slice(0, 120), updatedAt: new Date().toISOString() });
}

export function clearReliabilityCertificationSnapshots(): void {
  saveState(defaultState());
}
