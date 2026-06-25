import type {
  LaunchApprovalRecord,
  LaunchBlockerRecord,
  LaunchChecklistEntry,
  LaunchControlSummary,
  LaunchReadinessItem,
  LaunchRiskRecord
} from "../types/launchControlCenter";
import type { LaunchControlSectionId } from "../constants/launchControlCenter";

export function buildLaunchControlSummary(
  readiness: LaunchReadinessItem[],
  checklist: LaunchChecklistEntry[],
  blockers: LaunchBlockerRecord[],
  risks: LaunchRiskRecord[],
  approvals: LaunchApprovalRecord[]
): LaunchControlSummary {
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
    ? Math.round(readiness.reduce((sum, item) => sum + item.score, 0) / readiness.length)
    : 0;

  const executiveApproved = approvals.some(
    (item) => item.role === "executive" && item.status === "approved"
  );
  const founderApproved = approvals.some(
    (item) => item.role === "founder" && item.status === "approved"
  );

  let goNoGoRecommendation: LaunchControlSummary["goNoGoRecommendation"] = "conditional";
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

export function filterBlockersBySection(
  blockers: LaunchBlockerRecord[],
  sectionId: LaunchControlSectionId
) {
  if (sectionId === "critical-blockers") {
    return blockers.filter((item) => item.status === "open");
  }
  return blockers;
}

export function filterRisksBySection(risks: LaunchRiskRecord[], sectionId: LaunchControlSectionId) {
  if (sectionId === "open-risks") {
    return risks.filter((item) => item.status === "open");
  }
  if (sectionId === "resolved-risks") {
    return risks.filter((item) => item.status === "resolved");
  }
  return risks;
}

export function resolveLaunchBlocker(blocker: LaunchBlockerRecord): LaunchBlockerRecord {
  if (blocker.status === "resolved") {
    throw new Error("Launch control violation: blocker already resolved");
  }
  return {
    ...blocker,
    status: "resolved",
    resolvedAt: new Date().toISOString()
  };
}

export function recordLaunchApproval(
  approval: LaunchApprovalRecord,
  signedBy: string
): LaunchApprovalRecord {
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

export function listOpenCriticalBlockers(blockers: LaunchBlockerRecord[]) {
  return blockers.filter(
    (item) => item.status === "open" && (item.severity === "critical" || item.severity === "high")
  );
}

export function formatLaunchSummaryLine(summary: LaunchControlSummary) {
  return `${summary.overallReadinessPercent}% readiness · ${summary.openBlockers} blockers · ${summary.openRisks} risks · ${summary.goNoGoRecommendation.toUpperCase()}`;
}
