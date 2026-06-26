import { CHAOS_CERT_BLOCK_ON_CRITICAL } from "../../../shared/chaosCertificationAttacks.mjs";

export function buildChaosScore(attacks) {
  if (!attacks.length) return 0;
  const passed = attacks.filter((item) => item.passed).length;
  return Math.round((passed / attacks.length) * 100);
}

export function summarizeRecovery(attacks) {
  const timed = attacks
    .map((item) => item.recoveryTimeMs)
    .filter((value) => typeof value === "number" && value >= 0);
  const average =
    timed.length > 0 ? Math.round(timed.reduce((sum, value) => sum + value, 0) / timed.length) : null;
  const max = timed.length > 0 ? Math.max(...timed) : null;
  const recoverySuccess = attacks.filter((item) => item.recoverySuccess).length;

  return { average, max, recoverySuccess };
}

export function evaluateChaosGate(attacks) {
  if (!CHAOS_CERT_BLOCK_ON_CRITICAL) return true;
  const criticalFailures = attacks.filter(
    (item) => item.critical && (!item.passed || !item.recoverySuccess)
  );
  return criticalFailures.length === 0;
}

export function buildCriticalWeaknesses(attacks) {
  return attacks
    .filter((item) => !item.passed || !item.recoverySuccess)
    .map((item) => ({
      id: item.id,
      label: item.label,
      critical: item.critical,
      recoverySuccess: item.recoverySuccess,
      detail: item.detail,
      failedChecks: Object.entries(item.verification || {})
        .filter(([, ok]) => !ok)
        .map(([key]) => key)
    }));
}
