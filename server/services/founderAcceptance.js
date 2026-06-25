/**
 * Founder Acceptance Test™ — server-side helpers.
 */

export function canAccessFounderAcceptance(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function founderAcceptanceRouteRegistered(source) {
  return source.includes("/hard/founder-acceptance") && source.includes("founderacceptance");
}

export function formatFounderAcceptanceSummary(report) {
  const decision =
    report.goDecision === "go"
      ? "GO"
      : report.goDecision === "go-with-conditions"
        ? "GO WITH CONDITIONS"
        : "NO GO";
  return `${decision} · ${report.passedCount} passed · ${report.warningCount} warning · score ${report.overallScore}`;
}
