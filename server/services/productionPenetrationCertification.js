/**
 * Production Penetration Certification™ — server-side verification helpers.
 */

export function productionPenetrationCertificationCommandRegistered(source) {
  return (
    source.includes("certify:production-penetration") &&
    source.includes("test:production-penetration-certification")
  );
}

export function productionPenetrationCertificationModuleRegistered(source) {
  return source.includes("certification/penetration/run.mjs");
}

export function formatProductionPenetrationCertificationSummary(report) {
  const blocked = report.counts?.blocked ?? 0;
  const total = report.attacks?.length ?? 0;
  const exploited = report.counts?.exploited ?? 0;
  return `Score ${report.penetrationScore ?? 0}% · blocked ${blocked}/${total} · exploited ${exploited} · ${report.passed ? "PASS" : "BLOCKED"}`;
}
