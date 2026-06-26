import { DATABASE_PERF_THRESHOLDS } from "../../../shared/databasePerformanceCertificationDomains.mjs";

export function buildOptimizationOpportunities(areas, metrics) {
  const opportunities = [];
  const threshold = DATABASE_PERF_THRESHOLDS;

  if (metrics.slowQueryCount > 0) {
    opportunities.push({
      id: "optimize-slow-queries",
      title: "Optimize slow SQL statements",
      detail: `Review ${metrics.slowQueryCount} statement(s) averaging above ${threshold.slowQueryMs}ms.`,
      impact: metrics.p99Ms >= threshold.p99CriticalMs ? "high" : "medium"
    });
  }

  const seqHeavy = metrics.largestTables.filter(
    (table) => table.seqScan > table.idxScan && table.liveRows >= threshold.seqScanRowThreshold
  );
  if (seqHeavy.length) {
    opportunities.push({
      id: "add-missing-indexes",
      title: "Add indexes for sequential-scan tables",
      detail: `Target tables: ${seqHeavy
        .slice(0, 5)
        .map((item) => item.name)
        .join(", ")}.`,
      impact: "high"
    });
  }

  const unused = metrics.largestIndexes.filter((item) => item.idxScan === 0);
  if (unused.length) {
    opportunities.push({
      id: "drop-unused-indexes",
      title: "Drop or consolidate unused indexes",
      detail: `${unused.length} index(es) show zero scans and add write overhead.`,
      impact: "medium"
    });
  }

  if (metrics.cacheHitPercent < threshold.cacheHitWarningPercent) {
    opportunities.push({
      id: "improve-cache-hit",
      title: "Improve buffer cache hit rate",
      detail: `Cache hit is ${metrics.cacheHitPercent}% — review hot tables and memory settings.`,
      impact: "high"
    });
  }

  if (metrics.connectionPoolUsedPercent >= 70 || metrics.connectionPoolWaiting > 0) {
    opportunities.push({
      id: "tune-connection-pool",
      title: "Tune database connection pool",
      detail: `Pool utilization ${metrics.connectionPoolUsedPercent}% with ${metrics.connectionPoolWaiting} waiting client(s).`,
      impact: metrics.connectionPoolUsedPercent >= threshold.poolUsageCriticalPercent ? "high" : "medium"
    });
  }

  if (metrics.expensiveEndpoints.length) {
    const heavy = metrics.expensiveEndpoints.filter((item) => item.p95Ms >= threshold.slowQueryMs);
    if (heavy.length) {
      opportunities.push({
        id: "optimize-heavy-endpoints",
        title: "Optimize most expensive API endpoints",
        detail: heavy
          .slice(0, 4)
          .map((item) => `${item.method} ${item.path} (${item.p95Ms}ms p95)`)
          .join("; "),
        impact: "high"
      });
    }
  }

  const largeTables = metrics.largestTables.filter(
    (table) => table.totalBytes >= threshold.tableSizeWarningMb * 1024 * 1024
  );
  if (largeTables.length) {
    opportunities.push({
      id: "archive-table-growth",
      title: "Plan archival for large tables",
      detail: `${largeTables.length} table(s) exceed ${threshold.tableSizeWarningMb}MB.`,
      impact: "medium"
    });
  }

  const duplicateArea = areas.find((item) => item.id === "duplicate-indexes");
  if (duplicateArea?.warnings?.length) {
    opportunities.push({
      id: "dedupe-indexes",
      title: "Remove duplicate indexes",
      detail: "Duplicate index definitions increase storage and write cost.",
      impact: "medium"
    });
  }

  return opportunities;
}

export function buildRecommendations(opportunities, criticalIssues, warnings) {
  const recommendations = [];

  for (const issue of criticalIssues) {
    recommendations.push({
      priority: "critical",
      title: issue.title,
      detail: issue.detail
    });
  }

  for (const item of opportunities.filter((entry) => entry.impact === "high")) {
    recommendations.push({
      priority: "high",
      title: item.title,
      detail: item.detail
    });
  }

  for (const item of warnings.slice(0, 8)) {
    recommendations.push({
      priority: "medium",
      title: item.title,
      detail: item.detail
    });
  }

  for (const item of opportunities.filter((entry) => entry.impact !== "high").slice(0, 5)) {
    recommendations.push({
      priority: "low",
      title: item.title,
      detail: item.detail
    });
  }

  return recommendations;
}
