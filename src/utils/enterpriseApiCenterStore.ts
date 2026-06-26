import type { EnterpriseApiAuditActionId, EnterpriseApiToolId } from "../constants/enterpriseApiCenter";
import {
  ENTERPRISE_API_ENDPOINT_SEED,
  ENTERPRISE_API_FAILED_JOB_SEED,
  ENTERPRISE_API_TOOL_RUN_SEED
} from "../data/enterpriseApiCenterSeed";
import type {
  EnterpriseApiEndpoint,
  EnterpriseApiFailedJob,
  EnterpriseApiToolRun
} from "../types/enterpriseApiCenter";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.enterpriseApiCenter.v1";

type EnterpriseApiCenterState = {
  endpoints: typeof ENTERPRISE_API_ENDPOINT_SEED;
  failedJobs: typeof ENTERPRISE_API_FAILED_JOB_SEED;
  toolRuns: typeof ENTERPRISE_API_TOOL_RUN_SEED;
  maintenanceMode: boolean;
  updatedAt: string;
};

function defaultState(): EnterpriseApiCenterState {
  return {
    endpoints: [...ENTERPRISE_API_ENDPOINT_SEED],
    failedJobs: [...ENTERPRISE_API_FAILED_JOB_SEED],
    toolRuns: [...ENTERPRISE_API_TOOL_RUN_SEED],
    maintenanceMode: false,
    updatedAt: new Date().toISOString()
  };
}

function loadState(): EnterpriseApiCenterState {
  const stored = readJson<EnterpriseApiCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.endpoints?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: EnterpriseApiCenterState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logEnterpriseApiAudit(
  action: EnterpriseApiAuditActionId,
  detail: string,
  entityRef: string
): void {
  appendAuditCenterEvent({
    actor: "enterprise-api-center",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listEnterpriseApiEndpoints() {
  return loadState().endpoints;
}

export function listEnterpriseApiFailedJobs() {
  return loadState().failedJobs;
}

export function listEnterpriseApiToolRuns() {
  return loadState().toolRuns;
}

export function isEnterpriseApiMaintenanceMode() {
  return loadState().maintenanceMode;
}

const TOOL_SUMMARIES: Record<EnterpriseApiToolId, string> = {
  "disable-endpoint": "Endpoint disabled — traffic blocked",
  "maintenance-mode": "Maintenance mode toggled for member APIs",
  "retry-failed-jobs": "Failed jobs re-queued for retry",
  "replay-requests": "Last 10 failed requests replayed to staging",
  "api-documentation": "API documentation catalog opened",
  "openapi-export": "OpenAPI 3.1 spec exported (42 paths)"
};

export function applyEnterpriseApiTool(input: {
  toolId: EnterpriseApiToolId;
  actor: string;
  targetEndpointId?: string;
}): EnterpriseApiToolRun {
  const state = loadState();
  const target = state.endpoints.find((item) => item.id === input.targetEndpointId);

  if (input.toolId === "disable-endpoint" && target) {
    const index = state.endpoints.findIndex((item) => item.id === target.id);
    const nextStatus = target.status === "disabled" ? "healthy" : "disabled";
    state.endpoints[index] = {
      ...state.endpoints[index],
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };
    logEnterpriseApiAudit(
      nextStatus === "disabled" ? "endpoint-disabled" : "endpoint-enabled",
      `${target.endpointRef} by ${input.actor}`,
      target.endpointRef
    );
  }

  if (input.toolId === "maintenance-mode") {
    state.maintenanceMode = !state.maintenanceMode;
    state.endpoints = state.endpoints.map((item) => {
      if (item.authentication !== "session" && item.authentication !== "public") return item;
      if (state.maintenanceMode) {
        return { ...item, status: "maintenance" as const, updatedAt: new Date().toISOString() };
      }
      if (item.status === "maintenance") {
        return { ...item, status: "healthy" as const, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    logEnterpriseApiAudit(
      state.maintenanceMode ? "maintenance-enabled" : "maintenance-disabled",
      `by ${input.actor}`,
      "MAINTENANCE"
    );
  }

  if (input.toolId === "retry-failed-jobs") {
    state.failedJobs = state.failedJobs.map((job) =>
      job.status === "pending"
        ? { ...job, status: "retried" as const, attempts: job.attempts + 1 }
        : job
    );
    logEnterpriseApiAudit("jobs-retried", `by ${input.actor}`, "FAILED-JOBS");
  }

  if (input.toolId === "replay-requests") {
    logEnterpriseApiAudit("requests-replayed", `by ${input.actor}`, "REPLAY-BATCH");
  }

  if (input.toolId === "api-documentation") {
    logEnterpriseApiAudit("documentation-opened", `by ${input.actor}`, "API-DOCS");
  }

  if (input.toolId === "openapi-export") {
    logEnterpriseApiAudit("openapi-exported", `by ${input.actor}`, "OPENAPI-3.1");
  }

  const run: EnterpriseApiToolRun = {
    id: `atr_${Date.now()}`,
    toolId: input.toolId,
    status: "completed",
    summary: target
      ? `${TOOL_SUMMARIES[input.toolId]} — ${target.path}`
      : TOOL_SUMMARIES[input.toolId],
    target: target?.endpointRef,
    ranAt: new Date().toISOString(),
    actor: input.actor
  };

  state.toolRuns = [run, ...state.toolRuns].slice(0, 20);
  saveState(state);
  return run;
}

export function toggleEnterpriseApiEndpoint(
  endpointId: string,
  actor: string
): EnterpriseApiEndpoint | null {
  const state = loadState();
  const index = state.endpoints.findIndex((item) => item.id === endpointId);
  if (index < 0) return null;
  const nextStatus = state.endpoints[index].status === "disabled" ? "healthy" : "disabled";
  state.endpoints[index] = {
    ...state.endpoints[index],
    status: nextStatus,
    updatedAt: new Date().toISOString()
  };
  saveState(state);
  logEnterpriseApiAudit(
    nextStatus === "disabled" ? "endpoint-disabled" : "endpoint-enabled",
    `${state.endpoints[index].endpointRef} by ${actor}`,
    state.endpoints[index].endpointRef
  );
  return state.endpoints[index];
}
