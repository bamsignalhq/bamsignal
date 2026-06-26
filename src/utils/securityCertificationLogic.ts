import { SECURITY_CERTIFICATION_CHECKS } from "../constants/securityCertification";
import type {
  SecurityCertificationFinding,
  SecurityCertificationRecommendation,
  SecurityCertificationReport,
  SecurityCertificationSnapshot
} from "../types/securityCertification";

export function formatSecurityCertificationSummary(report: SecurityCertificationReport): string {
  return `Score ${report.securityScore}% · critical ${report.counts.critical} · high ${report.counts.high} · ${report.passed ? "PASS" : "BLOCKED"}`;
}

export function buildSecurityRecommendations(
  findings: SecurityCertificationFinding[]
): SecurityCertificationRecommendation[] {
  const items: SecurityCertificationRecommendation[] = [];
  let counter = 0;

  for (const finding of findings.filter((item) => !item.passed)) {
    if (finding.severity === "critical" || finding.severity === "high") {
      counter += 1;
      items.push({
        id: `sec_rec_${counter}`,
        title: `Fix ${finding.title}`,
        detail: finding.detail,
        priority: finding.severity
      });
    }
  }

  if (!items.length) {
    items.push({
      id: "sec_rec_maintain",
      title: "Maintain security baseline",
      detail: "Re-run npm run certify:security before each release candidate.",
      priority: "medium"
    });
  }

  return items;
}

export function buildSecurityCertificationReport(
  snapshot: SecurityCertificationSnapshot
): SecurityCertificationReport {
  const recommendations = buildSecurityRecommendations(snapshot.findings);
  const failures = snapshot.findings
    .filter((item) => !item.passed && (item.severity === "critical" || item.severity === "high"))
    .map((item) => `${item.title}: ${item.detail}`);

  const report: SecurityCertificationReport = {
    ...snapshot,
    summaryLine: "",
    recommendations,
    failures,
    source: "store"
  };
  report.summaryLine = formatSecurityCertificationSummary(report);
  return report;
}

export function groupFindingsByCheck(findings: SecurityCertificationFinding[]) {
  return SECURITY_CERTIFICATION_CHECKS.map((check) => ({
    ...check,
    findings: findings.filter((item) => item.checkId === check.id)
  }));
}
