/**
 * UX consistency audit — server-side verification helpers.
 */

export function canAccessUxConsistencyAudit(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration")
  );
}

export function buildUxScore(domains) {
  if (!domains.length) return 0;
  const total = domains.reduce((sum, item) => sum + item.score, 0);
  const inconsistentCount = domains.filter((item) => item.status === "inconsistent").length;
  return Math.max(0, Math.round(total / domains.length) - inconsistentCount * 5);
}

export function scoreToUxStatus(score, hasInconsistent) {
  if (hasInconsistent || score < 55) return "inconsistent";
  if (score < 82) return "review";
  return "consistent";
}

export function formatUxSummaryLine(report) {
  return `${report.passedCheckCount} passed · ${report.reviewIssueCount} review · ${report.inconsistentIssueCount} inconsistent · score ${report.overallScore}`;
}

export function countInstitutionalButtonUsage(source) {
  const institutional = (source.match(/concierge-consultant-btn/g) || []).length;
  const legacy = (source.match(/btn-primary/g) || []).length;
  return { institutional, legacy };
}
