/**
 * Dependency & Supply Chain Certification™ — server-side verification helpers.
 */

export function canAccessDependencyCertification(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("ManageSafety") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function formatDependencyCertificationSummary(report) {
  return `Score ${report.dependencyScore ?? 0}% · critical ${report.criticalVulnerabilities?.length ?? 0} · upgrades ${report.upgradeCandidates?.length ?? 0} · ${report.passed ? "PASS" : "BLOCKED"}`;
}

export function dependencyCertificationRouteRegistered(source) {
  return source.includes("/hard/dependency-certification") && source.includes("dependencycertification");
}

export function dependencyCertificationCommandRegistered(source) {
  return (
    source.includes("certify:dependencies") &&
    source.includes("test:dependency-certification")
  );
}

export function dependencyCertificationModuleRegistered(source) {
  return source.includes("certification/dependencies/run.mjs");
}
