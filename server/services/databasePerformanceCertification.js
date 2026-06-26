/**
 * Database Performance Certification™ — server-side verification helpers.
 */

export function formatDatabasePerformanceCertificationSummary(report) {
  return `Risk ${report.riskScore ?? 0}% · p95 ${report.metrics?.p95Ms ?? 0}ms · critical ${report.criticalIssues?.length ?? 0} · regressions ${report.criticalRegressions?.length ?? 0}`;
}

export function databasePerformanceCertificationCommandRegistered(source) {
  return (
    source.includes("certify:database") &&
    source.includes("test:database-performance-certification")
  );
}

export function databasePerformanceCertificationModuleRegistered(source) {
  return source.includes("certification/database/run.mjs");
}
