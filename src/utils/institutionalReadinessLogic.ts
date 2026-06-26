import {
  GO_NO_GO_LABELS,
  READINESS_AUDIT_DOMAIN_LABELS
} from "../constants/institutionalReadiness";
import {
  READINESS_AUDIT_DOMAIN_BASELINES,
  READINESS_AUDIT_DOMAIN_SUBSYSTEM_MAP
} from "../data/institutionalReadinessSeed";
import type {
  GoNoGoVerdictId,
  InstitutionalReadinessVerificationBundle,
  ReadinessAuditDomainId,
  ReadinessAuditDomainScore,
  ReadinessBlocker,
  ReadinessBlockerCounts,
  ReadinessBlockerSeverityId,
  ReadinessCriticalIssue,
  ReadinessDependencyLink,
  ReadinessExportTypeId,
  ReadinessGoNoGoRecommendation,
  ReadinessRecommendedAction,
  ReadinessResultId,
  ReadinessSubsystemHealth,
  ReadinessSubsystemId,
  ReadinessTrendDirectionId,
  ReadinessTrendSnapshot,
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
  warnings: ReadinessCriticalIssue[],
  blockers: ReadinessBlocker[]
): ReadinessGoNoGoRecommendation {
  const criticalBlockers = blockers.filter((item) => item.severity === "critical").length;

  let verdict: GoNoGoVerdictId = "go-with-conditions";
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
  const trendLabel =
    bundle.trend.direction === "up"
      ? `↑ ${bundle.trend.deltaPercent}%`
      : bundle.trend.direction === "down"
        ? `↓ ${Math.abs(bundle.trend.deltaPercent)}%`
        : "flat";
  return `${healthyCount} healthy · ${warningCount} warning · ${criticalCount} critical · score ${bundle.institutionReadinessScore} · trend ${trendLabel}`;
}

const SUBSYSTEM_TO_DOMAIN: Partial<Record<ReadinessSubsystemId, ReadinessAuditDomainId>> = {};
for (const [domainId, subsystemIds] of Object.entries(READINESS_AUDIT_DOMAIN_SUBSYSTEM_MAP) as Array<
  [ReadinessAuditDomainId, ReadinessSubsystemId[]]
>) {
  for (const subsystemId of subsystemIds) {
    if (!SUBSYSTEM_TO_DOMAIN[subsystemId]) {
      SUBSYSTEM_TO_DOMAIN[subsystemId] = domainId;
    }
  }
}

export function mapSubsystemToAuditDomain(
  subsystemId: ReadinessSubsystemId
): ReadinessAuditDomainId {
  return SUBSYSTEM_TO_DOMAIN[subsystemId] ?? "operations";
}

export function buildAuditDomainScores(
  subsystems: ReadinessSubsystemHealth[],
  previousDomainScores: Partial<Record<ReadinessAuditDomainId, number>> = {}
): ReadinessAuditDomainScore[] {
  const subsystemMap = Object.fromEntries(subsystems.map((item) => [item.id, item]));

  return (Object.keys(READINESS_AUDIT_DOMAIN_LABELS) as ReadinessAuditDomainId[]).map((domainId) => {
    const mapped = READINESS_AUDIT_DOMAIN_SUBSYSTEM_MAP[domainId] ?? [];
    const scores = mapped
      .map((id) => subsystemMap[id]?.score)
      .filter((value): value is number => typeof value === "number");
    const baseline = READINESS_AUDIT_DOMAIN_BASELINES[domainId];
    const score =
      scores.length > 0
        ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
        : (baseline ?? 80);

    const issueCount = mapped.reduce((sum, id) => sum + (subsystemMap[id]?.issueCount ?? 0), 0);
    const hasCritical = mapped.some((id) => subsystemMap[id]?.status === "critical");
    const status = scoreToReadinessResult(score, hasCritical);
    const previous = previousDomainScores[domainId] ?? score;
    const trendDelta = previous ? Math.round(((score - previous) / previous) * 100) : 0;
    let trend: ReadinessTrendDirectionId = "flat";
    if (trendDelta > 1) trend = "up";
    else if (trendDelta < -1) trend = "down";

    const summaries = mapped
      .map((id) => subsystemMap[id]?.summary)
      .filter(Boolean)
      .slice(0, 1);

    return {
      id: domainId,
      label: READINESS_AUDIT_DOMAIN_LABELS[domainId],
      score,
      status,
      trend,
      trendDelta,
      blockerCount: issueCount,
      summary: summaries[0] ?? `${READINESS_AUDIT_DOMAIN_LABELS[domainId]} audit complete.`
    };
  });
}

