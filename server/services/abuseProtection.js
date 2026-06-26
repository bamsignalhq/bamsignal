/**
 * Abuse Protection Center™ — server-side trust & safety helpers.
 */

export const ABUSE_PROTECTION_DB_TABLES = [
  "abuse_monitor_snapshots",
  "abuse_rate_limits",
  "abuse_blocks",
  "abuse_forensics",
  "abuse_reports"
];

const RISK_RANK = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

export function canAccessAbuseProtectionCenter(permissions = []) {
  return (
    permissions.includes("ManageSafety") ||
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration")
  );
}

export function abuseProtectionRouteRegistered(source) {
  return source.includes("/hard/abuse-protection") && source.includes("abuseprotection");
}

export function resolveWorstAbuseRiskLevel(levels) {
  if (!levels?.length) return "low";
  return levels.reduce((worst, current) => {
    return RISK_RANK[current] > RISK_RANK[worst] ? current : worst;
  }, "low");
}

export function buildAbuseProtectionSummaryLine(bundle) {
  const { summary } = bundle;
  return `${summary.blockedRequests24h} blocked · ${summary.suspiciousOpen} suspicious · ${summary.overallRisk} risk`;
}

export function getAbuseProtectionDatabaseTableManifest() {
  return ABUSE_PROTECTION_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "abuse-protection",
    migrationRef: "202606259100_abuse_protection_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at"]
  }));
}

export function countAbuseBlocksByType(blocks) {
  return blocks.reduce(
    (counts, block) => {
      counts[block.blockType] = (counts[block.blockType] ?? 0) + 1;
      return counts;
    },
    { temporary: 0, permanent: 0 }
  );
}

export function listOpenSuspiciousActivity(suspicious) {
  return suspicious.filter((item) => item.status === "open" || item.status === "reviewing");
}

export function topAbuseOffendingIps(ips, limit = 5) {
  return [...ips].sort((left, right) => right.blockedRequests - left.blockedRequests).slice(0, limit);
}
