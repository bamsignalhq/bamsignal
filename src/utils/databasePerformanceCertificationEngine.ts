import type { DatabasePerfCertificationReport } from "../types/databasePerformanceCertification";
import { formatDatabasePerformanceCertificationSummary } from "./databasePerformanceCertificationLogic";
import {
  getLatestDatabasePerformanceCertificationSnapshot,
  listDatabasePerformanceCertificationSnapshots
} from "./databasePerformanceCertificationStore";

const emptyMetrics = (): DatabasePerfCertificationReport["metrics"] => ({
  avgQueryMs: 0,
  p95Ms: 0,
  p99Ms: 0,
  slowQueryCount: 0,
  cacheHitPercent: 0,
  connectionPoolUsedPercent: 0,
  connectionPoolWaiting: 0,
  databaseSizeBytes: 0,
  largestTables: [],
  largestIndexes: [],
  expensiveEndpoints: [],
  queryPlanSamples: []
});

export function buildDatabasePerformanceCertificationBundle(): DatabasePerfCertificationReport {
  const history = listDatabasePerformanceCertificationSnapshots();
  const latest = getLatestDatabasePerformanceCertificationSnapshot();

  if (!latest) {
    const now = new Date().toISOString();
    return {
      generatedAt: now,
      runId: "pending",
      mode: "static",
      riskScore: 0,
      passed: false,
      objectsScanned: 0,
      areasPassed: 0,
      areas: [],
      metrics: emptyMetrics(),
      criticalRegressions: [],
      criticalIssues: [],
      warnings: [],
      optimizationOpportunities: [],
      recommendations: [],
      summaryLine: "No certification snapshot — run npm run certify:database",
      source: "store"
    };
  }

  void history;
  return {
    ...latest,
    summaryLine: formatDatabasePerformanceCertificationSummary(latest),
    source: "store"
  };
}
