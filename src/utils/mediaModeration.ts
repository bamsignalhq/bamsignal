import {
  getPhotoModerationMode,
  type PhotoModerationMode
} from "../config/imageModeration";
import { PHOTO_UPLOAD_FAIL } from "../constants/photos";
import type { PhotoUploadErrorCode } from "../constants/photoUploadErrors";
import type { PhotoUploadKind } from "../constants/photoUploadKinds";
import type { PhotoReviewMeta, PhotoReviewStatus, PhotoRiskFlag } from "../types";
import { CONTACT_LEAK_BLOCK_MESSAGE, scanTextForContactLeak } from "./contactGuard";
import { defaultApprovedPhotoMeta } from "./photoMeta";
import { logPhotoUpload } from "./photoUploadLog";
import { readJson, writeJson } from "./storage";
import { STORAGE_KEYS } from "../constants/limits";

type StrikeRecord = { count: number };

export type { PhotoUploadKind } from "../constants/photoUploadKinds";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i;

export type PhotoModerationResult = {
  allowed: boolean;
  message: string;
  code?: PhotoUploadErrorCode;
  internalReason?: string;
  mode: PhotoModerationMode;
  riskScore?: number;
  photoReviewStatus?: PhotoReviewStatus;
  photoRiskFlags?: PhotoRiskFlag[];
};

export function isLikelyImageFile(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  if (type.startsWith("image/")) return true;
  const name = file.name || "";
  if (IMAGE_EXTENSIONS.test(name)) return true;
  if ((type === "application/octet-stream" || !type) && file.size > 0) return true;
  return false;
}

function recordStrike(storageKey: string): { count: number; isFinal: boolean } {
  const prev = readJson<StrikeRecord>(storageKey, { count: 0 });
  const count = prev.count + 1;
  writeJson(storageKey, { count });
  return { count, isFinal: count >= 3 };
}

export function resetPhotoModerationStrikes(): void {
  writeJson(STORAGE_KEYS.photoModerationStrikes, { count: 0 });
}

export function resetVoiceModerationStrikes(): void {
  writeJson(STORAGE_KEYS.voiceModerationStrikes, { count: 0 });
}

/**
 * Upload-first: never block on heuristics (face, blur, logo, OCR, etc.).
 * Only reject files that are clearly not images.
 */
export async function moderatePhotoUpload(
  file: File,
  kind: PhotoUploadKind = "profile"
): Promise<PhotoModerationResult> {
  const mode = getPhotoModerationMode();
  logPhotoUpload("moderation_skipped", { kind, mode, reason: "upload_first" });

  if (file.type && !file.type.startsWith("image/") && !isLikelyImageFile(file)) {
    return {
      allowed: false,
      message: PHOTO_UPLOAD_FAIL,
      code: "NOT_IMAGE",
      internalReason: `invalid_mime:${file.type}`,
      mode
    };
  }

  resetPhotoModerationStrikes();
  return {
    allowed: true,
    message: "",
    mode,
    photoReviewStatus: "pending_review",
    photoRiskFlags: []
  };
}

export type PhotoReviewAssessment = {
  photoReviewStatus: PhotoReviewStatus;
  photoRiskFlags: PhotoRiskFlag[];
  hardBlock: boolean;
  hardBlockMessage?: string;
};

/** Post-upload metadata — pending review until admin approves. */
export async function assessUploadedPhoto(
  _file: File,
  kind: PhotoUploadKind
): Promise<PhotoReviewAssessment> {
  void kind;
  return { photoReviewStatus: "pending_review", photoRiskFlags: [], hardBlock: false };
}

export function toPhotoReviewMeta(
  kind: PhotoUploadKind,
  _assessment?: PhotoReviewAssessment
): PhotoReviewMeta {
  const type = kind === "cover" ? "cover" : "profile";
  return defaultApprovedPhotoMeta(type);
}

/** Reserved for future background admin queue — does not block upload. */
export function reviewUploadedPhotoAsync(
  _file: File,
  kind: PhotoUploadKind,
  _photoUrl: string,
  onAssessed?: (meta: PhotoReviewMeta) => void
): void {
  onAssessed?.(defaultApprovedPhotoMeta(kind === "cover" ? "cover" : "profile"));
}

/** @deprecated Signup uses moderatePhotoUpload with kind=signup */
export async function moderateSignupPhotoUpload(file: File): Promise<PhotoModerationResult> {
  return moderatePhotoUpload(file, "signup");
}

export function checkVoiceIntroTranscript(text: string): { allowed: boolean; reason: string } {
  const normalized = text.trim();
  if (!normalized) {
    return { allowed: true, reason: "" };
  }
  if (scanTextForContactLeak(normalized).blocked) {
    return { allowed: false, reason: CONTACT_LEAK_BLOCK_MESSAGE };
  }
  return { allowed: true, reason: "" };
}

export function moderateVoiceIntroTranscript(transcript: string): { allowed: boolean; message: string } {
  const check = checkVoiceIntroTranscript(transcript);
  if (check.allowed) {
    resetVoiceModerationStrikes();
    return { allowed: true, message: "" };
  }

  const { isFinal } = recordStrike(STORAGE_KEYS.voiceModerationStrikes);
  if (isFinal) {
    return {
      allowed: false,
      message: "Please use a neutral, clean intro without contact details."
    };
  }
  return {
    allowed: false,
    message: check.reason || "Couldn't save that intro. Please try again."
  };
}
