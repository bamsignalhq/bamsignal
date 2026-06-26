import type {
  DependencyCertificationFinding,
  DependencyCertificationRecommendation,
  DependencyCertificationReport,
  DependencyCertificationSnapshot
} from "../types/dependencyCertification";

export function formatDependencyCertificationSummary(
  report: Pick<
    DependencyCertificationReport,
    "dependencyScore" | "criticalVulnerabilities" | "upgradeCandidates" | "passed"
  >
): string {
  return `Score ${report.dependencyScore}% · critical ${report.criticalVulnerabilities.length} · upgrades ${report.upgradeCandidates.length} · ${report.passed ? "PASS" : "BLOCKED"}`;
}

export function buildDependencyRecommendations(
  findings: DependencyCertificationFinding[]
): DependencyCertificationRecommendation[] {
  return findings
    .filter((item) => !item.passed && (item.severity === "critical" || item.severity === "high"))
    .map((item) => ({
      id: `ui-${item.id}`,
      priority: item.severity === "critical" ? "critical" : "high",
      title: item.title,
      detail: item.detail
    }));
}

export function buildDependencyCertificationReport(
  snapshot: DependencyCertificationSnapshot
): DependencyCertificationReport {
  const recommendations =
    snapshot.recommendations.length > 0
      ? snapshot.recommendations
      : buildDependencyRecommendations(snapshot.findings);

  const report: DependencyCertificationReport = {
    ...snapshot,
    recommendations,
    summaryLine: "",
    source: "store"
  };
  report.summaryLine = formatDependencyCertificationSummary(report);
  return report;
}
