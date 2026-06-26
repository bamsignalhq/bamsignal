/**
 * Production Smoke Suite™ — server-side verification helpers.
 */

export function productionSmokeCommandRegistered(source) {
  return source.includes("smoke:production") && source.includes("test:production-smoke");
}

export function productionSmokeModuleRegistered(source) {
  return source.includes("certification/production-smoke/run.mjs");
}

export function formatProductionSmokeSummary(report) {
  return `${report.checksPassed ?? 0}/${report.checks?.length ?? 0} passed · score ${report.smokeScore ?? 0}% · ${report.passed ? "PASS" : "FAIL"}`;
}
