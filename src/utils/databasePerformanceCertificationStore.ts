import type { DatabasePerfCertificationSnapshot } from "../types/databasePerformanceCertification";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.databasePerformanceCertification.v1";

type DatabasePerfCertificationState = {
  snapshots: DatabasePerfCertificationSnapshot[];
  updatedAt: string;
};

function defaultState(): DatabasePerfCertificationState {
  return { snapshots: [], updatedAt: new Date().toISOString() };
}

function loadState(): DatabasePerfCertificationState {
  const stored = readJson<DatabasePerfCertificationState>(STORAGE_KEY, defaultState());
  return stored?.snapshots ? stored : defaultState();
}

function saveState(state: DatabasePerfCertificationState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listDatabasePerformanceCertificationSnapshots(): DatabasePerfCertificationSnapshot[] {
  return [...loadState().snapshots].sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
}

export function getLatestDatabasePerformanceCertificationSnapshot(): DatabasePerfCertificationSnapshot | null {
  return listDatabasePerformanceCertificationSnapshots()[0] ?? null;
}

export function importDatabasePerformanceCertificationSnapshot(
  snapshot: DatabasePerfCertificationSnapshot
): void {
  const state = loadState();
  const next = state.snapshots.filter((item) => item.runId !== snapshot.runId);
  next.unshift(snapshot);
  saveState({ snapshots: next.slice(0, 120), updatedAt: new Date().toISOString() });
}

export function clearDatabasePerformanceCertificationSnapshots(): void {
  saveState(defaultState());
}
