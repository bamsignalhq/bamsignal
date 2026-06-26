/**
 * Production performance optimization — server-side verification helpers.
 */

export function canAccessProductionPerformance(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration")
  );
}

export function buildPerformanceScore(domains) {
  if (!domains.length) return 0;
  const total = domains.reduce((sum, item) => sum + item.score, 0);
  const slowCount = domains.filter((item) => item.status === "slow").length;
  return Math.max(0, Math.round(total / domains.length) - slowCount * 5);
}

export function scoreToPerformanceStatus(score, hasSlow) {
  if (hasSlow || score < 55) return "slow";
  if (score < 82) return "review";
  return "optimized";
}

export function formatPerformanceHealthSummaryLine(report) {
  return `${report.passedCheckCount} passed · ${report.reviewIssueCount} review · ${report.slowIssueCount} slow · score ${report.overallScore}`;
}

export function adminHubUsesLazyTabs(source) {
  return (
    source.includes("lazyAdminHubTabs") &&
    source.includes("AdminLazyTab") &&
    !source.includes('from "../components/admin/security/SecurityDashboard"')
  );
}
