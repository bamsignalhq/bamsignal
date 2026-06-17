import {
  containsDocumentKeywords,
  scanPhotoSafetyText
} from "../../shared/photoSafetyPatterns.mjs";
import {
  classifyCoverRisk,
  classifyProfileRisk,
  containsBusinessFlyerText,
  PHOTO_RISK_REJECT_THRESHOLD
} from "../../shared/photoQualityScore.mjs";
import { containsContactInText } from "./contactGuard";
import { trackPhotoRejection } from "./photoRejectionMetrics";
import type { PhotoUploadKind } from "../constants/photoUploadKinds";
import { bitmapToCanvas, loadImageBitmap } from "./photoImageBitmap";
import { analyzeFaces } from "./photoFaceAnalysis";
import { analyzeVisualHeuristics } from "./photoVisualHeuristics";

export type PhotoRejectionCategory =
  | "no_face"
  | "logo"
  | "document"
  | "text_heavy"
  | "qr_code"
  | "contact_info"
  | "other";

export type PhotoSafetyScanResult = {
  allowed: boolean;
  category?: PhotoRejectionCategory;
  internalReason?: string;
  riskScore: number;
};

const OCR_KEYWORDS = [
  "nin",
  "national identification number",
  "federal republic of nigeria",
  "bvn",
  "passport",
  "driver's licence",
  "drivers licence",
  "issue date",
  "surname",
  "given names",
  "card number",
  "date of birth"
];

async function tryOcrText(file: File): Promise<string> {
  try {
    const { recognize } = await import("tesseract.js");
    const result = await recognize(file, "eng", { logger: () => undefined });
    return String(result.data.text || "");
  } catch {
    return "";
  }
}

function measureTextDensityFromImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let edges = 0;
  let samples = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const right = data[i + 4] * 0.299 + data[i + 5] * 0.587 + data[i + 6] * 0.114;
      if (Math.abs(lum - right) > 42) edges++;
      samples++;
    }
  }
  return samples ? edges / samples : 0;
}

async function measureTextDensity(file: File): Promise<number> {
  const bitmap = await loadImageBitmap(file);
  try {
    const canvas = bitmapToCanvas(bitmap, 160);
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return measureTextDensityFromImageData(data, width, height);
  } finally {
    bitmap.close?.();
  }
}

async function detectQrCode(file: File): Promise<boolean> {
  try {
    const { default: jsQR } = await import("jsqr");
    const bitmap = await loadImageBitmap(file);
    try {
      const canvas = bitmapToCanvas(bitmap, 720);
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return Boolean(jsQR(imageData.data, imageData.width, imageData.height));
    } finally {
      bitmap.close?.();
    }
  } catch {
    return false;
  }
}

function ocrHasRiskKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return OCR_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function looksLikeScreenshot(aspect: number, density: number): boolean {
  if (aspect >= 1.75 && density >= 0.13) return true;
  if (aspect <= 0.55 && density >= 0.13) return true;
  return false;
}

function reject(
  category: PhotoRejectionCategory,
  internalReason: string,
  riskScore: number,
  kind: PhotoUploadKind
): PhotoSafetyScanResult {
  trackPhotoRejection(category, kind);
  return { allowed: false, category, internalReason, riskScore };
}

function mapSharedCategory(category: string): PhotoRejectionCategory {
  if (category === "contact_information") return "contact_info";
  if (category === "document_detected") return "document";
  if (category === "too_much_text") return "text_heavy";
  return category as PhotoRejectionCategory;
}

async function scanVerificationSelfie(
  file: File,
  ocrText: string,
  density: number,
  hasQr: boolean,
  faceAnalysis: Awaited<ReturnType<typeof analyzeFaces>>
): Promise<PhotoSafetyScanResult> {
  const filename = file.name || "";
  if (containsContactInText(filename) || containsContactInText(ocrText)) {
    return reject("contact_info", "selfie_contact", PHOTO_RISK_REJECT_THRESHOLD, "selfie");
  }

  const combinedText = [filename, ocrText].filter(Boolean).join("\n");
  const textScan = scanPhotoSafetyText(combinedText, { allowDocuments: true });
  if (textScan.blocked && textScan.category === "contact_information") {
    return reject("contact_info", "selfie_contact_scan", PHOTO_RISK_REJECT_THRESHOLD, "selfie");
  }

  if (!faceAnalysis.hasAdequateFace) {
    return reject("no_face", "selfie_no_face", 50, "selfie");
  }

  let riskScore = 0;
  if (density >= 0.17) riskScore += 20;
  if (hasQr) riskScore += 20;
  if (riskScore >= PHOTO_RISK_REJECT_THRESHOLD) {
    return reject("other", `selfie_risk:${riskScore}`, riskScore, "selfie");
  }

  return { allowed: true, riskScore };
}

