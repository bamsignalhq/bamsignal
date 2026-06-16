import { isImageModerationEnabled } from "../config/imageModeration";
import { PHOTO_UPLOAD_FAIL } from "../constants/photos";
import type { PhotoUploadErrorCode } from "../constants/photoUploadErrors";
import { STORAGE_KEYS } from "../constants/limits";
import {
  containsDigits,
  containsOtherOffPlatform,
  containsTelegramOrHandle
} from "./contactGuard";
import { scanImageForContactDetails } from "./imageContactScan";
import { logPhotoUpload } from "./photoUploadLog";
import { readJson, writeJson } from "./storage";

type StrikeRecord = { count: number };

export type PhotoUploadKind = "profile" | "cover" | "selfie" | "signup";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i;

export type PhotoModerationResult = {
  allowed: boolean;
  message: string;
  code?: PhotoUploadErrorCode;
  internalReason?: string;
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

/**
 * When moderation is disabled (default), never blocks.
 * When enabled, only blocks high-confidence contact text (filename / OCR), not heuristics.
 */
export async function moderatePhotoUpload(
  file: File,
  kind: PhotoUploadKind = "profile"
): Promise<PhotoModerationResult> {
  const moderationEnabled = isImageModerationEnabled();

  logPhotoUpload("moderation_check", {
    kind,
    fileType: file.type || "unknown",
    fileName: file.name || "",
    originalSize: file.size,
    moderationEnabled
  });

  if (!moderationEnabled) {
    logPhotoUpload("moderation_skipped", { kind, reason: "feature_flag_disabled" });
    resetPhotoModerationStrikes();
    return { allowed: true, message: "" };
  }

  if (!isLikelyImageFile(file)) {
    return {
      allowed: false,
      message: PHOTO_UPLOAD_FAIL,
      code: "NOT_IMAGE",
      internalReason: `invalid_mime:${file.type}`
    };
  }

  const contactScan = await scanImageForContactDetails(file, {
    skipTextHeavy: true,
    contactTextOnly: true
  });

  if (contactScan.blocked) {
    logPhotoUpload("moderation_rejected", {
      kind,
      code: "MODERATION_REJECTED",
      reason: contactScan.reason
    });
    return {
      allowed: false,
      message: PHOTO_UPLOAD_FAIL,
      code: "MODERATION_REJECTED",
      internalReason: contactScan.reason
    };
  }

  resetPhotoModerationStrikes();
  logPhotoUpload("moderation_passed", { kind });
  return { allowed: true, message: "" };
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
  if (containsDigits(normalized)) {
    return { allowed: false, reason: "Numbers aren't allowed in voice intros." };
  }
  if (containsTelegramOrHandle(normalized)) {
    return { allowed: false, reason: "Telegram or @ handles aren't allowed in voice intros." };
  }
  if (containsOtherOffPlatform(normalized)) {
    return { allowed: false, reason: "Social handles and off-app contact details aren't allowed." };
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
