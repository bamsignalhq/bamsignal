import type { PerformanceCenterBundle } from "../types/performanceCenter";
import type { PerformanceCompareWindowId, PerformanceSectionId } from "../constants/performanceCenter";
import {
  buildEngineeringSummary,
  buildPerformanceSummary,
  filterCapacityBySection,
  filterMetricsBySection,
  filterOptimizationsBySection
} from "./performanceCenterLogic";
import {
  listPerformanceApiProfiles,
  listPerformanceCapacityPlans,
  listPerformanceDatabaseProfiles,
  listPerformanceEngineeringReports,
  listPerformanceGrowthForecasts,
  listPerformanceMetrics,
  listPerformanceOptimizationItems,
  listPerformanceScalingRecommendations,
  listPerformanceToolRuns,
  listPerformanceTracks
} from "./performanceCenterStore";

export function buildPerformanceCenterBundle(
  sectionId: PerformanceSectionId = "system-performance",
  compareWindow: PerformanceCompareWindowId = "current"
): PerformanceCenterBundle {
  const metrics = listPerformanceMetrics();
  const capacityPlans = listPerformanceCapacityPlans();
  const optimizationItems = listPerformanceOptimizationItems();
  const growthForecasts = listPerformanceGrowthForecasts();
  const tracks = listPerformanceTracks();
  const reports = listPerformanceEngineeringReports();
  const toolRuns = listPerformanceToolRuns();

  return {
    generatedAt: new Date().toISOString(),
    summary: buildPerformanceSummary(metrics, capacityPlans, optimizationItems, growthForecasts),
    engineeringSummary: buildEngineeringSummary(tracks, reports, compareWindow),
    tracks,
    reports,
    toolRuns,
    metrics: filterMetricsBySection(metrics, sectionId),
    apiProfiles: listPerformanceApiProfiles(),
    databaseProfiles: listPerformanceDatabaseProfiles(),
    capacityPlans: filterCapacityBySection(capacityPlans, sectionId),
    optimizationItems: filterOptimizationsBySection(optimizationItems, sectionId),
    growthForecasts:
      sectionId === "growth-forecast" || sectionId === "system-performance"
        ? growthForecasts
        : growthForecasts,
    scalingRecommendations: listPerformanceScalingRecommendations()
  };
}

export function buildLivePerformanceCenterBundle(
  compareWindow: PerformanceCompareWindowId = "current"
): PerformanceCenterBundle {
  return buildPerformanceCenterBundle("system-performance", compareWindow);
}
