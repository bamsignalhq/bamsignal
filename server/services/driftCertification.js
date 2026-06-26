/**
 * Operational Drift Certification™ — server-side verification helpers.
 */

export function canAccessDriftCertification(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function formatDriftCertificationSummary(report) {
  return `Score ${report.driftScore ?? 0}% · critical ${report.counts?.critical ?? 0} · drift ${report.unexpectedDrift ?? 0} · ${report.passed ? "PASS" : "BLOCKED"}`;
}

export function driftCertificationRouteRegistered(source) {
  return source.includes("/hard/drift-certification") && source.includes("driftcertification");
}

export function driftCertificationCommandRegistered(source) {
  return source.includes("certify:drift") && source.includes("test:drift-certification");
}

export function driftCertificationModuleRegistered(source) {
  return source.includes("certification/drift/run.mjs");
}
