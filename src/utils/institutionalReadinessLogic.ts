import { GO_NO_GO_LABELS } from "../constants/institutionalReadiness";
import type {
  GoNoGoVerdictId,
  InstitutionalReadinessVerificationBundle,
  ReadinessCriticalIssue,
  ReadinessDependencyLink,
  ReadinessGoNoGoRecommendation,
  ReadinessRecommendedAction,
  ReadinessResultId,
  ReadinessSubsystemHealth,
  ReadinessSubsystemId,
  ReadinessVerificationCheck
} from "../types/institutionalReadiness";
import type { RemediationFinding } from "../types/remediationBoard";
import { isOpenStatus } from "./remediationBoardLogic";

export function scoreToReadinessResult(score: number, hasCriticalIssue: boolean): ReadinessResultId {
  if (hasCriticalIssue || score < 50) return "critical";
  if (score < 75) return "warning";
  return "healthy";
}

export function buildInstitutionReadinessScore(subsystems: ReadinessSubsystemHealth[]): number {
  if (!subsystems.length) return 0;
  const total = subsystems.reduce((sum, item) => sum + item.score, 0);
  const criticalCount = subsystems.filter((item) => item.status === "critical").length;
  const base = Math.round(total / subsystems.length);
  return Math.max(0, base - criticalCount * 3);
}

export function propagateDependencyFailures(
  subsystems: ReadinessSubsystemHealth[],
  dependencies: ReadinessDependencyLink[]
): { subsystems: ReadinessSubsystemHealth[]; dependencies: ReadinessDependencyLink[] } {
  const statusMap = Object.fromEntries(subsystems.map((item) => [item.id, item.status]));
  const updated = subsystems.map((item) => ({
    ...item,
    failedDependencies: [...item.failedDependencies]
  }));
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

function mapFindingSubsystem(finding: RemediationFinding): ReadinessSubsystemId {
  switch (finding.category) {
    case "routes":
      return "routing";
    case "permissions":
      return "permissions";
    case "journey-integrity":
      return "journey-engine";
    case "persistence":
      return "supabase";
    case "safety":
      return "security";
    case "executive":
      return "executive-dashboard";
    case "launch":
      return "operations";
    case "notifications":
      return "notifications";
    case "crm":
      return "crm";
    default:
      return "operations";
  }
}

export function buildIssuesFromFindings(findings: RemediationFinding[]): {
  criticalIssues: ReadinessCriticalIssue[];
  warnings: ReadinessCriticalIssue[];
} {
  const openFindings = findings.filter((finding) => isOpenStatus(finding.status));

  const criticalIssues = openFindings
    .filter((finding) => finding.severity === "P0")
    .map((finding) => ({
      id: finding.id,
      issueRef: `ISS-${finding.id.toUpperCase()}`,
      title: finding.title,
      detail: finding.detail,
      subsystemId: mapFindingSubsystem(finding),
      auditPath: finding.auditPath
    }));

  const warnings = openFindings
    .filter((finding) => finding.severity === "P1" || finding.severity === "P2")
    .map((finding) => ({
      id: finding.id,
      issueRef: `WRN-${finding.id.toUpperCase()}`,
      title: finding.title,
      detail: finding.detail,
      subsystemId: mapFindingSubsystem(finding),
      auditPath: finding.auditPath
    }));

  return { criticalIssues, warnings };
}

export function buildRecommendedActions(
  criticalIssues: ReadinessCriticalIssue[],
  warnings: ReadinessCriticalIssue[],
  subsystems: ReadinessSubsystemHealth[]
): ReadinessRecommendedAction[] {
  const actions: ReadinessRecommendedAction[] = [];

  for (const issue of criticalIssues.slice(0, 5)) {
    actions.push({
      id: `act_${issue.id}`,
      actionRef: `ACT-${issue.id.toUpperCase()}`,
      title: `Resolve: ${issue.title}`,
      detail: issue.detail,
      priority: "critical"
    });
  }

  for (const subsystem of subsystems.filter((item) => item.status === "critical").slice(0, 3)) {
    actions.push({
      id: `act_sub_${subsystem.id}`,
      actionRef: `ACT-SUB-${subsystem.id.toUpperCase()}`,
      title: `Restore ${subsystem.label} readiness`,
      detail: subsystem.summary,
      priority: "high"
    });
  }

  for (const warning of warnings.slice(0, 3)) {
    actions.push({
      id: `act_warn_${warning.id}`,
      actionRef: `ACT-WRN-${warning.id.toUpperCase()}`,
      title: `Review: ${warning.title}`,
      detail: warning.detail,
      priority: "medium"
    });
  }

  return actions;
}

export function buildGoNoGoRecommendation(
  score: number,
  criticalIssues: ReadinessCriticalIssue[],
  warnings: ReadinessCriticalIssue[]
): ReadinessGoNoGoRecommendation {
  let verdict: GoNoGoVerdictId = "go-with-conditions";
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
    label: GO_NO_GO_LABELS[verdict],
    detail,
    institutionReadinessScore: score
  };
}

export function partitionChecks(checks: ReadinessVerificationCheck[]): {
  passedChecks: ReadinessVerificationCheck[];
  failedChecks: ReadinessVerificationCheck[];
} {
  return {
    passedChecks: checks.filter((check) => check.passed),
    failedChecks: checks.filter((check) => !check.passed)
  };
}

export function formatReadinessSummaryLine(bundle: InstitutionalReadinessVerificationBundle): string {
  const healthyCount = bundle.subsystems.filter((item) => item.status === "healthy").length;
  const warningCount = bundle.subsystems.filter((item) => item.status === "warning").length;
  const criticalCount = bundle.subsystems.filter((item) => item.status === "critical").length;
  return `${healthyCount} healthy · ${warningCount} warning · ${criticalCount} critical · score ${bundle.institutionReadinessScore}`;
}
