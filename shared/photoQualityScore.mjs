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

/**
 * Upload-first policy: hard-block only high-confidence contact or document leaks.
 * Weak signals become risk flags for admin review — never hard-block.
 */
export function assessProfilePhoto({
  hasAdequateFace,
  logoLikelihood,
  textDensity,
  hasQr,
  hasDocumentKeywords,
  hasContactLeak,
  ocrText = ""
}) {
  const riskFlags = [];
  let riskScore = 0;

  if (hasContactLeak) {
    return {
      hardBlock: true,
      hardBlockCategory: "contact_info",
      pendingReview: false,
      riskFlags: ["contact_info_detected"],
      riskScore: 100
    };
  }

  if (hasDocumentKeywords) {
    return {
      hardBlock: true,
      hardBlockCategory: "document",
      pendingReview: false,
      riskFlags: ["document_like"],
      riskScore: PHOTO_RISK_WEIGHTS.document
    };
  }

  if (!hasAdequateFace) {
    riskFlags.push("no_face_detected");
    riskScore = addRisk(riskScore, "no_face");
  }

  if (logoLikelihood >= LOGO_LIKELIHOOD_THRESHOLD) {
    riskFlags.push("possible_logo");
    riskScore = addRisk(riskScore, "logo");
    if (!hasAdequateFace && logoLikelihood >= 0.75) {
      riskFlags.push("possible_ai");
    }
  }

  if (textDensity >= TEXT_HEAVY_RISK_DENSITY) {
    riskFlags.push("text_heavy");
    riskScore = addRisk(riskScore, "text_heavy");
  }

  if (hasQr) {
    riskFlags.push("qr_detected");
    riskScore = addRisk(riskScore, "qr_code");
  }

  const combinedText = String(ocrText || "");
  if (combinedText && containsBusinessFlyerText(combinedText) && !riskFlags.includes("possible_logo")) {
    riskFlags.push("possible_logo");
  }

  const pendingReview = riskFlags.length > 0;

  return {
    hardBlock: false,
    hardBlockCategory: null,
    pendingReview,
    riskFlags,
    riskScore
  };
}

/**
 * Cover photos: only hard-block contact info and sensitive documents.
 */
export function assessCoverPhoto({
  textDensity,
  hasQr,
  hasDocumentKeywords,
  hasContactLeak,
  hasFlyerText
}) {
  const riskFlags = [];
  let riskScore = 0;

  if (hasContactLeak) {
    return {
      hardBlock: true,
      hardBlockCategory: "contact_info",
      pendingReview: false,
      riskFlags: ["contact_info_detected"],
      riskScore: 100
    };
  }

  if (hasDocumentKeywords) {
    return {
      hardBlock: true,
      hardBlockCategory: "document",
      pendingReview: false,
      riskFlags: ["document_like"],
      riskScore: PHOTO_RISK_WEIGHTS.document
    };
  }

  if (hasFlyerText) {
    riskFlags.push("possible_logo");
    riskScore = addRisk(riskScore, "logo");
  }

  if (textDensity >= TEXT_HEAVY_RISK_DENSITY) {
    riskFlags.push("text_heavy");
    riskScore = addRisk(riskScore, "text_heavy");
  }

  if (hasQr) {
    riskFlags.push("qr_detected");
    riskScore = addRisk(riskScore, "qr_code");
  }

  return {
    hardBlock: false,
    hardBlockCategory: null,
    pendingReview: riskFlags.length > 0,
    riskFlags,
    riskScore
  };
}

/** @deprecated Use assessProfilePhoto — kept for test migration */
export function classifyProfileRisk(input) {
  const result = assessProfilePhoto(input);
  if (result.hardBlock) {
    return { reject: true, category: result.hardBlockCategory, riskScore: result.riskScore };
  }
  if (result.pendingReview) {
    return { reject: false, riskScore: result.riskScore, pendingReview: true, riskFlags: result.riskFlags };
  }
  return { reject: false, riskScore: result.riskScore };
}

/** @deprecated Use assessCoverPhoto */
export function classifyCoverRisk(input) {
  const result = assessCoverPhoto(input);
  if (result.hardBlock) {
    return { reject: true, category: result.hardBlockCategory, riskScore: result.riskScore };
  }
  if (result.pendingReview) {
    return { reject: false, riskScore: result.riskScore, pendingReview: true, riskFlags: result.riskFlags };
  }
  return { reject: false, riskScore: result.riskScore };
}
