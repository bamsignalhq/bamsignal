export const DEFAULT_THRESHOLDS = {
  autoVerifyMin: 95,
  manualReviewMin: 80
};

export function resolveThresholds(env = {}) {
  const autoDefault = Number(process.env.FACE_MATCH_AUTO_VERIFY_MIN || DEFAULT_THRESHOLDS.autoVerifyMin);
  const manualDefault = Number(
    process.env.FACE_MATCH_MANUAL_REVIEW_MIN || DEFAULT_THRESHOLDS.manualReviewMin
  );
  const autoVerifyMin = clamp(
    Number.isFinite(env.autoVerifyMin) ? Number(env.autoVerifyMin) : autoDefault,
    0,
    100
  );
  const manualReviewMin = clamp(
    Number.isFinite(env.manualReviewMin) ? Number(env.manualReviewMin) : manualDefault,
    0,
    autoVerifyMin
  );
  return { autoVerifyMin, manualReviewMin };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function computeTrustScore(signals, thresholds = resolveThresholds()) {
  const reasons = [];
  const breakdown = {};
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

  const match = clamp(Number(signals.faceMatchConfidence) || 0, 0, 100);
  const matchPoints = Math.round((match / 100) * 50);
  breakdown.faceMatch = matchPoints;
  score += matchPoints;
  if (match < thresholds.manualReviewMin) reasons.push("low_match");

  const ageBonus = Math.min(5, Math.floor(Math.max(0, Number(signals.accountAgeDays) || 0) / 14));
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
  if (Number(signals.reportCount) > 0) {
    const penalty = Math.min(20, Number(signals.reportCount) * 5);
    breakdown.reports = -penalty;
    score -= penalty;
    reasons.push("reported_user");
  }

  const trustScore = clamp(Math.round(score), 0, 100);
  let decision = "retry";
  if (trustScore >= thresholds.autoVerifyMin && signals.livenessPassed && signals.smsVerified) {
    decision = "auto_verify";
  } else if (trustScore >= thresholds.manualReviewMin && signals.livenessPassed) {
    decision = "manual_review";
  }

  return {
    trustScore,
    decision,
    reasons: reasons.length ? reasons : ["ok"],
    breakdown
  };
}
