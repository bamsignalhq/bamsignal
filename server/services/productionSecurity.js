/**
 * Production security hardening — server-side verification helpers.
 */

import { hasSecurityHeaders, SECURITY_RESPONSE_HEADERS } from "./securityHeaders.js";

export { SECURITY_RESPONSE_HEADERS, hasSecurityHeaders };

export function canAccessSecurityDashboard(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ManageSafety")
  );
}

export function buildSecurityScore(domains) {
  if (!domains.length) return 0;
  const total = domains.reduce((sum, item) => sum + item.score, 0);
  const criticalCount = domains.filter((item) => item.status === "critical").length;
  return Math.max(0, Math.round(total / domains.length) - criticalCount * 4);
}

export function scoreToSecurityStatus(score, hasCritical) {
  if (hasCritical || score < 55) return "critical";
  if (score < 80) return "warning";
  return "secure";
}

export function adminSecretAcceptedViaHeaderOnly(source) {
  const headerOnly =
    source.includes("extractHeaderSecret(req, ADMIN_SECRET_HEADER)") ||
    source.includes("ADMIN_SECRET_HEADER") ||
    source.includes('req.headers["x-bamsignal-secret"]');
  return (
    headerOnly &&
    !source.includes("req.query.secret") &&
    !source.includes("req.body?.secret")
  );
}

export function formatSecuritySummaryLine(report) {
  return `${report.passedCheckCount} passed · ${report.warningIssueCount} warnings · ${report.criticalIssueCount} critical · score ${report.overallScore}`;
}