export function buildReadinessTrend(
  overallScore: number,
  previousOverallScore: number
): ReadinessTrendSnapshot {
  const deltaPercent = previousOverallScore
    ? Math.round(((overallScore - previousOverallScore) / previousOverallScore) * 100)
    : 0;
  let direction: ReadinessTrendDirectionId = "flat";
  if (deltaPercent > 1) direction = "up";
  else if (deltaPercent < -1) direction = "down";

  return {
    overallScore,
    previousScore: previousOverallScore,
    deltaPercent,
    direction,
    recordedAt: new Date().toISOString()
  };
}

export function buildReadinessBlockers(
  criticalIssues: ReadinessCriticalIssue[],
  warnings: ReadinessCriticalIssue[],
  recommendedActions: ReadinessRecommendedAction[],
  auditDomains: ReadinessAuditDomainScore[]
): ReadinessBlocker[] {
  const blockers: ReadinessBlocker[] = [];

  for (const issue of criticalIssues) {
    blockers.push({
      id: issue.id,
      blockerRef: issue.issueRef,
      title: issue.title,
      detail: issue.detail,
      severity: "critical",
      auditDomainId: mapSubsystemToAuditDomain(issue.subsystemId)
    });
  }

  for (const [index, warning] of warnings.entries()) {
    blockers.push({
      id: warning.id,
      blockerRef: warning.issueRef,
      title: warning.title,
      detail: warning.detail,
      severity: index < 3 ? "high" : "medium",
      auditDomainId: mapSubsystemToAuditDomain(warning.subsystemId)
    });
  }

  for (const domain of auditDomains.filter((item) => item.status === "warning").slice(0, 2)) {
    blockers.push({
      id: `blk_domain_${domain.id}`,
      blockerRef: `BLK-${domain.id.toUpperCase()}`,
      title: `${domain.label} below threshold`,
      detail: domain.summary,
      severity: "medium",
      auditDomainId: domain.id
    });
  }

  for (const domain of auditDomains.filter((item) => item.score >= 90).slice(0, 2)) {
    blockers.push({
      id: `blk_low_${domain.id}`,
      blockerRef: `LOW-${domain.id.toUpperCase()}`,
      title: `${domain.label} optimization opportunity`,
      detail: "No blocker — track for continuous improvement.",
      severity: "low",
      auditDomainId: domain.id
    });
  }

  for (const action of recommendedActions.filter((item) => item.priority === "high").slice(0, 2)) {
    blockers.push({
      id: action.id,
      blockerRef: action.actionRef,
      title: action.title,
      detail: action.detail,
      severity: "high",
      auditDomainId: "operations"
    });
  }

  return blockers;
}

export function buildBlockerCounts(blockers: ReadinessBlocker[]): ReadinessBlockerCounts {
  return {
    critical: blockers.filter((item) => item.severity === "critical").length,
    high: blockers.filter((item) => item.severity === "high").length,
    medium: blockers.filter((item) => item.severity === "medium").length,
    low: blockers.filter((item) => item.severity === "low").length
  };
}

export function filterBlockersBySeverity(
  blockers: ReadinessBlocker[],
  severity: ReadinessBlockerSeverityId
): ReadinessBlocker[] {
  return blockers.filter((item) => item.severity === severity);
}

export function buildReadinessExportSummary(
  exportType: ReadinessExportTypeId,
  bundle: InstitutionalReadinessVerificationBundle
): string {
  const verdict = bundle.recommendation.label;
  const domains = bundle.auditDomains.length;
  const blockers = bundle.blockerCounts.critical + bundle.blockerCounts.high;

  switch (exportType) {
    case "founder-report":
      return `Founder report — ${verdict} · score ${bundle.institutionReadinessScore}/100 · ${domains} domains · ${blockers} priority blockers`;
    case "board-report":
      return `Board report — ${verdict} · trend ${bundle.trend.direction} ${bundle.trend.deltaPercent}% · ${bundle.blockerCounts.medium} medium items`;
    case "launch-report":
      return `Launch report — ${verdict} · ${bundle.passedChecks.length} checks passed · ${bundle.criticalIssues.length} critical issues`;
    default:
      return `Readiness export — score ${bundle.institutionReadinessScore}`;
  }
}
