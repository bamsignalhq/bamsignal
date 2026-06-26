import {
  SECURITY_OPS_ACTION_SEED,
  SECURITY_OPS_EVENT_SEED,
  SECURITY_OPS_INCIDENT_SEED,
  SECURITY_OPS_SCORE_SEED
} from "../data/securityOperationsCenterSeed";
import type { SecurityOpsToolId } from "../constants/securityOperationsCenter";
import type { SecurityOpsActionRecord } from "../types/securityOperationsCenter";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.securityOperationsCenter.v1";

type SecurityOperationsCenterState = {
  scores: typeof SECURITY_OPS_SCORE_SEED;
  events: typeof SECURITY_OPS_EVENT_SEED;
  incidents: typeof SECURITY_OPS_INCIDENT_SEED;
  recentActions: typeof SECURITY_OPS_ACTION_SEED;
  updatedAt: string;
};

function defaultState(): SecurityOperationsCenterState {
  return {
    scores: [...SECURITY_OPS_SCORE_SEED],
    events: [...SECURITY_OPS_EVENT_SEED],
    incidents: [...SECURITY_OPS_INCIDENT_SEED],
    recentActions: [...SECURITY_OPS_ACTION_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): SecurityOperationsCenterState {
  const stored = readJson<SecurityOperationsCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.scores?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: SecurityOperationsCenterState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listSecurityOpsScores() {
  return loadState().scores;
}

export function listSecurityOpsEvents() {
  return loadState().events;
}

export function listSecurityOpsIncidents() {
  return loadState().incidents;
}

export function listSecurityOpsActions() {
  return loadState().recentActions;
}

export function applySecurityOpsTool(input: {
  toolId: SecurityOpsToolId;
  target: string;
  actor: string;
}): SecurityOpsActionRecord {
  const state = loadState();
  const record: SecurityOpsActionRecord = {
    id: `soa-${Date.now()}`,
    toolId: input.toolId,
    target: input.target,
    actor: input.actor,
    executedAt: new Date().toISOString(),
    result: `${input.toolId.replace(/-/g, " ")} applied to ${input.target}`
  };
  state.recentActions = [record, ...state.recentActions].slice(0, 100);
  saveState(state);
  return record;
}
