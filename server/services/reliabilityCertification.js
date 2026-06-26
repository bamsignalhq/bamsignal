/**
 * Reliability Certification™ — server-side verification helpers.
 */

export function canAccessReliabilityCertification(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function formatReliabilityCertificationSummary(report) {
  const total = report.scenarios?.length ?? 0;
  return `Score ${report.reliabilityScore}% · recovery ${report.recoverySuccess ?? 0}/${total} · ${report.passed ? "PASS" : "BLOCKED"}`;
}

export function reliabilityCertificationRouteRegistered(source) {
  return source.includes("/hard/reliability-certification") && source.includes("reliabilitycertification");
}
