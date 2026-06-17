import {
  containsDocumentKeywords,
  scanPhotoSafetyText
} from "../../shared/photoSafetyPatterns.mjs";
import {
  containsBusinessFlyerText,
  PHOTO_RISK_REJECT_THRESHOLD
} from "../../shared/photoQualityScore.mjs";
import type { PhotoModerationMode } from "../config/imageModeration";
import { containsContactInText } from "./contactGuard";
import { trackPhotoRejection } from "./photoRejectionMetrics";
import type { PhotoUploadKind } from "../constants/photoUploadKinds";
import { logPhotoUpload } from "./photoUploadLog";

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
  warnOnly?: boolean;
};

function mapSharedCategory(category: string): PhotoRejectionCategory {
  if (category === "contact_information") return "contact_info";
  if (category === "document_detected") return "document";
  if (category === "too_much_text") return "text_heavy";
  return category as PhotoRejectionCategory;
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

/** Instant filename / metadata checks — safe to run on every upload. */
export function scanPhotoSafetyFast(
  file: File,
  kind: PhotoUploadKind
): PhotoSafetyScanResult {
  const isVerificationSelfie = kind === "selfie";
  const allowDocuments = isVerificationSelfie;
  const filename = file.name || "";
  const combinedText = filename;

  if (containsContactInText(combinedText)) {
    return reject("contact_info", "filename_contact", PHOTO_RISK_REJECT_THRESHOLD, kind);
  }

  const textScan = scanPhotoSafetyText(combinedText, { allowDocuments });
  if (textScan.blocked && textScan.category) {
    return reject(
      mapSharedCategory(textScan.category),
      `filename:${textScan.category}`,
      PHOTO_RISK_REJECT_THRESHOLD,
      kind
    );
  }

  if (!allowDocuments && containsDocumentKeywords(filename)) {
    return reject("document", "filename_document", PHOTO_RISK_REJECT_THRESHOLD, kind);
  }

  if (kind === "cover" && containsBusinessFlyerText(filename)) {
    return reject("logo", "filename_flyer", PHOTO_RISK_REJECT_THRESHOLD, kind);
  }

  return { allowed: true, riskScore: 0 };
}

/** Full vision pipeline — disabled in warn mode; never used for hard blocks until proven stable. */
export async function scanPhotoSafetyDeep(
  file: File,
  kind: PhotoUploadKind
): Promise<PhotoSafetyScanResult> {
  const [{ analyzeFaces }, { analyzeVisualHeuristics }, { bitmapToCanvas, loadImageBitmap }] =
    await Promise.all([
      import("./photoFaceAnalysis"),
      import("./photoVisualHeuristics"),
      import("./photoImageBitmap")
    ]);

  const isCover = kind === "cover";
  const isPublicProfile = kind === "profile" || kind === "signup";

  const faceAnalysis = isCover
    ? {
        faceCount: 0,
        largestFaceAreaRatio: 0,
        totalFaceAreaRatio: 0,
        hasAdequateFace: false,
        detected: false
      }
    : await analyzeFaces(file).catch(() => ({
        faceCount: 0,
        largestFaceAreaRatio: 0,
        totalFaceAreaRatio: 0,
        hasAdequateFace: false,
        detected: false
      }));

  let density = 0;
  let hasQr = false;
  let ocrText = "";

  try {
    const bitmap = await loadImageBitmap(file);
    try {
      const canvas = bitmapToCanvas(bitmap, 160);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
        density = samples ? edges / samples : 0;
      }
    } finally {
      bitmap.close?.();
    }
  } catch {
    density = 0;
  }

  const visual = await analyzeVisualHeuristics(file, faceAnalysis, density).catch(() => ({
    logoLikelihood: 0,
    landscapeLikelihood: 0,
    humanConfidence: faceAnalysis.hasAdequateFace ? 0.8 : 0.15
  }));

  const filename = file.name || "";
  const hasFlyerText = containsBusinessFlyerText([filename, ocrText].join("\n"));
  const logoLikelihood = Math.max(visual.logoLikelihood, hasFlyerText ? 0.7 : 0);

  let riskScore = 0;
  if (!faceAnalysis.hasAdequateFace && isPublicProfile) riskScore += 50;
  if (logoLikelihood >= 0.62) riskScore += 40;
  if (density >= 0.13) riskScore += 20;
  if (hasQr) riskScore += 20;

  return {
    allowed: true,
    riskScore,
    warnOnly: true,
    category: riskScore >= 60 ? "other" : undefined,
    internalReason: `deep_scan:${riskScore}`
  };
}

export async function scanPhotoSafety(
  file: File,
  kind: PhotoUploadKind,
  mode: PhotoModerationMode = "warn"
): Promise<PhotoSafetyScanResult> {
  if (mode === "warn") {
    const fast = scanPhotoSafetyFast(file, kind);
    logPhotoUpload("moderation_warn", {
      kind,
      riskScore: fast.riskScore,
      wouldBlock: !fast.allowed,
      category: fast.category || null
    });
    return { allowed: true, riskScore: fast.riskScore, warnOnly: true };
  }

  return scanPhotoSafetyFast(file, kind);
}

/** Fire-and-forget deep risk logging after a successful upload. */
export function logPhotoSafetyRiskAsync(file: File, kind: PhotoUploadKind): void {
  void scanPhotoSafetyDeep(file, kind)
    .then((result) => {
      logPhotoUpload("moderation_risk", {
        kind,
        riskScore: result.riskScore,
        category: result.category || null,
        reason: result.internalReason || null
      });
    })
    .catch((error) => {
      logPhotoUpload("moderation_risk_failed", {
        kind,
        reason: error instanceof Error ? error.message : String(error)
      });
    });
}