export async function scanPhotoSafety(
  file: File,
  kind: PhotoUploadKind
): Promise<PhotoSafetyScanResult> {
  const isCover = kind === "cover";
  const isVerificationSelfie = kind === "selfie";
  const isPublicProfile = kind === "profile" || kind === "signup";
  const allowDocuments = isVerificationSelfie;

  const filename = file.name || "";
  const [ocrText, density, hasQr, faceAnalysis] = await Promise.all([
    tryOcrText(file),
    measureTextDensity(file).catch(() => 0),
    detectQrCode(file).catch(() => false),
    isCover ? Promise.resolve({
      faceCount: 0,
      largestFaceAreaRatio: 0,
      totalFaceAreaRatio: 0,
      hasAdequateFace: false,
      detected: false
    }) : analyzeFaces(file).catch(() => ({
      faceCount: 0,
      largestFaceAreaRatio: 0,
      totalFaceAreaRatio: 0,
      hasAdequateFace: false,
      detected: false
    }))
  ]);

  if (isVerificationSelfie) {
    return scanVerificationSelfie(file, ocrText, density, hasQr, faceAnalysis);
  }

  const combinedText = [filename, ocrText].filter(Boolean).join("\n");
  const hasDocumentKeywords =
    !allowDocuments &&
    (containsDocumentKeywords(combinedText) || ocrHasRiskKeywords(ocrText) || containsDocumentKeywords(filename));
  const hasContactLeak = containsContactInText(combinedText) || containsContactInText(ocrText);
  const hasFlyerText = containsBusinessFlyerText(combinedText);

  const textScan = scanPhotoSafetyText(combinedText, { allowDocuments });
  if (textScan.blocked && textScan.category) {
    return reject(
      mapSharedCategory(textScan.category),
      `text_scan:${textScan.category}`,
      PHOTO_RISK_REJECT_THRESHOLD,
      kind
    );
  }

  if (isCover) {
    const verdict = classifyCoverRisk({
      textDensity: density,
      hasQr,
      hasDocumentKeywords,
      hasContactLeak,
      hasFlyerText
    });
    if (verdict.reject) {
      return reject(verdict.category as PhotoRejectionCategory, "cover_risk", verdict.riskScore, kind);
    }
    return { allowed: true, riskScore: verdict.riskScore };
  }

  const visual = await analyzeVisualHeuristics(file, faceAnalysis, density).catch(() => ({
    logoLikelihood: 0,
    landscapeLikelihood: 0,
    humanConfidence: faceAnalysis.hasAdequateFace ? 0.8 : 0.15
  }));

  const bitmap = await loadImageBitmap(file).catch(() => null);
  if (bitmap && isPublicProfile) {
    const aspect = bitmap.width / Math.max(bitmap.height, 1);
    bitmap.close?.();
    if (looksLikeScreenshot(aspect, density)) {
      return reject("other", `screenshot:${aspect.toFixed(2)}`, 65, kind);
    }
  } else {
    bitmap?.close?.();
  }

  const logoLikelihood = Math.max(visual.logoLikelihood, hasFlyerText ? 0.7 : 0);
  const verdict = classifyProfileRisk({
    hasAdequateFace: faceAnalysis.hasAdequateFace,
    logoLikelihood,
    textDensity: density,
    hasQr,
    hasDocumentKeywords,
    hasContactLeak
  });

  if (!faceAnalysis.hasAdequateFace && visual.landscapeLikelihood > 0.55 && !verdict.reject) {
    const landscapeRisk = 50;
    return reject("no_face", "landscape_no_person", landscapeRisk, kind);
  }

  if (verdict.reject) {
    return reject(verdict.category as PhotoRejectionCategory, "profile_risk", verdict.riskScore, kind);
  }

  if (visual.humanConfidence < 0.28 && !faceAnalysis.hasAdequateFace) {
    return reject("logo", "low_human_confidence", 65, kind);
  }

  return { allowed: true, riskScore: verdict.riskScore };
}
