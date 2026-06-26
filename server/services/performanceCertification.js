/**
 * Performance Certification™ — server-side verification helpers.
 */

export function canAccessPerformanceCertification(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function formatPerformanceCertificationSummary(report) {
  return `Score ${report.performanceScore}% · ${report.trend} · ${report.regressions?.length ?? 0} regressions`;
}

export function performanceCertificationRouteRegistered(source) {
  return source.includes("/hard/performance-certification") && source.includes("performancecertification");
}
