import { DATA_INTEGRITY_CERT_BLOCK_ON_CRITICAL } from "../../../shared/dataIntegrityCertificationDomains.mjs";

export function flattenIssues(domains) {
  const criticalIssues = [];
  const warnings = [];
  for (const domain of domains) {
    for (const item of domain.criticalIssues || []) {
      criticalIssues.push({ ...item, domainLabel: domain.label });
    }
    for (const item of domain.warnings || []) {
      warnings.push({ ...item, domainLabel: domain.label });
    }
  }
  return { criticalIssues, warnings };
}

export function summarizeScan(domains) {
  return domains.reduce(
    (acc, domain) => {
      acc.objectsScanned += domain.objectsScanned || 0;
      acc.objectsRepaired += domain.objectsRepaired || 0;
      acc.objectsRequiringReview += domain.objectsRequiringReview || 0;
      return acc;
    },
    { objectsScanned: 0, objectsRepaired: 0, objectsRequiringReview: 0 }
  );
}

export function buildIntegrityScore(domains) {
  if (!domains.length) return 0;
  const passed = domains.filter((item) => item.passed).length;
  const base = Math.round((passed / domains.length) * 100);
  const criticalPenalty = domains.reduce((sum, d) => sum + (d.criticalIssues?.length || 0), 0) * 3;
  return Math.max(0, base - criticalPenalty);
}

export function evaluateReleaseGate(criticalCount) {
  if (!DATA_INTEGRITY_CERT_BLOCK_ON_CRITICAL) return true;
  return criticalCount === 0;
}
