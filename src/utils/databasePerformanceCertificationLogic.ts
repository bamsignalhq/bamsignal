import type { DatabasePerfCertificationSnapshot } from "../types/databasePerformanceCertification";

export function formatDatabasePerformanceCertificationSummary(
  report: Pick<
    DatabasePerfCertificationSnapshot,
    "riskScore" | "metrics" | "criticalIssues" | "criticalRegressions"
  >
): string {
  return `Risk ${report.riskScore}% · p95 ${report.metrics.p95Ms}ms · critical ${report.criticalIssues.length} · regressions ${report.criticalRegressions.length}`;
}
