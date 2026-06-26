import type {
  AccessibilityCertificationFinding,
  AccessibilityCertificationRecommendation,
  AccessibilityCertificationReport,
  AccessibilityCertificationSnapshot
} from "../types/accessibilityCertification";

export function formatAccessibilityCertificationSummary(
  report: Pick<
    AccessibilityCertificationReport,
    "accessibilityScore" | "violations" | "passed" | "counts"
  >
): string {
  return `Score ${report.accessibilityScore}% · violations ${report.violations.length} · critical ${report.counts.critical} · ${report.passed ? "PASS" : "BLOCKED"}`;
}

export function buildAccessibilityRecommendations(
  findings: AccessibilityCertificationFinding[]
): AccessibilityCertificationRecommendation[] {
  return findings
    .filter((item) => !item.passed && (item.severity === "critical" || item.severity === "high"))
    .map((item) => ({
      id: `ui-${item.id}`,
      priority: item.severity === "critical" ? "critical" : "high",
      title: item.title,
      detail: item.detail
    }));
}

export function buildAccessibilityCertificationReport(
  snapshot: AccessibilityCertificationSnapshot
): AccessibilityCertificationReport {
  const recommendations =
    snapshot.recommendations.length > 0
      ? snapshot.recommendations
      : buildAccessibilityRecommendations(snapshot.findings);

  const report: AccessibilityCertificationReport = {
    ...snapshot,
    recommendations,
    summaryLine: "",
    source: "store"
  };
  report.summaryLine = formatAccessibilityCertificationSummary(report);
  return report;
}
