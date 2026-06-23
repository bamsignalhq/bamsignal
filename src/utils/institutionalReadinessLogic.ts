import { GO_NO_GO_LABELS } from "../constants/institutionalReadiness";
import type {
  GoNoGoVerdictId,
  HealthCategory,
  HealthStatusId,
  InstitutionalReadinessReport,
  LaunchDecision,
  ReadinessRiskItem
} from "../types/institutionalReadiness";
import type { RemediationFinding } from "../types/remediationBoard";
import { isOpenStatus } from "./remediationBoardLogic";

export function scoreToHealthStatus(score: number, hasCriticalIssue: boolean): HealthStatusId {
  if (hasCriticalIssue || score < 55) return "critical";
  if (score < 85) return "partial";
  return "healthy";
}

export function buildOverallScore(sections: HealthCategory[]): number {
  if (!sections.length) return 0;
  const total = sections.reduce((sum, section) => sum + section.score, 0);
  return Math.round(total / sections.length);
}

function mapFindingSection(finding: RemediationFinding): ReadinessRiskItem["sectionId"] {
  switch (finding.category) {
    case "routes":
      return "routes";
    case "permissions":
      return "permissions";
    case "journey-integrity":
      return "journey";
    case "persistence":
      return "persistence";
    case "safety":
      return "safety";
    case "executive":
      return "executive";
    case "launch":
      return "launch";
    case "operations":
    case "crm":
    case "notifications":
    default:
      return "operations";
  }
}

function mapFindingToRisk(
  finding: RemediationFinding,
  severity: ReadinessRiskItem["severity"]
): ReadinessRiskItem {
  return {
    id: finding.id,
    title: finding.title,
    detail: finding.detail,
    severity,
    sectionId: mapFindingSection(finding),
    auditPath: finding.auditPath
  };
}

export function buildRiskRegistry(findings: RemediationFinding[]): Pick<
  InstitutionalReadinessReport,
  "criticalBlockers" | "highRisks" | "mediumRisks" | "resolvedRisks"
> {
  const openFindings = findings.filter((finding) => isOpenStatus(finding.status));
  const resolvedFindings = findings.filter((finding) => finding.status === "resolved");

  return {
    criticalBlockers: openFindings
      .filter((finding) => finding.severity === "P0")
      .map((finding) => mapFindingToRisk(finding, "critical")),
    highRisks: openFindings
      .filter((finding) => finding.severity === "P1")
      .map((finding) => mapFindingToRisk(finding, "high")),
    mediumRisks: openFindings
      .filter((finding) => finding.severity === "P2")
      .map((finding) => mapFindingToRisk(finding, "medium")),
    resolvedRisks: resolvedFindings.map((finding) =>
      mapFindingToRisk(
        finding,
        finding.severity === "P0" ? "critical" : finding.severity === "P1" ? "high" : "medium"
      )
    )
  };
}

export function buildLaunchDecision(
  overallScore: number,
  criticalBlockers: ReadinessRiskItem[],
  highRisks: ReadinessRiskItem[]
): LaunchDecision {
  let verdict: GoNoGoVerdictId = "go-with-conditions";
  let detail =
    "Member app core paths are wired. Institutional concierge pipeline is functional in demo/staging mode but requires persistence and security hardening before 10,000-member operational load.";

  if (criticalBlockers.length > 0 || overallScore < 70) {
    verdict = "no-go";
    detail =
      "Critical security and persistence blockers prevent safe 10,000-member institutional operations. Member-facing discovery/auth can proceed in controlled launch with fixes tracked.";
  } else if (highRisks.length >= 3 || overallScore < 82) {
    verdict = "no-go-member-only";
    detail =
      "Core member platform may support phased member growth, but full Signal Concierge institutional operations at 10k scale are not ready.";
  } else if (highRisks.length === 0 && overallScore >= 90) {
    verdict = "go";
    detail =
      "Institutional health sections meet launch thresholds. Continue monitoring remediation board and re-run audits before scale events.";
  }

  return {
    verdict,
    label: GO_NO_GO_LABELS[verdict],
    detail,
    overallScore
  };
}
