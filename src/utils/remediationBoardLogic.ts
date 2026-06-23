import { REMEDIATION_CATEGORY_LABELS } from "../constants/remediationBoard";
import type {
  RemediationBoardMetrics,
  RemediationCategoryId,
  RemediationCategorySummary,
  RemediationFinding,
  RemediationSeverityId,
  RemediationStatusId
} from "../types/remediationBoard";

const OPEN_STATUSES = new Set<RemediationStatusId>(["open", "in-progress", "blocked"]);
const LAUNCH_BLOCKER_STATUSES = new Set<RemediationStatusId>(["open", "in-progress", "blocked"]);

export function isOpenStatus(status: RemediationStatusId): boolean {
  return OPEN_STATUSES.has(status);
}

export function isLaunchBlocker(finding: RemediationFinding): boolean {
  if (!finding.launchBlocker || finding.severity !== "P0") return false;
  return LAUNCH_BLOCKER_STATUSES.has(finding.status);
}

export function buildRemediationMetrics(findings: RemediationFinding[]): RemediationBoardMetrics {
  return {
    totalFindings: findings.length,
    openFindings: findings.filter((finding) => isOpenStatus(finding.status)).length,
    criticalFindings: findings.filter(
      (finding) => finding.severity === "P0" && isOpenStatus(finding.status)
    ).length,
    resolvedFindings: findings.filter((finding) => finding.status === "resolved").length,
    launchBlockers: findings.filter((finding) => isLaunchBlocker(finding)).length
  };
}

export function buildCategorySummaries(
  findings: RemediationFinding[]
): RemediationCategorySummary[] {
  const categories = Object.keys(REMEDIATION_CATEGORY_LABELS) as RemediationCategoryId[];

  return categories
    .map((category) => {
      const scoped = findings.filter((finding) => finding.category === category);
      if (!scoped.length) return null;

      return {
        category,
        label: REMEDIATION_CATEGORY_LABELS[category],
        open: scoped.filter((finding) => isOpenStatus(finding.status)).length,
        p0: scoped.filter((finding) => finding.severity === "P0").length,
        p1: scoped.filter((finding) => finding.severity === "P1").length,
        p2: scoped.filter((finding) => finding.severity === "P2").length,
        total: scoped.length
      };
    })
    .filter((summary): summary is RemediationCategorySummary => summary !== null)
    .sort((left, right) => right.open - left.open || right.p0 - left.p0);
}

export function countBySeverity(
  findings: RemediationFinding[],
  severity: RemediationSeverityId,
  openOnly = false
): number {
  return findings.filter(
    (finding) =>
      finding.severity === severity && (!openOnly || isOpenStatus(finding.status))
  ).length;
}

export function sortFindings(findings: RemediationFinding[]): RemediationFinding[] {
  const severityRank: Record<RemediationSeverityId, number> = { P0: 0, P1: 1, P2: 2 };
  const statusRank: Record<RemediationStatusId, number> = {
    open: 0,
    blocked: 1,
    "in-progress": 2,
    deferred: 3,
    resolved: 4
  };

  return [...findings].sort((left, right) => {
    const severityDelta = severityRank[left.severity] - severityRank[right.severity];
    if (severityDelta !== 0) return severityDelta;
    const statusDelta = statusRank[left.status] - statusRank[right.status];
    if (statusDelta !== 0) return statusDelta;
    return left.title.localeCompare(right.title);
  });
}
