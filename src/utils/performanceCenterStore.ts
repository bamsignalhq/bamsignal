import type { PerformanceAuditActionId } from "../constants/performanceCenter";
import {
  PERFORMANCE_API_PROFILE_SEED,
  PERFORMANCE_CAPACITY_PLAN_SEED,
  PERFORMANCE_DATABASE_PROFILE_SEED,
  PERFORMANCE_GROWTH_FORECAST_SEED,
  PERFORMANCE_METRIC_SEED,
  PERFORMANCE_OPTIMIZATION_SEED,
  PERFORMANCE_SCALING_RECOMMENDATIONS_SEED
} from "../data/performanceCenterSeed";
import type { PerformanceOptimizationItem } from "../types/performanceCenter";
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
