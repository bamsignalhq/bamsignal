/**
 * Enterprise Codebase Cleanup™ — server-side verification helpers.
 */

export function canAccessEnterpriseCodebaseCleanup(permissions = []) {
  return permissions.includes("ManageOperations") || permissions.includes("SystemAdministration");
}

export function buildEngineeringHealthScore(domains) {
  if (!domains.length) return 0;
  const total = domains.reduce((sum, item) => sum + item.score, 0);
  const debtCount = domains.filter((item) => item.status === "debt").length;
  return Math.max(0, Math.round(total / domains.length) - debtCount * 5);
}

export function formatEngineeringHealthSummary(report) {
  return `${report.passedCheckCount} passed · ${report.reviewIssueCount} review · score ${report.overallScore}`;
}

export function enterpriseCleanupRouteRegistered(source) {
  return source.includes("/hard/enterprise-cleanup") && source.includes("enterprisecleanup");
}
