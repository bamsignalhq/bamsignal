import {
  getPhotoModerationMode,
  isImageModerationEnabled,
  type PhotoModerationMode
} from "../config/imageModeration";
import { PHOTO_UPLOAD_FAIL, photoModerationUserMessage } from "../constants/photos";
import type { PhotoUploadErrorCode } from "../constants/photoUploadErrors";
import type { PhotoUploadKind } from "../constants/photoUploadKinds";
import { STORAGE_KEYS } from "../constants/limits";
import type { PhotoReviewMeta, PhotoReviewStatus, PhotoRiskFlag } from "../types";
import { CONTACT_LEAK_BLOCK_MESSAGE, scanTextForContactLeak } from "./contactGuard";
import { buildPhotoMetaEntry } from "./photoMeta";
import { logPhotoSafetyRiskAsync, scanPhotoSafety, scanPhotoSafetyDeep } from "./photoSafetyScan";
import { logPhotoUpload } from "./photoUploadLog";
import { submitPhotoReviewRemote } from "../services/profilePhotos";
import { readJson, writeJson } from "./storage";

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
  // Mobile camera/gallery picks often omit MIME type and file extension.
  if (!type && file.size > 0) return true;
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

function moderationKillSwitchActive(): boolean {
  const raw = import.meta.env.VITE_ENABLE_IMAGE_MODERATION;
  return raw === "false" || raw === "0";
}

/**
 * Upload-first policy: only hard-block invalid file type or high-confidence contact/doc in filename.
 * Weak heuristics (face, blur, logo, AI) never block — they flag for admin review after upload.
 */
export async function moderatePhotoUpload(
  file: File,
  kind: PhotoUploadKind = "profile"
): Promise<PhotoModerationResult> {
  const mode = getPhotoModerationMode();
  const moderationEnabled = isImageModerationEnabled();

  logPhotoUpload("moderation_check", {
    kind,
    mode,
    fileType: file.type || "unknown",
    fileName: file.name || "",
    originalSize: file.size,
    moderationEnabled
  });

  if (moderationKillSwitchActive() || !moderationEnabled) {
    logPhotoUpload("moderation_skipped", { kind, reason: "disabled" });
    resetPhotoModerationStrikes();
    return { allowed: true, message: "", mode, photoReviewStatus: "approved", photoRiskFlags: [] };
  }

  if (file.type && !file.type.startsWith("image/") && !isLikelyImageFile(file)) {
    return {
      allowed: false,
      message: PHOTO_UPLOAD_FAIL,
      code: "NOT_IMAGE",
      internalReason: `invalid_mime:${file.type}`,
      mode
    };
  }

  try {
    const safety =
      kind === "selfie"
        ? await scanPhotoSafety(file, kind, mode)
        : await scanPhotoSafetyDeep(file, kind);

    if (!safety.allowed && safety.hardBlock) {
      logPhotoUpload("moderation_blocked", {
        kind,
        category: safety.category,
        reason: safety.internalReason,
        riskScore: safety.riskScore
      });
      return {
        allowed: false,
        message: photoModerationUserMessage(),
        code: "MODERATION_REJECTED",
        internalReason: `${safety.category}:${safety.internalReason}`,
        mode,
        riskScore: safety.riskScore
      };
    }

    resetPhotoModerationStrikes();
    logPhotoUpload("moderation_passed", { kind, mode, riskScore: safety.riskScore });
    return {
      allowed: true,
      message: "",
      mode,
      riskScore: safety.riskScore,
      photoReviewStatus: "approved",
      photoRiskFlags: []
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    logPhotoUpload("moderation_error", { kind, mode, reason });
    resetPhotoModerationStrikes();
    return { allowed: true, message: "", mode, photoReviewStatus: "approved", photoRiskFlags: [] };
  }
}

export type PhotoReviewAssessment = {
  photoReviewStatus: PhotoReviewStatus;
  photoRiskFlags: PhotoRiskFlag[];
  hardBlock: boolean;
  hardBlockMessage?: string;
};

/** Assess after storage upload; may flag pending_review or rare post-OCR hard block. */
export async function assessUploadedPhoto(
  file: File,
  kind: PhotoUploadKind
): Promise<PhotoReviewAssessment> {
  if (moderationKillSwitchActive() || !isImageModerationEnabled()) {
    return { photoReviewStatus: "approved", photoRiskFlags: [], hardBlock: false };
  }

  const result = await scanPhotoSafetyDeep(file, kind);
  if (!result.allowed && result.hardBlock) {
    return {
      photoReviewStatus: "rejected",
      photoRiskFlags: result.photoRiskFlags || [],
      hardBlock: true,
      hardBlockMessage: photoModerationUserMessage()
    };
  }

  return {
    photoReviewStatus: result.photoReviewStatus || "approved",
    photoRiskFlags: result.photoRiskFlags || [],
    hardBlock: false
  };
}

export function toPhotoReviewMeta(
  kind: PhotoUploadKind,
  assessment: PhotoReviewAssessment
): PhotoReviewMeta {
  const type = kind === "cover" ? "cover" : "profile";
  return buildPhotoMetaEntry(type, assessment.photoReviewStatus, assessment.photoRiskFlags);
}

/** Fire-and-forget: assess risk, report to server review queue. */
export function reviewUploadedPhotoAsync(
  file: File,
  kind: PhotoUploadKind,
  photoUrl: string,
  onAssessed?: (meta: PhotoReviewMeta) => void
): void {
  if (moderationKillSwitchActive() || !isImageModerationEnabled()) return;

  logPhotoSafetyRiskAsync(file, kind, async (result) => {
    const type = kind === "cover" ? "cover" : "profile";
    const status = result.photoReviewStatus || "approved";
    const flags = result.photoRiskFlags || [];
    const meta = buildPhotoMetaEntry(type, status, flags);
    onAssessed?.(meta);

    if (photoUrl && status === "pending_review") {
      void submitPhotoReviewRemote({
        photoUrl,
        photoType: type,
        photoReviewStatus: status,
        photoRiskFlags: flags
      });
    }
  });
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
