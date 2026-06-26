/**
 * Institutional Readiness Audit — server-side audit logic.
 */

export const READINESS_VERIFICATION_DB_TABLES = [
  "readiness_subsystem_contracts",
  "readiness_verification_checks",
  "readiness_dependency_links",
  "readiness_critical_issues",
  "readiness_verification_runs",
  "readiness_snapshots",
  "readiness_audit_domains",
  "readiness_trend_snapshots",
  "readiness_audit_exports"
];

export const READINESS_AUDIT_DOMAINS = [
  "infrastructure",
  "security",
  "payments",
  "messaging",
  "matching",
  "concierge",
  "support",
  "operations",
  "research",
  "communities",
  "events",
  "documentation",
  "release",
  "backups",
  "monitoring",
  "abuse",
  "performance"
];

export const READINESS_EXPORT_TYPES = ["founder-report", "board-report", "launch-report"];

export function getReadinessVerificationDatabaseTableManifest() {
  return READINESS_VERIFICATION_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "readiness",
    migrationRef: "0020_institutional_readiness_verification.sql",
    hasUuidPrimaryKey: true,
    auditFields: ["created_at", "updated_at", "created_by", "updated_by"]
  }));
}

export function canAccessReadinessVerification(permissions = []) {
  return (
    permissions.includes("ManageOperations") ||
    permissions.includes("ViewExecutiveDashboard") ||
    permissions.includes("SystemAdministration")
  );
}

const RESULT_RANK = { healthy: 0, warning: 1, unknown: 2, critical: 3 };

export function scoreToReadinessResult(score, hasCriticalIssue) {
  if (hasCriticalIssue || score < 50) return "critical";
  if (score < 75) return "warning";
  if (score < 0) return "unknown";
  return "healthy";
}

export function buildInstitutionReadinessScore(subsystems) {
  if (!subsystems.length) return 0;
  const total = subsystems.reduce((sum, item) => sum + item.score, 0);
  const criticalCount = subsystems.filter((item) => item.status === "critical").length;
  const base = Math.round(total / subsystems.length);
  return Math.max(0, base - criticalCount * 3);
}

export function buildReadinessTrend(overallScore, previousOverallScore) {
  const deltaPercent = previousOverallScore
    ? Math.round(((overallScore - previousOverallScore) / previousOverallScore) * 100)
    : 0;
  let direction = "flat";
  if (deltaPercent > 1) direction = "up";
  else if (deltaPercent < -1) direction = "down";
  return { overallScore, previousScore: previousOverallScore, deltaPercent, direction };
}

export function buildBlockerCounts(blockers) {
  return {
    critical: blockers.filter((item) => item.severity === "critical").length,
    high: blockers.filter((item) => item.severity === "high").length,
    medium: blockers.filter((item) => item.severity === "medium").length,
    low: blockers.filter((item) => item.severity === "low").length
  };
}

export function canSubsystemReportReady(subsystem, upstreamStatuses, dependencies) {
  const criticalDeps = dependencies.filter(
    (dep) => dep.downstreamId === subsystem.id && dep.critical
  );
  for (const dep of criticalDeps) {
    const upstream = upstreamStatuses[dep.upstreamId];
    if (upstream === "critical" || upstream === "warning") return false;
  }
  return subsystem.status === "healthy";
}

export function propagateDependencyFailures(subsystems, dependencies) {
  const statusMap = Object.fromEntries(subsystems.map((item) => [item.id, item.status]));
  const updated = subsystems.map((item) => ({ ...item, failedDependencies: [...item.failedDependencies] }));
  const updatedDeps = dependencies.map((dep) => ({ ...dep }));

  for (const dep of updatedDeps) {
    if (!dep.critical) continue;
    const upstreamStatus = statusMap[dep.upstreamId];
    dep.upstreamStatus = upstreamStatus;
    dep.downstreamStatus = statusMap[dep.downstreamId];

    if (upstreamStatus !== "critical" && upstreamStatus !== "warning") continue;

    dep.surfaced = true;
    const downstreamIdx = updated.findIndex((item) => item.id === dep.downstreamId);
    if (downstreamIdx === -1) continue;

    const downstream = updated[downstreamIdx];
    const failedDeps = [...new Set([...downstream.failedDependencies, dep.upstreamId])];
    let newStatus = downstream.status;

    if (upstreamStatus === "critical") {
      newStatus = "critical";
    } else if (downstream.status === "healthy") {
      newStatus = "warning";
    }

    updated[downstreamIdx] = {
      ...downstream,
      status: newStatus,
      failedDependencies: failedDeps,
      summary: `${downstream.summary} · Upstream ${dep.upstreamId}: ${upstreamStatus}`
    };
    statusMap[dep.downstreamId] = newStatus;
    dep.downstreamStatus = newStatus;
  }

  return { subsystems: updated, dependencies: updatedDeps };
}

export function buildGoNoGoRecommendation(score, criticalIssues, warnings, blockers = []) {
  const criticalBlockers = blockers.filter((item) => item.severity === "critical").length;

  let verdict = "go-with-conditions";
  let detail =
    "Platform meets core readiness thresholds with tracked conditions. Resolve medium blockers before scale events.";

  if (criticalIssues.length > 0 || criticalBlockers > 0 || score < 70) {
    verdict = "no-go";
    detail =
      "Critical blockers prevent safe institutional launch. Resolve all critical issues before go-live.";
  } else if (warnings.length >= 3 || score < 88) {
    verdict = "go-with-conditions";
    detail =
      "Platform may proceed with conditions — high-priority blockers must be cleared before full launch.";
  } else if (warnings.length === 0 && score >= 90) {
    verdict = "go";
    detail =
      "All audit domains meet readiness thresholds. Automatic recommendation: GO for institutional launch.";
  }

  return {
    verdict,
    label: {
      go: "GO",
      "go-with-conditions": "GO WITH CONDITIONS",
      "no-go": "NO GO"
    }[verdict],
    detail,
    institutionReadinessScore: score
  };
}

export function formatReadinessSummaryLine(bundle) {
  const healthyCount = bundle.subsystems?.filter((item) => item.status === "healthy").length ?? 0;
  const warningCount = bundle.subsystems?.filter((item) => item.status === "warning").length ?? 0;
  const criticalCount = bundle.subsystems?.filter((item) => item.status === "critical").length ?? 0;
  const trend = bundle.trend?.direction ?? "flat";
  return `${healthyCount} healthy · ${warningCount} warning · ${criticalCount} critical · score ${bundle.institutionReadinessScore} · trend ${trend}`;
}

export function filterBlockersBySeverity(blockers, severity) {
  return blockers.filter((item) => item.severity === severity);
}

export function worstResult(a, b) {
  return RESULT_RANK[a] >= RESULT_RANK[b] ? a : b;
}
