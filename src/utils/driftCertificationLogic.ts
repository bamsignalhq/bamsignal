import type { DriftCertificationReport, DriftCertificationSnapshot } from "../types/driftCertification";

export function formatDriftCertificationSummary(
  report: Pick<
    DriftCertificationReport,
    "driftScore" | "counts" | "unexpectedDrift" | "passed"
  >
): string {
  return `Score ${report.driftScore}% · critical ${report.counts?.critical ?? 0} · drift ${report.unexpectedDrift} · ${report.passed ? "PASS" : "BLOCKED"}`;
}

export function buildDriftCertificationReport(
  snapshot: DriftCertificationSnapshot
): DriftCertificationReport {
  const report: DriftCertificationReport = {
    ...snapshot,
    summaryLine: "",
    source: "store"
  };
  report.summaryLine = formatDriftCertificationSummary(report);
  return report;
}
