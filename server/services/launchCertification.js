/**
 * Institutional Launch Certification™ — server-side verification helpers.
 */

export function canAccessLaunchCertification(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function buildLaunchReadinessScore(subsystems) {
  if (!subsystems.length) return 0;
  const total = subsystems.reduce((sum, item) => sum + item.score, 0);
  const blockedCount = subsystems.filter((item) => item.status === "blocked").length;
  return Math.max(0, Math.round(total / subsystems.length) - blockedCount * 5);
}

export function scoreToLaunchDecision(score, criticalCount, warningCount) {
  if (criticalCount >= 3 || score < 50) return "no-go";
  if (criticalCount > 0 || warningCount > 4 || score < 80) return "go-with-conditions";
  return "go";
}

export function formatLaunchCertificationSummary(report) {
  return `${report.launchDecision} · score ${report.overallReadinessScore} · ${report.certifiedDomainCount}/${report.subsystems.length} certified`;
}

export function launchCertificationRouteRegistered(source) {
  return source.includes("/hard/launch-certification") && source.includes("launchcertification");
}
