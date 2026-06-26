/**
 * Launch Command Center™ — server-side launch command logic.
 */

export const LAUNCH_COMMAND_CENTER_DB_TABLES = [
  "launch_command_readiness_scores",
  "launch_command_blockers",
  "launch_command_section_snapshots",
  "launch_command_incidents",
  "launch_command_deployments"
];

export const LAUNCH_COMMAND_SECTIONS = [
  "launch-readiness",
  "production-health",
  "platform-health",
  "critical-services",
  "incidents",
  "current-deployments",
  "latest-release",
  "startup-performance",
  "otp-success-rate",
  "payment-success-rate",
  "notification-delivery",
  "database-health",
  "queue-health",
  "security-alerts",
  "abuse-alerts",
  "support-queue",
  "consultant-availability"
];

export const LAUNCH_READINESS_SCORE_DOMAINS = [
  "overall",
  "infrastructure",
  "security",
  "payments",
  "messaging",
  "matching",
  "consultations",
  "support",
  "operations"
];

export const LAUNCH_GO_NO_GO_OPTIONS = ["go", "go-with-warnings", "no-go"];

export function getLaunchCommandCenterDatabaseTableManifest() {
  return LAUNCH_COMMAND_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "launch-command",
    migrationRef: "202606261500_launch_command_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function launchCommandRouteRegistered(source) {
  return source.includes("/hard/launch-command") && source.includes("launchcommand");
}

export function canAccessLaunchCommandCenter(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function scoreToStatus(score) {
  if (score >= 90) return "healthy";
  if (score >= 80) return "warning";
  return "critical";
}

export function computeLaunchGoNoGo(scores, blockers) {
  const openBlockers = blockers.filter((item) => item.status === "open");
  const critical = openBlockers.filter((item) => item.severity === "critical");
  const high = openBlockers.filter((item) => item.severity === "high");
  const overall = scores.find((item) => item.id === "overall")?.score ?? 0;
  const minScore = scores.length ? Math.min(...scores.map((item) => item.score)) : 0;
  const reasoning = [];

  if (critical.length > 0) {
    reasoning.push(
      `${critical.length} critical blocker(s) open — launch would risk member safety, payments, or data integrity.`
    );
    return {
      recommendation: "no-go",
      reasoning,
      capacityHeadroom: "Not safe for 100,000 members today",
      lastEvaluatedAt: new Date().toISOString()
    };
  }

  if (overall < 75 || minScore < 65) {
    reasoning.push(
      `Overall readiness ${overall}% is below the 75% threshold required for 100,000 member load.`
    );
    return {
      recommendation: "no-go",
      reasoning,
      capacityHeadroom: "Not safe for 100,000 members today",
      lastEvaluatedAt: new Date().toISOString()
    };
  }

  if (high.length > 0 || overall < 88 || minScore < 82) {
    if (high.length > 0) {
      reasoning.push(`${high.length} high-severity blocker(s) require mitigation before full launch.`);
    }
    return {
      recommendation: "go-with-warnings",
      reasoning,
      capacityHeadroom: "Can serve 100,000 members with warnings — monitor consultations and support",
      lastEvaluatedAt: new Date().toISOString()
    };
  }

  reasoning.push("All critical services healthy and readiness scores above launch threshold.");
  return {
    recommendation: "go",
    reasoning,
    capacityHeadroom: "Can safely serve 100,000 members today",
    lastEvaluatedAt: new Date().toISOString()
  };
}

export function countBlockersBySeverity(blockers, severity) {
  return blockers.filter((item) => item.status === "open" && item.severity === severity).length;
}

export function formatLaunchGoNoGoLine(recommendation) {
  if (recommendation === "go") return "GO — platform cleared for 100,000 member load";
  if (recommendation === "go-with-warnings") return "GO WITH WARNINGS — launch with elevated monitoring";
  return "NO GO — resolve blockers before launch";
}
