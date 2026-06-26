/**
 * Performance Engineering Center — application performance intelligence logic.
 */

export const PERFORMANCE_CENTER_DB_TABLES = [
  "performance_metric_snapshots",
  "performance_api_profiles",
  "performance_database_profiles",
  "performance_capacity_plans",
  "performance_optimization_items",
  "performance_growth_forecasts",
  "performance_track_snapshots",
  "performance_engineering_reports",
  "performance_tool_runs"
];

export function getPerformanceCenterDatabaseTableManifest() {
  return PERFORMANCE_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "performance",
    migrationRef: "0017_performance_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function canAccessPerformanceCenter(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

function metricValue(metrics, metricId) {
  const item = metrics.find((entry) => entry.metricId === metricId);
  return item?.value ?? 0;
}

function worstStatus(statuses) {
  const order = ["critical", "strained", "watch", "healthy"];
  for (const status of order) {
    if (statuses.includes(status)) return status;
  }
  return "healthy";
}

export function buildPerformanceSummary(
  metrics,
  capacityPlans,
  optimizationItems,
  growthForecasts
) {
  const avgResponseMs = metricValue(metrics, "avg-response-time");
  const p95Ms = metricValue(metrics, "p95");
  const p99Ms = metricValue(metrics, "p99");
  const cacheHitPercent = metricValue(metrics, "cache-hit-rate");
  const workerUtilizationPercent = metricValue(metrics, "worker-utilization");

  const headroomValues = capacityPlans.map((item) => item.remainingHeadroomPercent ?? 0);
  const remainingHeadroomPercent = headroomValues.length
    ? Math.round(headroomValues.reduce((sum, value) => sum + value, 0) / headroomValues.length)
    : 100;

  const openOptimizations = optimizationItems.filter((item) => item.status === "open").length;
  const highImpactOptimizations = optimizationItems.filter(
    (item) => item.status === "open" && item.impact === "high"
  ).length;

  const healthStatuses = [
    ...metrics.map((item) => item.status),
    ...capacityPlans.map((item) => item.status),
    ...growthForecasts.map((item) => item.status)
  ];
  const healthStatus = worstStatus(healthStatuses);

  let healthScore = 100;
  if (p99Ms > 600) healthScore -= 8;
  if (cacheHitPercent < 90) healthScore -= 6;
  if (workerUtilizationPercent > 70) healthScore -= 10;
  if (remainingHeadroomPercent < 30) healthScore -= 15;
  if (highImpactOptimizations > 0) healthScore -= highImpactOptimizations * 5;
  healthScore = Math.max(0, Math.min(100, healthScore));

  let scalingRecommendation = "stable";
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

export function buildEngineeringSummary(tracks, reports, compareWindow = "current") {
  const regressionsCount = reports.filter(
    (item) => item.reportType === "largest-regressions"
  ).length;
  const improvementsCount = reports.filter(
    (item) => item.reportType === "largest-improvements"
  ).length;
  const recommendationsCount = reports.filter(
    (item) => item.reportType === "recommendations"
  ).length;

  const healthStatuses = tracks.map((item) => item.status);
  const healthStatus = worstStatus(healthStatuses);

  let engineeringScore = 100;
  const watchTracks = tracks.filter((item) => item.status === "watch").length;
  const strainedTracks = tracks.filter((item) => item.status === "strained").length;
  engineeringScore -= watchTracks * 4;
  engineeringScore -= strainedTracks * 10;
  engineeringScore -= regressionsCount * 3;
  engineeringScore = Math.max(0, Math.min(100, engineeringScore));

  return {
    engineeringScore,
    healthStatus,
    trackCount: tracks.length,
    regressionsCount,
    improvementsCount,
    recommendationsCount,
    compareWindow
  };
}

export function getTrackValueForWindow(track, windowId) {
  switch (windowId) {
    case "previous-release":
      return track.previousRelease;
    case "30-days":
      return track.days30;
    case "90-days":
      return track.days90;
    default:
      return track.current;
  }
}

export function filterReportsByType(reports, reportType) {
  return reports.filter((item) => item.reportType === reportType);
}

export function filterMetricsBySection(metrics, sectionId) {
  if (sectionId === "system-performance") {
    return metrics.filter((item) => item.sectionId === "system-performance");
  }
  return metrics.filter((item) => item.sectionId === sectionId);
}

export function filterOptimizationsBySection(items, sectionId) {
  if (sectionId === "optimization") {
    return items.filter((item) => item.status === "open");
  }
  if (sectionId !== "system-performance") {
    return items.filter((item) => item.sectionId === sectionId && item.status === "open");
  }
  return items.filter((item) => item.status === "open");
}

export function filterCapacityBySection(plans, sectionId) {
  if (sectionId === "capacity-planning") return plans;
  return plans.filter((item) => item.sectionId === sectionId);
}

export function listHeavyApiEndpoints(profiles, thresholdMs = 300) {
  return profiles.filter((item) => item.p95Ms >= thresholdMs);
}

export function calculateRemainingHeadroom(current, expected) {
  if (!expected) return 100;
  return Math.max(0, Math.round(((expected - current) / expected) * 100));
}

export function resolveOptimizationItem(item) {
  if (item.status === "resolved") {
    throw new Error("Performance center violation: optimization already resolved");
  }
  return {
    ...item,
    status: "resolved",
    resolvedAt: new Date().toISOString()
  };
}

export function formatPerformanceSummaryLine(summary) {
  return `${summary.healthScore}% health · ${summary.avgResponseMs}ms avg · ${summary.remainingHeadroomPercent}% headroom · ${summary.scalingRecommendation.toUpperCase()}`;
}
