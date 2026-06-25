import {
  BACKUP_JOB_SEED,
  CONTINUITY_EXERCISE_SEED,
  INCIDENT_REPORT_SEED,
  PROVIDER_STATUS_SEED,
  RECOVERY_PLAN_SEED,
  SYSTEM_HEALTH_SNAPSHOT_SEED
} from "../data/businessContinuitySeed";
import type { BusinessContinuityAuditActionId } from "../constants/businessContinuity";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.businessContinuity.v1";

type BusinessContinuityStoreState = {
  incidents: typeof INCIDENT_REPORT_SEED;
  recoveryPlans: typeof RECOVERY_PLAN_SEED;
  backupJobs: typeof BACKUP_JOB_SEED;
  providerStatuses: typeof PROVIDER_STATUS_SEED;
  exercises: typeof CONTINUITY_EXERCISE_SEED;
  updatedAt: string;
};

function defaultState(): BusinessContinuityStoreState {
  return {
    incidents: [...INCIDENT_REPORT_SEED],
    recoveryPlans: [...RECOVERY_PLAN_SEED],
    backupJobs: [...BACKUP_JOB_SEED],
    providerStatuses: [...PROVIDER_STATUS_SEED],
    exercises: [...CONTINUITY_EXERCISE_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): BusinessContinuityStoreState {
  const stored = readJson<BusinessContinuityStoreState>(STORAGE_KEY, defaultState());
  if (!stored?.incidents?.length) return defaultState();
  return stored;
}

function saveState(state: BusinessContinuityStoreState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logContinuityAudit(action: BusinessContinuityAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "continuity-system",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listIncidentReports() {
  return loadState().incidents;
}

export function listRecoveryPlans() {
  return loadState().recoveryPlans;
}

export function listBackupJobs() {
  return loadState().backupJobs;
}

export function listProviderStatuses() {
  return loadState().providerStatuses;
}

export function listContinuityExercises() {
  return loadState().exercises;
}

export function getLatestHealthSnapshot() {
  return SYSTEM_HEALTH_SNAPSHOT_SEED;
}

export function recordIncidentUpdate(incidentRef: string, note: string, actor = "ops@bamsignal.com"): void {
  const state = loadState();
  const index = state.incidents.findIndex((item) => item.incidentRef === incidentRef);
  if (index < 0) return;
  const incident = state.incidents[index];
  state.incidents[index] = {
    ...incident,
    timeline: [
      ...incident.timeline,
      { at: new Date().toISOString(), actor, note }
    ],
    updatedAt: new Date().toISOString()
  };
  saveState(state);
  logContinuityAudit("incident-updated", note, incidentRef);
}

export function scheduleContinuityExercise(
  exerciseRef: string,
  title: string,
  scenarioId: string,
  scheduledAt: string
): void {
  const state = loadState();
  state.exercises.unshift({
    id: `bc_generated_${Date.now()}`,
    exerciseRef,
    title,
    scenarioId: scenarioId as (typeof CONTINUITY_EXERCISE_SEED)[number]["scenarioId"],
    status: "scheduled",
    scheduledAt,
    findings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  saveState(state);
  logContinuityAudit("exercise-scheduled", title, exerciseRef);
}
