import type { LaunchControlAuditActionId } from "../constants/launchControlCenter";
import {
  LAUNCH_APPROVAL_SEED,
  LAUNCH_BLOCKER_SEED,
  LAUNCH_CHECKLIST_SEED,
  LAUNCH_DEPENDENCY_SEED,
  LAUNCH_READINESS_SEED,
  LAUNCH_RECOMMENDATIONS_SEED,
  LAUNCH_RISK_SEED,
  LAUNCH_TIMELINE_SEED
} from "../data/launchControlCenterSeed";
import type { LaunchApprovalRecord, LaunchBlockerRecord } from "../types/launchControlCenter";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { recordLaunchApproval, resolveLaunchBlocker } from "./launchControlCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.launchControlCenter.v1";

type LaunchControlCenterState = {
  readiness: typeof LAUNCH_READINESS_SEED;
  checklist: typeof LAUNCH_CHECKLIST_SEED;
  blockers: typeof LAUNCH_BLOCKER_SEED;
  risks: typeof LAUNCH_RISK_SEED;
  dependencies: typeof LAUNCH_DEPENDENCY_SEED;
  timeline: typeof LAUNCH_TIMELINE_SEED;
  approvals: typeof LAUNCH_APPROVAL_SEED;
  recommendations: typeof LAUNCH_RECOMMENDATIONS_SEED;
  updatedAt: string;
};

function defaultState(): LaunchControlCenterState {
  return {
    readiness: [...LAUNCH_READINESS_SEED],
    checklist: [...LAUNCH_CHECKLIST_SEED],
    blockers: [...LAUNCH_BLOCKER_SEED],
    risks: [...LAUNCH_RISK_SEED],
    dependencies: [...LAUNCH_DEPENDENCY_SEED],
    timeline: [...LAUNCH_TIMELINE_SEED],
    approvals: [...LAUNCH_APPROVAL_SEED],
    recommendations: [...LAUNCH_RECOMMENDATIONS_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): LaunchControlCenterState {
  const stored = readJson<LaunchControlCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.readiness?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: LaunchControlCenterState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logLaunchAudit(action: LaunchControlAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "launch-control-center",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listLaunchReadiness() {
  return loadState().readiness;
}

export function listLaunchChecklist() {
  return loadState().checklist;
}

export function listLaunchBlockers() {
  return loadState().blockers;
}

export function listLaunchRisks() {
  return loadState().risks;
}

export function listLaunchDependencies() {
  return loadState().dependencies;
}

export function listLaunchTimeline() {
  return loadState().timeline;
}

export function listLaunchApprovals() {
  return loadState().approvals;
}

export function listLaunchRecommendations() {
  return loadState().recommendations;
}

export function resolveLaunchControlBlocker(
  blockerId: string,
  actor: string
): LaunchBlockerRecord | null {
  const state = loadState();
  const index = state.blockers.findIndex((item) => item.id === blockerId);
  if (index < 0) return null;
  state.blockers[index] = resolveLaunchBlocker(state.blockers[index]);
  saveState(state);
  logLaunchAudit(
    "blocker-resolved",
    `${state.blockers[index].blockerRef} by ${actor}`,
    state.blockers[index].blockerRef
  );
  return state.blockers[index];
}

export function approveLaunchControlSignoff(
  role: LaunchApprovalRecord["role"],
  signedBy: string
): LaunchApprovalRecord | null {
  const state = loadState();
  const index = state.approvals.findIndex((item) => item.role === role);
  if (index < 0) return null;
  state.approvals[index] = recordLaunchApproval(state.approvals[index], signedBy);
  saveState(state);
  logLaunchAudit("approval-recorded", `${role} sign-off by ${signedBy}`, role);
  return state.approvals[index];
}
