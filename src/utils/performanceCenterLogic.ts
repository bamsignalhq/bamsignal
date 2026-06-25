import type {
  PerformanceApiProfile,
  PerformanceCapacityPlan,
  PerformanceCenterSummary,
  PerformanceGrowthForecast,
  PerformanceMetricSnapshot,
  PerformanceOptimizationItem
} from "../types/performanceCenter";
import type { PerformanceSectionId } from "../constants/performanceCenter";

export function buildPerformanceSummary(
  metrics: PerformanceMetricSnapshot[],
  capacityPlans: PerformanceCapacityPlan[],
  optimizationItems: PerformanceOptimizationItem[],
  growthForecasts: PerformanceGrowthForecast[]
): PerformanceCenterSummary {
  const metricValue = (metricId: string) =>
    metrics.find((entry) => entry.metricId === metricId)?.value ?? 0;

  const avgResponseMs = metricValue("avg-response-time");
  const p95Ms = metricValue("p95");
  const p99Ms = metricValue("p99");
  const cacheHitPercent = metricValue("cache-hit-rate");
  const workerUtilizationPercent = metricValue("worker-utilization");

  const headroomValues = capacityPlans.map((item) => item.remainingHeadroomPercent);
  const remainingHeadroomPercent = headroomValues.length
    ? Math.round(headroomValues.reduce((sum, value) => sum + value, 0) / headroomValues.length)
    : 100;

  const openOptimizations = optimizationItems.filter((item) => item.status === "open").length;
  const highImpactOptimizations = optimizationItems.filter(
    (item) => item.status === "open" && item.impact === "high"
  ).length;

  const order = ["critical", "strained", "watch", "healthy"] as const;
  const healthStatuses = [
    ...metrics.map((item) => item.status),
    ...capacityPlans.map((item) => item.status),
    ...growthForecasts.map((item) => item.status)
  ];
  const healthStatus =
    order.find((status) => healthStatuses.includes(status)) ?? "healthy";

  let healthScore = 100;
  if (p99Ms > 600) healthScore -= 8;
  if (cacheHitPercent < 90) healthScore -= 6;
  if (workerUtilizationPercent > 70) healthScore -= 10;
  if (remainingHeadroomPercent < 30) healthScore -= 15;
  if (highImpactOptimizations > 0) healthScore -= highImpactOptimizations * 5;
  healthScore = Math.max(0, Math.min(100, healthScore));

  let scalingRecommendation: PerformanceCenterSummary["scalingRecommendation"] = "stable";
  if (remainingHeadroomPercent < 25 || healthStatus === "critical") {
    scalingRecommendation = "scale-now";
  } else if (remainingHeadroomPercent < 45 || healthStatus === "strained") {
    scalingRecommendation = "plan-ahead";
  }

  return {
    healthScore,
    healthStatus,
    avgResponseMs,
    p95Ms,
    p99Ms,
    cacheHitPercent,
    workerUtilizationPercent,
    remainingHeadroomPercent,
    openOptimizations,
    highImpactOptimizations,
    scalingRecommendation
  };
}

export function filterMetricsBySection(
  metrics: PerformanceMetricSnapshot[],
  sectionId: PerformanceSectionId
) {
  if (sectionId === "system-performance") {
    return metrics.filter((item) => item.sectionId === "system-performance");
  }
  return metrics.filter((item) => item.sectionId === sectionId);
}

export function filterOptimizationsBySection(
  items: PerformanceOptimizationItem[],
  sectionId: PerformanceSectionId
) {
  if (sectionId === "optimization") {
    return items.filter((item) => item.status === "open");
  }
  if (sectionId !== "system-performance") {
    return items.filter((item) => item.sectionId === sectionId && item.status === "open");
  }
  return items.filter((item) => item.status === "open");
}

export function filterCapacityBySection(
  plans: PerformanceCapacityPlan[],
  sectionId: PerformanceSectionId
) {
  if (sectionId === "capacity-planning") return plans;
  return plans.filter((item) => item.sectionId === sectionId);
}

export function listHeavyApiEndpoints(
  profiles: PerformanceApiProfile[],
  thresholdMs = 300
): PerformanceApiProfile[] {
  return profiles.filter((item) => item.p95Ms >= thresholdMs);
}

export function calculateRemainingHeadroom(current: number, expected: number): number {
  if (!expected) return 100;
  return Math.max(0, Math.round(((expected - current) / expected) * 100));
}

export function resolveOptimizationItem(
  item: PerformanceOptimizationItem
): PerformanceOptimizationItem {
  if (item.status === "resolved") {
    throw new Error("Performance center violation: optimization already resolved");
  }
  return {
    ...item,
    status: "resolved",
    resolvedAt: new Date().toISOString()
  };
}

export function formatPerformanceSummaryLine(summary: PerformanceCenterSummary): string {
  return `${summary.healthScore}% health · ${summary.avgResponseMs}ms avg · ${summary.remainingHeadroomPercent}% headroom · ${summary.scalingRecommendation.toUpperCase()}`;
}
