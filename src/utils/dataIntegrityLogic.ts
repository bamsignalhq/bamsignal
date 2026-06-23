import type {
  DataIntegrityCheckId,
  IntegrityCheck,
  IntegrityIssue,
  IntegrityStatusId,
  IntegritySummary
} from "../types/dataIntegrity";

const STATUS_RANK: Record<IntegrityStatusId, number> = {
  healthy: 0,
  warning: 1,
  critical: 2
};

export function statusFromIssues(issues: IntegrityIssue[]): IntegrityStatusId {
  if (issues.some((issue) => issue.severity === "critical")) return "critical";
  if (issues.length > 0) return "warning";
  return "healthy";
}

export function scoreFromStatus(status: IntegrityStatusId): number {
  if (status === "healthy") return 100;
  if (status === "warning") return 72;
  return 28;
}

export function buildCheckResult(
  id: DataIntegrityCheckId,
  label: string,
  issues: IntegrityIssue[],
  healthySummary: string
): IntegrityCheck {
  const status = statusFromIssues(issues);
  return {
    id,
    label,
    status,
    score: scoreFromStatus(status),
    summary: issues.length ? `${issues.length} integrity issue(s) detected.` : healthySummary,
    issueCount: issues.length,
    issues
  };
}

export function buildIntegritySummary(checks: IntegrityCheck[]): IntegritySummary {
  const overallStatus = checks.reduce<IntegrityStatusId>(
    (worst, check) => (STATUS_RANK[check.status] > STATUS_RANK[worst] ? check.status : worst),
    "healthy"
  );
  const totalIssues = checks.reduce((sum, check) => sum + check.issueCount, 0);
  const score =
    checks.length === 0
      ? 100
      : Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length);

  return {
    overallStatus,
    score,
    healthyChecks: checks.filter((check) => check.status === "healthy").length,
    warningChecks: checks.filter((check) => check.status === "warning").length,
    criticalChecks: checks.filter((check) => check.status === "critical").length,
    totalIssues
  };
}
