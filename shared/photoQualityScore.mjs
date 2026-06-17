/** Risk weights and scoring — shared by browser moderation + Node tests. */

export const PHOTO_RISK_WEIGHTS = {
  no_face: 50,
  logo: 40,
  text_heavy: 20,
  qr_code: 20,
  document: 50
};

export const PHOTO_RISK_REJECT_THRESHOLD = 60;

/** Largest face must cover at least ~2.2% of the frame (blocks corner tiny faces). */
export const MIN_LARGEST_FACE_AREA_RATIO = 0.022;

/** Group shots: combined face area floor when no single face is large enough. */
export const MIN_TOTAL_FACE_AREA_RATIO = 0.034;

export const LOGO_LIKELIHOOD_THRESHOLD = 0.62;
export const TEXT_HEAVY_DENSITY = 0.17;
export const TEXT_HEAVY_RISK_DENSITY = 0.13;

export const BUSINESS_FLYER_PATTERNS = [
  /\blimited\b/i,
  /\bltd\.?\b/i,
  /\bplc\b/i,
  /\benterprise\b/i,
  /\bservices\b/i,
  /\bofficial\b/i,
  /\bfootball\s+club\b/i,
  /\bfc\b/i,
  /\barsenal\b/i,
  /\bchelsea\b/i,
  /\bman\s+utd\b/i,
  /\blagos\b.*\b(?:services|limited|ltd)\b/i,
  /\bcall\s+now\b/i,
  /\bhotline\b/i,
  /\bpromo\b/i,
  /\bdiscount\b/i,
  /\bsale\b/i,
  /\bfollow\s+us\b/i,
  /\b@\w{3,}\b/
];

export function containsBusinessFlyerText(text) {
  const raw = String(text || "");
  if (!raw.trim()) return false;
  return BUSINESS_FLYER_PATTERNS.some((pattern) => pattern.test(raw));
}

export function shouldRejectByRiskScore(score) {
  return Number(score) >= PHOTO_RISK_REJECT_THRESHOLD;
}

export function addRisk(score, key) {
  return score + (PHOTO_RISK_WEIGHTS[key] || 0);
}

export function faceAreaPassesProfileCheck(largestRatio, totalRatio) {
  if (largestRatio >= MIN_LARGEST_FACE_AREA_RATIO) return true;
  if (totalRatio >= MIN_TOTAL_FACE_AREA_RATIO) return true;
  return false;
}

export function classifyProfileRisk({
  hasAdequateFace,
  logoLikelihood,
  textDensity,
  hasQr,
  hasDocumentKeywords,
  hasContactLeak
}) {
  if (hasContactLeak) {
    return { reject: true, category: "contact_info", riskScore: 100 };
  }
  if (hasDocumentKeywords) {
    return { reject: true, category: "document", riskScore: PHOTO_RISK_WEIGHTS.document };
  }

  let riskScore = 0;
  let topCategory = "other";

  if (!hasAdequateFace) {
    riskScore = addRisk(riskScore, "no_face");
    topCategory = "no_face";
  }
  if (logoLikelihood >= LOGO_LIKELIHOOD_THRESHOLD) {
    riskScore = addRisk(riskScore, "logo");
    if (topCategory === "other") topCategory = "logo";
  }
  if (textDensity >= TEXT_HEAVY_DENSITY) {
    return { reject: true, category: "text_heavy", riskScore: addRisk(riskScore, "text_heavy") };
  }
  if (textDensity >= TEXT_HEAVY_RISK_DENSITY) {
    riskScore = addRisk(riskScore, "text_heavy");
    if (topCategory === "other") topCategory = "text_heavy";
  }
  if (hasQr) {
    riskScore = addRisk(riskScore, "qr_code");
    if (topCategory === "other") topCategory = "qr_code";
  }

  if (shouldRejectByRiskScore(riskScore)) {
    return { reject: true, category: topCategory, riskScore };
  }

  return { reject: false, riskScore };
}

export function classifyCoverRisk({
  textDensity,
  hasQr,
  hasDocumentKeywords,
  hasContactLeak,
  hasFlyerText
}) {
  if (hasContactLeak) {
    return { reject: true, category: "contact_info", riskScore: 100 };
  }
  if (hasDocumentKeywords) {
    return { reject: true, category: "document", riskScore: PHOTO_RISK_WEIGHTS.document };
  }

  let riskScore = 0;
  let topCategory = "other";

  if (hasFlyerText) {
    riskScore = addRisk(riskScore, "logo");
    topCategory = "logo";
  }
  if (textDensity >= TEXT_HEAVY_DENSITY) {
    return { reject: true, category: "text_heavy", riskScore: addRisk(riskScore, "text_heavy") };
  }
  if (textDensity >= TEXT_HEAVY_RISK_DENSITY) {
    riskScore = addRisk(riskScore, "text_heavy");
    topCategory = "text_heavy";
  }
  if (hasQr) {
    riskScore = addRisk(riskScore, "qr_code");
    if (topCategory === "other") topCategory = "qr_code";
  }

  if (shouldRejectByRiskScore(riskScore)) {
    return { reject: true, category: topCategory, riskScore };
  }

  return { reject: false, riskScore };
}
