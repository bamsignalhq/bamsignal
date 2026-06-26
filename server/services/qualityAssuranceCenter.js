/**
 * Enterprise QA & Certification Center™ — server-side certification logic.
 */

export const QA_CERTIFICATION_CENTER_DB_TABLES = [
  "qa_certification_records",
  "qa_release_gates",
  "qa_automated_test_runs",
  "qa_manual_qa_runs",
  "qa_certification_reports"
];

export const QA_CERTIFICATION_SECTIONS = [
  "certification-summary",
  "automated-tests",
  "manual-qa",
  "cross-browser",
  "mobile-testing",
  "regression-tests",
  "performance",
  "security",
  "accessibility",
  "production-readiness"
];

export const QA_AUTOMATED_TESTS = [
  "build",
  "unit",
  "integration",
  "server-import",
  "database",
  "api",
  "notifications",
  "payments",
  "otp",
  "concierge",
  "operations",
  "feature-flags",
  "remote-config",
  "platform-health",
  "abuse-protection",
  "observability"
];

export const QA_RELEASE_GATE_STATUSES = ["pass", "warning", "failed"];

export function getQACertificationCenterDatabaseTableManifest() {
  return QA_CERTIFICATION_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "quality-assurance",
    migrationRef: "202606261600_quality_assurance_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function qaCertificationRouteRegistered(source) {
  return source.includes("/hard/quality-assurance") && source.includes("qualityassurance");
}

export function canAccessQACertificationCenter(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function gateStatusBlocksRelease(status) {
  return status === "failed";
}

export function computeOverallCertificationScore(subsystems) {
  if (!subsystems.length) return 0;
  const total = subsystems.reduce((sum, item) => sum + item.score, 0);
  return Math.round(total / subsystems.length);
}

export function buildCertificationSummary(releaseGates, automatedTests, manualChecks, subsystemScores) {
  const passCount = releaseGates.filter((item) => item.status === "pass").length;
  const warningCount = releaseGates.filter((item) => item.status === "warning").length;
  const failedCount = releaseGates.filter((item) => item.status === "failed").length;
  const releaseBlocked = releaseGates.some((item) => item.blocksRelease);
  const automatedPassRate = automatedTests.length
    ? Math.round(
        (automatedTests.filter((item) => item.status === "pass").length / automatedTests.length) *
          100
      )
    : 0;
  const manualPassRate = manualChecks.length
    ? Math.round(
        (manualChecks.filter((item) => item.status === "pass").length / manualChecks.length) * 100
      )
    : 0;

  return {
    overallScore: computeOverallCertificationScore(subsystemScores),
    releaseBlocked,
    passCount,
    warningCount,
    failedCount,
    automatedPassRate,
    manualPassRate
  };
}

export function formatCertificationSummaryLine(summary) {
  const blockLabel = summary.releaseBlocked ? "RELEASE BLOCKED" : "RELEASE CLEARED";
  return `${summary.overallScore}% overall · ${blockLabel} · ${summary.passCount} pass · ${summary.warningCount} warning · ${summary.failedCount} failed`;
}
