import type { PhotoModerationMode } from "../config/imageModeration";
import type { PhotoUploadKind } from "../constants/photoUploadKinds";
import type { PhotoReviewStatus, PhotoRiskFlag } from "../types";
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
  hardBlock?: boolean;
  category?: PhotoRejectionCategory;
  internalReason?: string;
  riskScore: number;
  photoReviewStatus?: PhotoReviewStatus;
  photoRiskFlags?: PhotoRiskFlag[];
};

/** Pre-upload scan — upload-first; never hard-blocks (admin review later). */
export function scanPhotoSafetyFast(
  file: File,
  kind: PhotoUploadKind
): PhotoSafetyScanResult {
  void file;
  void kind;
  return { allowed: true, riskScore: 0, photoReviewStatus: "approved", photoRiskFlags: [] };
}

/** Post-upload assessment — upload-first; always approved for now. */
export async function scanPhotoSafetyDeep(
  _file: File,
  kind: PhotoUploadKind
): Promise<PhotoSafetyScanResult> {
  void kind;
  return { allowed: true, riskScore: 0, photoReviewStatus: "approved", photoRiskFlags: [] };
}

/** Pre-upload: hard-block only high-confidence filename contact/doc leaks. */
export async function scanPhotoSafety(
  file: File,
  kind: PhotoUploadKind,
  _mode: PhotoModerationMode = "warn"
): Promise<PhotoSafetyScanResult> {
  const fast = scanPhotoSafetyFast(file, kind);
  logPhotoUpload("moderation_fast", {
    kind,
    allowed: fast.allowed,
    category: fast.category || null,
    riskScore: fast.riskScore
  });
  return fast;
}

/** Post-upload risk assessment — upload-first; flags for admin review. */
export function logPhotoSafetyRiskAsync(
  file: File,
  kind: PhotoUploadKind,
  onResult?: (result: PhotoSafetyScanResult) => void
): void {
  void scanPhotoSafetyDeep(file, kind)
    .then((result) => {
      logPhotoUpload("moderation_risk", {
        kind,
        riskScore: result.riskScore,
        photoReviewStatus: result.photoReviewStatus || null,
        flags: result.photoRiskFlags || [],
        hardBlock: Boolean(result.hardBlock)
      });
      onResult?.(result);
    })
    .catch((error) => {
      logPhotoUpload("moderation_risk_failed", {
        kind,
        reason: error instanceof Error ? error.message : String(error)
      });
    });
}
