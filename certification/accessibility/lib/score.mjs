import { ACCESSIBILITY_CERT_BLOCK_ON_CRITICAL } from "../../../shared/accessibilityCertificationDomains.mjs";

export function countSeverities(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, warning: 0 };
  for (const finding of findings) {
    if (!finding.passed) {
      counts[finding.severity] = (counts[finding.severity] || 0) + 1;
    }
  }
  return counts;
}

export function buildAccessibilityScore(findings) {
  if (!findings.length) return 0;
  const counts = countSeverities(findings);
  let score = 100;
  score -= counts.critical * 18;
  score -= counts.high * 10;
  score -= counts.medium * 5;
  score -= counts.warning * 3;
  score -= counts.low * 1;
  return Math.max(0, Math.min(100, score));
}

export function evaluateReleaseGate(counts) {
  if (!ACCESSIBILITY_CERT_BLOCK_ON_CRITICAL) return true;
  return counts.critical === 0;
}

export function summarizeDomains(findings, domains) {
  return domains.map((domain) => {
    const domainFindings = findings.filter((item) => item.domainId === domain.id);
    const criticalCount = domainFindings.filter(
      (item) => !item.passed && item.severity === "critical"
    ).length;
    const openCount = domainFindings.filter((item) => !item.passed).length;
    const passedCount = domainFindings.filter((item) => item.passed).length;
    const score =
      domainFindings.length === 0
        ? 100
        : Math.round((passedCount / domainFindings.length) * 100);
    return {
      ...domain,
      findingsCount: domainFindings.length,
      criticalCount,
      openCount,
      passedCount,
      score,
      passed: criticalCount === 0
    };
  });
}
