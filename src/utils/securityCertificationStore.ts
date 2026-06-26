import type { SecurityCertificationSnapshot } from "../types/securityCertification";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.securityCertification.v1";

type SecurityCertificationState = {
  snapshots: SecurityCertificationSnapshot[];
  updatedAt: string;
};

function defaultState(): SecurityCertificationState {
  return { snapshots: [], updatedAt: new Date().toISOString() };
}

function loadState(): SecurityCertificationState {
  const stored = readJson<SecurityCertificationState>(STORAGE_KEY, defaultState());
  return stored?.snapshots ? stored : defaultState();
}

function saveState(state: SecurityCertificationState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listSecurityCertificationSnapshots(): SecurityCertificationSnapshot[] {
  return [...loadState().snapshots].sort(
    (a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)
  );
}

export function getLatestSecurityCertificationSnapshot(): SecurityCertificationSnapshot | null {
  return listSecurityCertificationSnapshots()[0] ?? null;
}

export function importSecurityCertificationSnapshot(snapshot: SecurityCertificationSnapshot): void {
  const state = loadState();
  const next = state.snapshots.filter((item) => item.runId !== snapshot.runId);
  next.unshift(snapshot);
  saveState({ snapshots: next.slice(0, 120), updatedAt: new Date().toISOString() });
}

export function clearSecurityCertificationSnapshots(): void {
  saveState(defaultState());
}
