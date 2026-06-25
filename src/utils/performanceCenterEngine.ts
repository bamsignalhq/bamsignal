import type { PerformanceCenterBundle } from "../types/performanceCenter";
import type { PerformanceSectionId } from "../constants/performanceCenter";
import {
  buildPerformanceSummary,
  filterCapacityBySection,
  filterMetricsBySection,
  filterOptimizationsBySection
} from "./performanceCenterLogic";
import {
  listPerformanceApiProfiles,
  listPerformanceCapacityPlans,
  listPerformanceDatabaseProfiles,
  listPerformanceGrowthForecasts,
  listPerformanceMetrics,
  listPerformanceOptimizationItems,
  listPerformanceScalingRecommendations
} from "./performanceCenterStore";

export function buildPerformanceCenterBundle(
  sectionId: PerformanceSectionId = "system-performance"
): PerformanceCenterBundle {
  const metrics = listPerformanceMetrics();
  const capacityPlans = listPerformanceCapacityPlans();
  const optimizationItems = listPerformanceOptimizationItems();
  const growthForecasts = listPerformanceGrowthForecasts();

  return {
    generatedAt: new Date().toISOString(),
    summary: buildPerformanceSummary(metrics, capacityPlans, optimizationItems, growthForecasts),
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
