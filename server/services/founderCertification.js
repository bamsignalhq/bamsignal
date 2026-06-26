/**
 * Founder Launch Certification™ — server-side verification helpers.
 */

export function canAccessFounderCertification(permissions = []) {
  return (
    permissions.includes("ViewExecutiveDashboard") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ManageOperations")
  );
}

export function formatFounderCertificationSummary(report) {
  return `${report.releaseDecisionLabel || "PENDING"} · ${report.overallScore ?? 0}% · ${report.criticalIssues?.length ?? 0} critical`;
}

export function founderCertificationRouteRegistered(source) {
  return source.includes("/hard/founder-certification") && source.includes("foundercertification");
}
