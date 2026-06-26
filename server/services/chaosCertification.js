/**
 * Chaos Engineering Certification™ — server-side verification helpers.
 */

export function chaosCertificationCommandRegistered(source) {
  return source.includes("certify:chaos") && source.includes("test:chaos-certification");
}

export function chaosCertificationModuleRegistered(source) {
  return source.includes("certification/chaos/run.mjs");
}

export function formatChaosCertificationSummary(report) {
  return `Score ${report.chaosScore ?? 0}% · recovery ${report.recoverySuccess ?? 0}/${report.attacks?.length ?? 0} · weaknesses ${report.criticalWeaknesses?.length ?? 0} · ${report.passed ? "PASS" : "BLOCKED"}`;
}
