/**
 * Accessibility Certification™ — server-side verification helpers.
 */

export function canAccessAccessibilityCertification(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("ManageSafety") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function formatAccessibilityCertificationSummary(report) {
  return `Score ${report.accessibilityScore ?? 0}% · violations ${report.violations?.length ?? 0} · critical ${report.counts?.critical ?? 0} · ${report.passed ? "PASS" : "BLOCKED"}`;
}

export function accessibilityCertificationRouteRegistered(source) {
  return (
    source.includes("/hard/accessibility-certification") &&
    source.includes("accessibilitycertification")
  );
}

export function accessibilityCertificationCommandRegistered(source) {
  return (
    source.includes("certify:accessibility") &&
    source.includes("test:accessibility-certification")
  );
}

export function accessibilityCertificationModuleRegistered(source) {
  return source.includes("certification/accessibility/run.mjs");
}
