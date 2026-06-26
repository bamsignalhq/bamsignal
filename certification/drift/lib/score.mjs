import { DRIFT_CERT_BLOCK_ON_CRITICAL } from "../../../shared/operationalDriftCertificationDomains.mjs";

export function countDriftSeverities(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, warning: 0 };
  for (const finding of findings) {
    if (!finding.passed) {
      counts[finding.severity] = (counts[finding.severity] || 0) + 1;
    }
  }
  return counts;
}

export function buildDriftScore(findings) {
  const counts = countDriftSeverities(findings);
  let score = 100;
  score -= counts.critical * 18;
  score -= counts.high * 8;
  score -= counts.medium * 4;
  score -= counts.warning * 2;
  return Math.max(0, Math.min(100, score));
}

export function evaluateReleaseGate(counts) {
  if (!DRIFT_CERT_BLOCK_ON_CRITICAL) return true;
  return counts.critical === 0;
}

export function summarizeDomains(findings, domains) {
  return domains.map((domain) => {
    const domainFindings = findings.filter((item) => item.domainId === domain.id);
    const criticalCount = domainFindings.filter(
      (item) => !item.passed && item.severity === "critical"
    ).length;
    return {
      ...domain,
      findingsCount: domainFindings.length,
      criticalCount,
      passed: criticalCount === 0
    };
  });
}
