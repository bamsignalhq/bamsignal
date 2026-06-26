import { RELIABILITY_CERT_BLOCK_ON_FAILURE } from "../../../shared/reliabilityCertificationChecks.mjs";

export function buildReliabilityScore(scenarios) {
  if (!scenarios.length) return 0;
  const passed = scenarios.filter((item) => item.passed).length;
  return Math.round((passed / scenarios.length) * 100);
}

export function summarizeRecovery(scenarios) {
  const timed = scenarios
    .map((item) => item.recoveryTimeMs)
    .filter((value) => typeof value === "number" && value >= 0);
  const average =
    timed.length > 0 ? Math.round(timed.reduce((sum, value) => sum + value, 0) / timed.length) : null;
  const max = timed.length > 0 ? Math.max(...timed) : null;
  const recoverySuccess = scenarios.filter((item) => item.recoverySuccess).length;
  const recoveryFailures = scenarios
    .filter((item) => !item.passed)
    .map((item) => `${item.label}: ${item.detail}`);

  return { average, max, recoverySuccess, recoveryFailures };
}

export function evaluateReleaseGate(scenarios) {
  if (!RELIABILITY_CERT_BLOCK_ON_FAILURE) return true;
  return scenarios.every((item) => item.passed);
}
