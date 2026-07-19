/**
 * Pure risk engine — provider-agnostic trust scoring.
 * Thresholds come from env / config, not hardcoded product magic in UI.
 */
import type {
  RiskResult,
  RiskSignals,
  VerificationReasonCode,
  VerificationThresholds
} from "./types";

export const DEFAULT_THRESHOLDS: VerificationThresholds = {
  autoVerifyMin: 95,
  manualReviewMin: 80
};

export function resolveThresholds(env: {
  autoVerifyMin?: number;
  manualReviewMin?: number;
} = {}): VerificationThresholds {
  const autoVerifyMin = clamp(
    Number.isFinite(env.autoVerifyMin) ? Number(env.autoVerifyMin) : DEFAULT_THRESHOLDS.autoVerifyMin,
    0,
    100
  );
  const manualReviewMin = clamp(
    Number.isFinite(env.manualReviewMin) ? Number(env.manualReviewMin) : DEFAULT_THRESHOLDS.manualReviewMin,
    0,
    autoVerifyMin
  );
  return { autoVerifyMin, manualReviewMin };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Weighted trust score (0–100).
 * Face match is the largest signal; identity + liveness + abuse checks adjust.
 */
export function computeTrustScore(
  signals: RiskSignals,
  thresholds: VerificationThresholds = DEFAULT_THRESHOLDS
): RiskResult {
  const reasons: VerificationReasonCode[] = [];
  const breakdown: Record<string, number> = {};

  let score = 0;

  if (signals.emailVerified) {
    breakdown.emailVerified = 10;
    score += 10;
  } else {
    reasons.push("email_required");
  }

  if (signals.smsVerified) {
    breakdown.smsVerified = 15;
    score += 15;
  } else {
    reasons.push("sms_required");
  }

  if (signals.livenessPassed) {
    breakdown.livenessPassed = 20;
    score += 20;
  } else {
    reasons.push("liveness_failed");
  }

  const match = clamp(signals.faceMatchConfidence, 0, 100);
  const matchPoints = Math.round((match / 100) * 50);
  breakdown.faceMatch = matchPoints;
  score += matchPoints;
  if (match < thresholds.manualReviewMin) {
    reasons.push("low_match");
  }

  const ageBonus = Math.min(5, Math.floor(Math.max(0, signals.accountAgeDays) / 14));
  breakdown.accountAge = ageBonus;
  score += ageBonus;

  if (signals.duplicatePhone) {
    breakdown.duplicatePhone = -20;
    score -= 20;
    reasons.push("duplicate_phone");
  }
  if (signals.duplicateDevice) {
    breakdown.duplicateDevice = -15;
    score -= 15;
    reasons.push("duplicate_device");
  }
  if (signals.duplicateFace) {
    breakdown.duplicateFace = -25;
    score -= 25;
    reasons.push("duplicate_face");
  }
  if (signals.reportCount > 0) {
    const penalty = Math.min(20, signals.reportCount * 5);
    breakdown.reports = -penalty;
    score -= penalty;
    reasons.push("reported_user");
  }

  const trustScore = clamp(Math.round(score), 0, 100);

  let decision: RiskResult["decision"] = "retry";
  if (trustScore >= thresholds.autoVerifyMin && signals.livenessPassed && signals.smsVerified) {
    decision = "auto_verify";
    if (!reasons.includes("ok") && reasons.length === 0) reasons.push("ok");
  } else if (trustScore >= thresholds.manualReviewMin && signals.livenessPassed) {
    decision = "manual_review";
  } else {
    decision = "retry";
  }

  return { trustScore, decision, reasons: reasons.length ? reasons : ["ok"], breakdown };
}
