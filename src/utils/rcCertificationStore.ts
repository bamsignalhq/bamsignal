import type { RcCertificationSnapshot } from "../types/rcCertification";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.rcCertification.v1";

type RcCertificationState = {
  snapshots: RcCertificationSnapshot[];
  updatedAt: string;
};

function defaultState(): RcCertificationState {
  return { snapshots: [], updatedAt: new Date().toISOString() };
}

function loadState(): RcCertificationState {
  const stored = readJson<RcCertificationState>(STORAGE_KEY, defaultState());
  return stored?.snapshots ? stored : defaultState();
}

function saveState(state: RcCertificationState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listRcCertificationSnapshots(): RcCertificationSnapshot[] {
  return [...loadState().snapshots].sort(
    (a, b) => Date.parse(b.certificationTimestamp) - Date.parse(a.certificationTimestamp)
  );
}

export function getLatestRcCertificationSnapshot(): RcCertificationSnapshot | null {
  return listRcCertificationSnapshots()[0] ?? null;
}

export function importRcCertificationSnapshot(snapshot: RcCertificationSnapshot): void {
  const state = loadState();
  const next = state.snapshots.filter((item) => item.runId !== snapshot.runId);
  next.unshift(snapshot);
  saveState({ snapshots: next.slice(0, 120), updatedAt: new Date().toISOString() });
}

export function clearRcCertificationSnapshots(): void {
  saveState(defaultState());
}
