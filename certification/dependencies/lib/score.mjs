import { DEPENDENCY_CERT_BLOCK_ON_CRITICAL } from "../../../shared/dependencyCertificationDomains.mjs";

export function countSeverities(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, warning: 0 };
  for (const finding of findings) {
    if (!finding.passed) {
      counts[finding.severity] = (counts[finding.severity] || 0) + 1;
    }
  }
  return counts;
}

export function buildDependencyScore(findings) {
  if (!findings.length) return 0;
  const counts = countSeverities(findings);
  let score = 100;
  score -= counts.critical * 20;
  score -= counts.high * 8;
  score -= counts.medium * 4;
  score -= counts.warning * 2;
  score -= counts.low * 1;
  return Math.max(0, Math.min(100, score));
}

export function evaluateReleaseGate(counts, criticalVulnerabilities = []) {
  if (!DEPENDENCY_CERT_BLOCK_ON_CRITICAL) return true;
  if (counts.critical > 0) return false;
  if (criticalVulnerabilities.length > 0) return false;
  return true;
}

export function summarizeInventory(inventory) {
  return {
    packagesScanned: inventory.packagesScanned ?? 0,
    upgradeCandidates: inventory.upgradeCandidates?.length ?? 0,
    unusedDependencies: inventory.unusedDependencies?.length ?? 0,
    duplicatePackages: inventory.duplicatePackages?.length ?? 0
  };
}
