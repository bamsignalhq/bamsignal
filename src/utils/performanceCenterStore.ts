import type { PerformanceAuditActionId, PerformanceEngineeringToolId } from "../constants/performanceCenter";
import {
  PERFORMANCE_API_PROFILE_SEED,
  PERFORMANCE_CAPACITY_PLAN_SEED,
  PERFORMANCE_DATABASE_PROFILE_SEED,
  PERFORMANCE_ENGINEERING_REPORT_SEED,
  PERFORMANCE_GROWTH_FORECAST_SEED,
  PERFORMANCE_METRIC_SEED,
  PERFORMANCE_OPTIMIZATION_SEED,
  PERFORMANCE_SCALING_RECOMMENDATIONS_SEED,
  PERFORMANCE_TOOL_RUN_SEED,
  PERFORMANCE_TRACK_SNAPSHOT_SEED
} from "../data/performanceCenterSeed";
import type { PerformanceOptimizationItem, PerformanceToolRun } from "../types/performanceCenter";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { resolveOptimizationItem } from "./performanceCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.performanceCenter.v1";

type PerformanceCenterState = {
  metrics: typeof PERFORMANCE_METRIC_SEED;
  apiProfiles: typeof PERFORMANCE_API_PROFILE_SEED;
  databaseProfiles: typeof PERFORMANCE_DATABASE_PROFILE_SEED;
  capacityPlans: typeof PERFORMANCE_CAPACITY_PLAN_SEED;
  optimizationItems: typeof PERFORMANCE_OPTIMIZATION_SEED;
  growthForecasts: typeof PERFORMANCE_GROWTH_FORECAST_SEED;
  scalingRecommendations: typeof PERFORMANCE_SCALING_RECOMMENDATIONS_SEED;
  tracks: typeof PERFORMANCE_TRACK_SNAPSHOT_SEED;
  reports: typeof PERFORMANCE_ENGINEERING_REPORT_SEED;
  toolRuns: typeof PERFORMANCE_TOOL_RUN_SEED;
  updatedAt: string;
};

function defaultState(): PerformanceCenterState {
  return {
    metrics: [...PERFORMANCE_METRIC_SEED],
    apiProfiles: [...PERFORMANCE_API_PROFILE_SEED],
    databaseProfiles: [...PERFORMANCE_DATABASE_PROFILE_SEED],
    capacityPlans: [...PERFORMANCE_CAPACITY_PLAN_SEED],
    optimizationItems: [...PERFORMANCE_OPTIMIZATION_SEED],
    growthForecasts: [...PERFORMANCE_GROWTH_FORECAST_SEED],
    scalingRecommendations: [...PERFORMANCE_SCALING_RECOMMENDATIONS_SEED],
    tracks: [...PERFORMANCE_TRACK_SNAPSHOT_SEED],
    reports: [...PERFORMANCE_ENGINEERING_REPORT_SEED],
    toolRuns: [...PERFORMANCE_TOOL_RUN_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): PerformanceCenterState {
  const stored = readJson<PerformanceCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.metrics?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: PerformanceCenterState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logPerformanceAudit(
  action: PerformanceAuditActionId,
  detail: string,
  entityRef: string
): void {
  appendAuditCenterEvent({
    actor: "performance-center",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listPerformanceMetrics() {
  return loadState().metrics;
}

export function listPerformanceApiProfiles() {
  return loadState().apiProfiles;
}

export function listPerformanceDatabaseProfiles() {
  return loadState().databaseProfiles;
}

export function listPerformanceCapacityPlans() {
  return loadState().capacityPlans;
}

export function listPerformanceOptimizationItems() {
  return loadState().optimizationItems;
}

export function listPerformanceGrowthForecasts() {
  return loadState().growthForecasts;
}

export function listPerformanceScalingRecommendations() {
  return loadState().scalingRecommendations;
}

export function listPerformanceTracks() {
  return loadState().tracks;
}

export function listPerformanceEngineeringReports() {
  return loadState().reports;
}

export function listPerformanceToolRuns() {
  return loadState().toolRuns;
}

const TOOL_SUMMARIES: Record<PerformanceEngineeringToolId, string> = {
  "bundle-analysis": "Main chunk 1.2MB — admin tabs 420KB, vendor 380KB",
  "image-audit": "38 images over 400KB — profile uploads dominate",
  "unused-code": "12 dead exports in admin utils — safe to prune",
  "code-splitting": "14 admin tabs eligible for lazy split — est. -180KB",
  caching: "SW cache hit 87% — API SWR gaps on discover feed"
};

export function applyPerformanceEngineeringTool(input: {
  toolId: PerformanceEngineeringToolId;
  actor: string;
}): PerformanceToolRun {
  const state = loadState();
  const run: PerformanceToolRun = {
    id: `ptr_${Date.now()}`,
    toolId: input.toolId,
    status: "completed",
    summary: TOOL_SUMMARIES[input.toolId],
    ranAt: new Date().toISOString(),
    actor: input.actor
  };
  state.toolRuns = [run, ...state.toolRuns].slice(0, 20);
  saveState(state);
  logPerformanceAudit("tool-executed", `${input.toolId} by ${input.actor}`, run.id);
  return run;
}

export function resolvePerformanceOptimization(
  itemId: string,
  actor: string
): PerformanceOptimizationItem | null {
  const state = loadState();
  const index = state.optimizationItems.findIndex((item) => item.id === itemId);
  if (index < 0) return null;
  state.optimizationItems[index] = resolveOptimizationItem(state.optimizationItems[index]);
  saveState(state);
  logPerformanceAudit(
    "optimization-resolved",
    `${state.optimizationItems[index].itemRef} by ${actor}`,
    state.optimizationItems[index].itemRef
  );
  return state.optimizationItems[index];
}
