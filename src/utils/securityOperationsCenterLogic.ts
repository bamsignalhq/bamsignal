import type {
  SecurityOpsEvent,
  SecurityOpsIncident,
  SecurityOpsScore,
  SecurityOperationsCenterBundle
} from "../types/securityOperationsCenter";
import type { SecurityOpsModuleId, SecurityOpsToolId } from "../constants/securityOperationsCenter";

export function computeOverallSecurityScore(scores: SecurityOpsScore[]) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length);
}

export function buildSecurityOpsSummary(
  scores: SecurityOpsScore[],
  events: SecurityOpsEvent[],
  incidents: SecurityOpsIncident[]
): SecurityOperationsCenterBundle["summary"] {
  const openIncidents = incidents.filter((item) => item.status !== "resolved").length;
  const criticalEvents = events.filter((item) => item.severity === "critical").length;
  const blockedAttempts = events.filter(
    (item) =>
      item.moduleId === "brute-force-attempts" || item.moduleId === "rate-limit-triggers"
  ).length;

  return {
    overallScore: computeOverallSecurityScore(scores),
    openIncidents,
    events24h: events.length,
    criticalEvents,
    blockedAttempts
  };
}

export function filterEventsByModule(events: SecurityOpsEvent[], moduleId: SecurityOpsModuleId) {
  return events.filter((item) => item.moduleId === moduleId);
}

export function buildSecurityOperationsCenterBundle(input: {
  scores: SecurityOpsScore[];
  events: SecurityOpsEvent[];
  incidents: SecurityOpsIncident[];
  recentActions: SecurityOperationsCenterBundle["recentActions"];
}): SecurityOperationsCenterBundle {
  return {
    generatedAt: new Date().toISOString(),
    summary: buildSecurityOpsSummary(input.scores, input.events, input.incidents),
    scores: input.scores,
    events: input.events,
    incidents: input.incidents,
    recentActions: input.recentActions
  };
}

export function buildSecurityToolResult(toolId: SecurityOpsToolId, target: string, actor: string) {
  const labels: Record<SecurityOpsToolId, string> = {
    "invalidate-sessions": `Sessions invalidated for ${target}`,
    "force-logout": `Force logout executed for ${target}`,
    "rotate-secrets": `Secret rotation queued by ${actor}`,
    "lock-account": `Account locked: ${target}`,
    "temporary-block": `Temporary block applied to ${target}`,
    "permanent-block": `Permanent block applied to ${target}`
  };
  return labels[toolId];
}

export function formatSecurityOpsSummaryLine(summary: SecurityOperationsCenterBundle["summary"]) {
  return `${summary.overallScore}% security score · ${summary.openIncidents} open incidents · ${summary.criticalEvents} critical events · ${summary.blockedAttempts} blocked attempts`;
}
