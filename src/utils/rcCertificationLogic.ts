import type { RcCertificationReport, RcCertificationSnapshot } from "../types/rcCertification";

export function formatRcCertificationSummary(
  report: Pick<
    RcCertificationReport,
    "releaseDecisionLabel" | "overallScore" | "passedChecks" | "blockers"
  >
): string {
  return `${report.releaseDecisionLabel} · ${report.overallScore}% · ${report.passedChecks} passed · ${report.blockers.length} blockers`;
}

export function buildRcCertificationReport(snapshot: RcCertificationSnapshot): RcCertificationReport {
  const report: RcCertificationReport = {
    ...snapshot,
    summaryLine: "",
    source: "store"
  };
  report.summaryLine = formatRcCertificationSummary(report);
  return report;
}
