/**
 * Institutional Launch Control Center™ — server-side launch readiness logic.
 */

export const LAUNCH_CONTROL_CENTER_DB_TABLES = [
  "launch_readiness_items",
  "launch_checklist_entries",
  "launch_blockers",
  "launch_risks",
  "launch_dependencies",
  "launch_timeline_events"
];

export function getLaunchControlCenterDatabaseTableManifest() {
  return LAUNCH_CONTROL_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "launch-control",
    migrationRef: "0016_launch_control_center.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function canAccessLaunchControlCenter(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("SystemAdministration") ||
    permissions.includes("ViewExecutiveDashboard")
  );
}

export function buildLaunchControlSummary(readiness, checklist, blockers, risks, approvals) {
  const readyCount = checklist.filter((item) => item.status === "ready").length;
  const needsAttentionCount = checklist.filter((item) => item.status === "needs-attention").length;
  const blockedCount = checklist.filter((item) => item.status === "blocked").length;
  const notStartedCount = checklist.filter((item) => item.status === "not-started").length;
  const openBlockers = blockers.filter((item) => item.status === "open").length;
  const openRisks = risks.filter((item) => item.status === "open").length;
  const criticalIssues =
    blockers.filter((item) => item.status === "open" && item.severity === "critical").length +
    risks.filter((item) => item.status === "open" && item.severity === "critical").length;

  const avgScore = readiness.length
    ? Math.round(readiness.reduce((sum, item) => sum + (item.score ?? 0), 0) / readiness.length)
    : 0;

  const executiveApproved = approvals.some(
    (item) => item.role === "executive" && item.status === "approved"
  );
  const founderApproved = approvals.some(
    (item) => item.role === "founder" && item.status === "approved"
  );

  let goNoGoRecommendation = "conditional";
  if (criticalIssues > 0 || blockedCount > 2) goNoGoRecommendation = "no-go";
  else if (avgScore >= 85 && openBlockers === 0 && executiveApproved && founderApproved) {
    goNoGoRecommendation = "go";
  }

  return {
    overallReadinessPercent: avgScore,
    readyCount,
    needsAttentionCount,
    blockedCount,
    notStartedCount,
    openBlockers,
    openRisks,
    criticalIssues,
    executiveApproved,
    founderApproved,
    goNoGoRecommendation
  };
}

export function filterBlockersBySection(blockers, sectionId) {
  if (sectionId === "critical-blockers") {
    return blockers.filter((item) => item.status === "open");
  }
  return blockers;
}

export function filterRisksBySection(risks, sectionId) {
  if (sectionId === "open-risks") {
    return risks.filter((item) => item.status === "open");
  }
  if (sectionId === "resolved-risks") {
    return risks.filter((item) => item.status === "resolved");
  }
  return risks;
}

export function resolveLaunchBlocker(blocker, actor) {
  if (blocker.status === "resolved") {
    throw new Error("Launch control violation: blocker already resolved");
  }
  return {
    ...blocker,
    status: "resolved",
    resolvedAt: new Date().toISOString()
  };
}

export function recordLaunchApproval(approval, signedBy) {
  if (approval.status === "approved") {
    throw new Error("Launch control violation: already approved");
  }
  return {
    ...approval,
    status: "approved",
    signedBy,
    signedAt: new Date().toISOString()
  };
}

export function listOpenCriticalBlockers(blockers) {
  return blockers.filter(
    (item) => item.status === "open" && (item.severity === "critical" || item.severity === "high")
  );
}

export function formatLaunchSummaryLine(summary) {
  return `${summary.overallReadinessPercent}% readiness · ${summary.openBlockers} blockers · ${summary.openRisks} risks · ${summary.goNoGoRecommendation.toUpperCase()}`;
}
