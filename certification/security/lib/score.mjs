import { SECURITY_CERT_BLOCK_ON } from "../../../shared/securityCertificationChecks.mjs";

export function countSeverities(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const finding of findings) {
    if (!finding.passed) {
      counts[finding.severity] = (counts[finding.severity] || 0) + 1;
    }
  }
  return counts;
}

export function buildSecurityScore(findings) {
  if (!findings.length) return 0;
  const passed = findings.filter((item) => item.passed).length;
  return Math.round((passed / findings.length) * 100);
}

export function evaluateReleaseGate(counts) {
  if (SECURITY_CERT_BLOCK_ON.critical && counts.critical > 0) return false;
  if (SECURITY_CERT_BLOCK_ON.high && counts.high > 0) return false;
  if (SECURITY_CERT_BLOCK_ON.medium && counts.medium > 0) return false;
  if (SECURITY_CERT_BLOCK_ON.low && counts.low > 0) return false;
  return true;
}

export function buildOwaspFinding(findings) {
  const owaspRelated = findings.filter((item) => item.checkId !== "owasp-top-10");
  const failedCriticalHigh = owaspRelated.filter(
    (item) => !item.passed && (item.severity === "critical" || item.severity === "high")
  );
  const passed = failedCriticalHigh.length === 0;
  return {
    id: "owasp-top-10-summary",
    checkId: "owasp-top-10",
    title: "OWASP Top 10 baseline",
    severity: passed ? "low" : "critical",
    passed,
    detail: passed
      ? "No critical or high findings across OWASP-aligned controls."
      : `${failedCriticalHigh.length} critical/high OWASP-aligned finding(s) require remediation.`,
    owaspRef: "A01-A10"
  };
}
