/**
 * Institutional Readiness Verification Engine™ — server-side verification logic.
 */

export const READINESS_VERIFICATION_DB_TABLES = [
  "readiness_subsystem_contracts",
  "readiness_verification_checks",
  "readiness_dependency_links",
  "readiness_critical_issues",
  "readiness_verification_runs",
  "readiness_snapshots"
];

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

export function buildGoNoGoRecommendation(score, criticalIssues, warnings) {
  let verdict = "go-with-conditions";
  let detail =
    "Core subsystems report operational readiness with tracked warnings. Re-run verification before scale events.";

  if (criticalIssues.length > 0 || score < 70) {
    verdict = "no-go";
    detail =
      "Critical subsystem failures block safe institutional launch. Resolve blockers before go-live.";
  } else if (warnings.length >= 5 || score < 82) {
    verdict = "no-go-member-only";
    detail =
      "Member platform may support phased growth; full institutional operations are not verified ready.";
  } else if (warnings.length === 0 && score >= 90) {
    verdict = "go";
    detail =
      "All verified subsystems meet readiness thresholds. Continue continuous verification monitoring.";
  }

  return {
    verdict,
    label: {
      go: "GO",
      "go-with-conditions": "GO — with conditions",
      "no-go-member-only": "NO-GO — member app only",
      "no-go": "NO-GO"
    }[verdict],
    detail,
    institutionReadinessScore: score
  };
}

export function formatReadinessSummaryLine(summary) {
  return `${summary.healthyCount} healthy · ${summary.warningCount} warning · ${summary.criticalCount} critical · score ${summary.score}`;
}

export function worstResult(a, b) {
  return RESULT_RANK[a] >= RESULT_RANK[b] ? a : b;
}
