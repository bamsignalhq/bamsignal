import {
  scanPhotoFilenameSafetyText,
  scanPhotoSafetyText
} from "../../shared/photoSafetyPatterns.mjs";

const FLAG_BY_CATEGORY = {
  document_detected: "document_like",
  contact_information: "contact_info_detected",
  qr_detected: "qr_detected"
};

/** @typedef {"upload_first" | "review" | "strict"} PhotoModerationMode */

/**
 * @returns {PhotoModerationMode}
 */
export function getPhotoModerationMode() {
  const mode = String(process.env.PHOTO_MODERATION_MODE || "upload_first")
    .trim()
    .toLowerCase();
  if (mode === "strict" || mode === "review") return mode;
  return "upload_first";
}

/**
 * Upload-first: never reject at upload time — flag for review instead.
 * @param {{ blocked?: boolean; category?: string | null }} scan
 * @param {string} provider
 */
function decisionFromScan(scan, provider = "manual") {
  if (!scan?.blocked) {
    return { decision: "approved", flags: [], confidence: 0, provider };
  }

  const flag = FLAG_BY_CATEGORY[scan.category] || "contact_info_detected";
  return {
    decision: "pending_review",
    flags: [flag],
    confidence: 0.92,
    provider
  };
}

/**
 * @param {{
 *   imageUrl?: string;
 *   userId?: string;
 *   photoType?: "profile" | "cover";
 *   hints?: { filename?: string; ocrText?: string };
 * }} input
 * @returns {Promise<{
 *   decision: "approved" | "pending_review";
 *   flags: string[];
 *   confidence: number;
 *   provider: string;
 * }>}
 */
export async function moderatePhoto({ imageUrl, userId, photoType, hints = {} } = {}) {
  void imageUrl;
  void userId;
  void photoType;

  try {
    const filename = String(hints.filename || "").trim();
    if (filename) {
      return decisionFromScan(scanPhotoFilenameSafetyText(filename), "manual");
    }

    const ocrText = String(hints.ocrText || "").trim();
    if (ocrText) {
      return decisionFromScan(scanPhotoSafetyText(ocrText), "manual");
    }

    return { decision: "approved", flags: [], confidence: 0, provider: "manual" };
  } catch (error) {
    console.warn("[photo-moderation] provider failed:", error);
    return {
      decision: "pending_review",
      flags: ["moderation_unavailable"],
      confidence: 0,
      provider: "manual"
    };
  }
}
