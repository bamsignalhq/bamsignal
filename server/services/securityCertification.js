/**
 * Security Certification™ — server-side verification helpers.
 */

export function canAccessSecurityCertification(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("ManageSafety") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function formatSecurityCertificationSummary(report) {
  const { counts } = report;
  return `Score ${report.securityScore}% · critical ${counts?.critical ?? 0} · high ${counts?.high ?? 0} · ${report.passed ? "PASS" : "BLOCKED"}`;
}

export function securityCertificationRouteRegistered(source) {
  return source.includes("/hard/security-certification") && source.includes("securitycertification");
}
