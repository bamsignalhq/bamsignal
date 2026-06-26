/**
 * Security Operations Center — server-side platform security logic.
 */

export const SECURITY_OPERATIONS_CENTER_DB_TABLES = [
  "security_ops_events",
  "security_ops_scores",
  "security_ops_incidents",
  "security_ops_actions",
  "security_ops_timeline"
];

export const SECURITY_OPS_MODULES = [
  "authentication",
  "suspicious-logins",
  "permission-changes",
  "privilege-escalation",
  "api-abuse",
  "token-anomalies",
  "session-anomalies",
  "brute-force-attempts",
  "rate-limit-triggers",
  "admin-activity"
];

export const SECURITY_OPS_SCORE_DOMAINS = [
  "authentication",
  "authorization",
  "infrastructure",
  "payments",
  "notifications",
  "storage",
  "database"
];

export const SECURITY_OPS_TOOLS = [
  "invalidate-sessions",
  "force-logout",
  "rotate-secrets",
  "lock-account",
  "temporary-block",
  "permanent-block"
];

export const SECURITY_INCIDENT_STATUSES = ["open", "investigating", "contained", "resolved"];

export function getSecurityOperationsCenterDatabaseTableManifest() {
  return SECURITY_OPERATIONS_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "security-operations",
    migrationRef: "202606261700_security_operations_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function securityOperationsRouteRegistered(source) {
  return source.includes("/hard/security") && source.includes("securityops");
}

export function canAccessSecurityOperationsCenter(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("ManageSafety") ||
    permissions.includes("SystemAdministration")
  );
}

export function computeOverallSecurityScore(scores) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length);
}

export function buildSecurityOpsSummary(scores, events, incidents) {
  const openIncidents = incidents.filter((item) => item.status !== "resolved").length;
  const criticalEvents = events.filter((item) => item.severity === "critical").length;
  const blockedAttempts = events.filter(
    (item) => item.moduleId === "brute-force-attempts" || item.moduleId === "rate-limit-triggers"
  ).length;

  return {
    overallScore: computeOverallSecurityScore(scores),
    openIncidents,
    events24h: events.length,
    criticalEvents,
    blockedAttempts
  };
}

export function filterEventsByModule(events, moduleId) {
  return events.filter((item) => item.moduleId === moduleId);
}

export function formatSecurityOpsSummaryLine(summary) {
  return `${summary.overallScore}% security score · ${summary.openIncidents} open incidents · ${summary.criticalEvents} critical events · ${summary.blockedAttempts} blocked attempts`;
}
