import type {
  FounderCertificationReport,
  FounderCertificationSnapshot,
  FounderSubsystemScore
} from "../types/founderCertification";

export function formatFounderCertificationSummary(report: FounderCertificationReport): string {
  const critical = report.criticalIssues?.length ?? 0;
  const warnings = report.warnings?.length ?? 0;
  return `${report.releaseDecisionLabel} · ${report.overallScore}% · ${critical} critical · ${warnings} warnings`;
}

export function buildFounderCertificationReport(snapshot: FounderCertificationSnapshot): FounderCertificationReport {
  return {
    ...snapshot,
    summaryLine: formatFounderCertificationSummary(snapshot as FounderCertificationReport),
    exports: snapshot.exports ?? {
      json: "",
      markdown: "",
      founderPdf: "",
      boardPdf: ""
    },
    releaseDecisionDetail: snapshot.releaseDecisionDetail ?? "",
    source: "store"
  };
}

export function decisionBadgeStatus(decision: string): "consistent" | "review" | "inconsistent" {
  if (decision === "go") return "consistent";
  if (decision === "go-with-conditions") return "review";
  return "inconsistent";
}

export function subsystemStatusLabel(score: FounderSubsystemScore): string {
  return score.status;
}
