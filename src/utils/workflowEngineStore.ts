import type { WorkflowAuditActionId } from "../constants/workflowEngine";
import {
  WORKFLOW_ACTION_SEED,
  WORKFLOW_HISTORY_SEED,
  WORKFLOW_RECORD_SEED,
  WORKFLOW_STEP_LOG_SEED,
  WORKFLOW_TRIGGER_SEED
} from "../data/workflowEngineSeed";
import type { WorkflowRecord } from "../types/workflowEngine";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { activateWorkflow, pauseWorkflow } from "./workflowEngineLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.workflowEngine.v1";

type WorkflowEngineState = {
  workflows: typeof WORKFLOW_RECORD_SEED;
  triggers: typeof WORKFLOW_TRIGGER_SEED;
  actions: typeof WORKFLOW_ACTION_SEED;
  history: typeof WORKFLOW_HISTORY_SEED;
  stepLogs: typeof WORKFLOW_STEP_LOG_SEED;
  updatedAt: string;
};

function defaultState(): WorkflowEngineState {
  return {
    workflows: [...WORKFLOW_RECORD_SEED],
    triggers: [...WORKFLOW_TRIGGER_SEED],
    actions: [...WORKFLOW_ACTION_SEED],
    history: [...WORKFLOW_HISTORY_SEED],
    stepLogs: [...WORKFLOW_STEP_LOG_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): WorkflowEngineState {
  const stored = readJson<WorkflowEngineState>(STORAGE_KEY, defaultState());
  if (!stored?.workflows?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: WorkflowEngineState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logWorkflowAudit(action: WorkflowAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "workflow-engine",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listWorkflows() {
  return loadState().workflows;
}

export function listWorkflowTriggers() {
  return loadState().triggers;
}

export function listWorkflowActions() {
  return loadState().actions;
}

export function listWorkflowHistory() {
  return loadState().history;
}

export function listWorkflowStepLogs() {
  return loadState().stepLogs;
}

export function pauseWorkflowAutomation(
  workflowId: string,
  actor: string
): WorkflowRecord | null {
  const state = loadState();
  const index = state.workflows.findIndex((item) => item.id === workflowId);
  if (index < 0) return null;
  state.workflows[index] = pauseWorkflow(state.workflows[index], actor);
  saveState(state);
  logWorkflowAudit(
    "workflow-paused",
    `${state.workflows[index].workflowRef} by ${actor}`,
    state.workflows[index].workflowRef
  );
  return state.workflows[index];
}

export function activateWorkflowAutomation(
  workflowId: string,
  actor: string
): WorkflowRecord | null {
  const state = loadState();
  const index = state.workflows.findIndex((item) => item.id === workflowId);
  if (index < 0) return null;
  state.workflows[index] = activateWorkflow(state.workflows[index], actor);
  saveState(state);
  logWorkflowAudit(
    "workflow-activated",
    `${state.workflows[index].workflowRef} by ${actor}`,
    state.workflows[index].workflowRef
  );
  return state.workflows[index];
}
