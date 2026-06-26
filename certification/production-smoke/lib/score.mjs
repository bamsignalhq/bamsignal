import { PRODUCTION_SMOKE_BLOCK_ON_CRITICAL } from "../../../shared/productionSmokeChecks.mjs";

export function countSeverities(checks) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, warning: 0 };
  for (const check of checks) {
    if (!check.passed) {
      counts[check.severity] = (counts[check.severity] || 0) + 1;
    }
  }
  return counts;
}

export function evaluateSmokeGate(counts) {
  if (!PRODUCTION_SMOKE_BLOCK_ON_CRITICAL) return true;
  return counts.critical === 0;
}

export function buildSmokeScore(checks) {
  if (!checks.length) return 0;
  const counts = countSeverities(checks);
  let score = 100;
  score -= counts.critical * 20;
  score -= counts.high * 10;
  score -= counts.medium * 5;
  score -= counts.warning * 3;
  score -= counts.low * 1;
  return Math.max(0, Math.min(100, score));
}
