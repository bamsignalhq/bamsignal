/**
 * Platform Load Certification™ — server-side verification helpers.
 */

export function platformLoadCertificationCommandRegistered(source) {
  return source.includes("certify:platform-load") && source.includes("test:platform-load-certification");
}

export function platformLoadCertificationModuleRegistered(source) {
  return source.includes("certification/platform-load/run.mjs");
}

export function formatPlatformLoadCertificationSummary(report) {
  const members = report.virtualMembers ?? 0;
  const passed = report.journeysPassed ?? 0;
  const p95 = report.measurement?.api?.p95 ?? 0;
  return `Score ${report.loadScore ?? 0}% · members ${passed}/${members} · API p95 ${p95}ms · bottlenecks ${report.bottlenecks?.length ?? 0} · ${report.passed ? "PASS" : "BLOCKED"}`;
}
