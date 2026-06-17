import {
  getPhotoModerationMode,
  isImageModerationEnabled,
  type PhotoModerationMode
} from "../config/imageModeration";
import { PHOTO_UPLOAD_FAIL, photoModerationUserMessage } from "../constants/photos";
import type { PhotoUploadErrorCode } from "../constants/photoUploadErrors";
import type { PhotoUploadKind } from "../constants/photoUploadKinds";
import { STORAGE_KEYS } from "../constants/limits";
import { CONTACT_LEAK_BLOCK_MESSAGE, scanTextForContactLeak } from "./contactGuard";
import { logPhotoSafetyRiskAsync, scanPhotoSafety } from "./photoSafetyScan";
import { logPhotoUpload } from "./photoUploadLog";
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
};

export function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return IMAGE_EXTENSIONS.test(file.name || "");
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
 * warn (default) — never blocks uploads; logs risk for ops review.
 * block — rejects only fast high-confidence filename/text issues.
 * Heavy checks (OCR, face, QR) are warn-only until the pipeline is stable.
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
    return { allowed: true, message: "", mode };
  }

  if (!isLikelyImageFile(file)) {
    return {
      allowed: false,
      message: PHOTO_UPLOAD_FAIL,
      code: "NOT_IMAGE",
      internalReason: `invalid_mime:${file.type}`,
      mode
    };
  }

  try {
    const safety = await scanPhotoSafety(file, kind, mode);

    if (mode === "warn") {
      resetPhotoModerationStrikes();
      logPhotoUpload("moderation_passed", {
        kind,
        mode,
        riskScore: safety.riskScore,
        warnOnly: true
      });
      return { allowed: true, message: "", mode, riskScore: safety.riskScore };
    }

    if (!safety.allowed) {
      logPhotoUpload("moderation_blocked", {
        kind,
        mode,
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
    return { allowed: true, message: "", mode, riskScore: safety.riskScore };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    logPhotoUpload("moderation_error", { kind, mode, reason });
    resetPhotoModerationStrikes();
    return { allowed: true, message: "", mode };
  }
}

/** Call after a successful storage upload to log deep risk without blocking. */
export function reviewUploadedPhotoAsync(file: File, kind: PhotoUploadKind): void {
  if (moderationKillSwitchActive() || !isImageModerationEnabled()) return;
  if (getPhotoModerationMode() !== "warn") return;
  logPhotoSafetyRiskAsync(file, kind);
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
