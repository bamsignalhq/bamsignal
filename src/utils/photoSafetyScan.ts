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

/** Pre-upload: never block — technical validation happens in validatePhotoFile only. */
export function scanPhotoSafetyFast(
  file: File,
  kind: PhotoUploadKind
): PhotoSafetyScanResult {
  void file;
  void kind;
  return { allowed: true, riskScore: 0, photoReviewStatus: "approved", photoRiskFlags: [] };
}

/** Post-upload assessment stub — server provider is source of truth after storage upload. */
export async function scanPhotoSafetyDeep(
  _file: File,
  kind: PhotoUploadKind
): Promise<PhotoSafetyScanResult> {
  void kind;
  return { allowed: true, riskScore: 0, photoReviewStatus: "approved", photoRiskFlags: [] };
}

export async function scanPhotoSafety(
  file: File,
  kind: PhotoUploadKind,
  _mode: PhotoModerationMode = "upload_first"
): Promise<PhotoSafetyScanResult> {
  const fast = scanPhotoSafetyFast(file, kind);
  logPhotoUpload("moderation_fast", {
    kind,
    allowed: fast.allowed,
    riskScore: fast.riskScore,
    policy: "upload_first"
  });
  return fast;
}

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
        flags: result.photoRiskFlags || []
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
