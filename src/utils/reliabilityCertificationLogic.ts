import { RELIABILITY_CERTIFICATION_VERIFY_LABELS } from "../constants/reliabilityCertification";
import type {
  ReliabilityCertificationReport,
  ReliabilityCertificationSnapshot,
  ReliabilityCertificationRecommendation,
  ReliabilityScenarioResult
} from "../types/reliabilityCertification";

export function formatReliabilityCertificationSummary(report: ReliabilityCertificationReport): string {
  const total = report.scenarios?.length ?? 0;
  return `Score ${report.reliabilityScore}% · recovery ${report.recoverySuccess}/${total} · avg ${report.recoveryTimeMs.average ?? "—"}ms · ${report.passed ? "PASS" : "BLOCKED"}`;
}

export function buildReliabilityRecommendations(
  scenarios: ReliabilityScenarioResult[]
): ReliabilityCertificationRecommendation[] {
  const items: ReliabilityCertificationRecommendation[] = [];
  let counter = 0;

  for (const scenario of scenarios.filter((item) => !item.passed)) {
    counter += 1;
    items.push({
      id: `rel_rec_${counter}`,
      title: `Fix ${scenario.label}`,
      detail: scenario.detail,
      priority: scenario.recoverySuccess ? "medium" : "critical"
    });
  }

  if (!items.length) {
    items.push({
      id: "rel_rec_maintain",
      title: "Maintain reliability baseline",
      detail: "Re-run npm run certify:reliability before each release candidate.",
      priority: "medium"
    });
  }

  return items;
}

export function buildReliabilityCertificationReport(
  snapshot: ReliabilityCertificationSnapshot
): ReliabilityCertificationReport {
  const recommendations = buildReliabilityRecommendations(snapshot.scenarios);
  const report: ReliabilityCertificationReport = {
    ...snapshot,
    summaryLine: "",
    recommendations,
    source: "store"
  };
  report.summaryLine = formatReliabilityCertificationSummary(report);
  return report;
}

export function reliabilityVerifyLabel(key: keyof typeof RELIABILITY_CERTIFICATION_VERIFY_LABELS): string {
  return RELIABILITY_CERTIFICATION_VERIFY_LABELS[key];
}
