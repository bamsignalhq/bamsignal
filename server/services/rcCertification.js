/**
 * Release Candidate Certification™ — server-side verification helpers.
 */

export function canAccessRcCertification(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function formatRcCertificationSummary(report) {
  return `${report.releaseDecisionLabel ?? "PENDING"} · ${report.overallScore ?? 0}% · ${report.passedChecks ?? 0} passed · ${report.blockers?.length ?? 0} blockers`;
}

export function rcCertificationRouteRegistered(source) {
  return source.includes("/hard/rc-certification") && source.includes("rccertification");
}

export function rcCertificationCommandRegistered(source) {
  return source.includes("certify:rc") && source.includes("test:rc-certification");
}

export function rcCertificationModuleRegistered(source) {
  return source.includes("certification/release-candidate/run.mjs");
}
