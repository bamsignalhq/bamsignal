import {
  GENERIC_PHOTO_REJECT,
  GENERIC_PHOTO_REJECT_ALT,
  PHOTO_UPLOAD_FAIL
} from "../constants/photos";
import { STORAGE_KEYS } from "../constants/limits";
import {
  containsDigits,
  containsOtherOffPlatform,
  containsTelegramOrHandle
} from "./contactGuard";
import { scanImageForContactDetails } from "./imageContactScan";
import { readJson, writeJson } from "./storage";
import { trackEvent } from "./analytics";

type StrikeRecord = { count: number };

export type PhotoUploadKind = "profile" | "cover" | "selfie" | "signup";

const FACE_MESSAGE = PHOTO_UPLOAD_FAIL;
const SIGNUP_REJECT = PHOTO_UPLOAD_FAIL;

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i;

export function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return IMAGE_EXTENSIONS.test(file.name || "");
}

function isSkinLike(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 15) return false;
  if (r > 95 && g > 40 && b > 20 && r > g && r > b && r - g > 15) return true;
  if (r > 60 && g > 35 && b > 15 && r >= g && g >= b) return true;
  if (r > 120 && g > 80 && b > 50 && r - b < 80) return true;
  return false;
}

async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image load failed"));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0);
    return createImageBitmap(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

type PhotoScan = {
  explicit: boolean;
  validPortrait: boolean;
  reason: string;
};

async function scanProfilePhoto(file: File, kind: PhotoUploadKind): Promise<PhotoScan> {
  if (!isLikelyImageFile(file)) {
    return { explicit: false, validPortrait: false, reason: GENERIC_PHOTO_REJECT_ALT };
  }

  const bitmap = await loadImageBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close?.();

  if (width < 320 || height < 320) {
    return { explicit: false, validPortrait: false, reason: GENERIC_PHOTO_REJECT_ALT };
  }

  const ratio = width / height;
  if (kind === "cover") {
    if (ratio < 1.1 || ratio > 3.8) {
      return { explicit: false, validPortrait: false, reason: GENERIC_PHOTO_REJECT_ALT };
    }
    return { explicit: false, validPortrait: true, reason: "" };
  }

  if (ratio > 2.2 || ratio < 0.45) {
    return { explicit: false, validPortrait: false, reason: FACE_MESSAGE };
  }

  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { explicit: false, validPortrait: true, reason: "" };

  const reload = await loadImageBitmap(file);
  ctx.drawImage(reload, 0, 0, size, size);
  reload.close?.();

  const { data } = ctx.getImageData(0, 0, size, size);
  let skin = 0;
  let sampled = 0;
  let lowVariance = 0;
  let centerSkin = 0;
  let edgeSkin = 0;
  let centerSampled = 0;
  let edgeSampled = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x < size * 0.08 || x > size * 0.92 || y < size * 0.06 || y > size * 0.94) continue;
      const i = (y * size + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      sampled++;
      const skinHit = isSkinLike(r, g, b);
      if (skinHit) skin++;
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      if (spread < 28) lowVariance++;

      const inCenter = x > size * 0.28 && x < size * 0.72 && y > size * 0.18 && y < size * 0.78;
      if (inCenter) {
        centerSampled++;
        if (skinHit) centerSkin++;
      } else {
        edgeSampled++;
        if (skinHit) edgeSkin++;
      }
    }
  }

  if (!sampled) return { explicit: false, validPortrait: false, reason: FACE_MESSAGE };

  const skinRatio = skin / sampled;
  const flatRatio = lowVariance / sampled;
  const explicit = skinRatio > 0.68 && flatRatio > 0.42;
  const centerRatio = centerSampled ? centerSkin / centerSampled : 0;
  const edgeRatio = edgeSampled ? edgeSkin / edgeSampled : 0;

  if (explicit) {
    return { explicit: true, validPortrait: false, reason: GENERIC_PHOTO_REJECT };
  }

  if (centerRatio < 0.05) {
    return { explicit: false, validPortrait: false, reason: FACE_MESSAGE };
  }

  if (edgeRatio > 0.22 && edgeRatio > centerRatio * 1.35) {
    return { explicit: false, validPortrait: false, reason: FACE_MESSAGE };
  }

  return { explicit: false, validPortrait: true, reason: "" };
}

function recordStrike(storageKey: string): { count: number; isFinal: boolean } {
  const prev = readJson<StrikeRecord>(storageKey, { count: 0 });
  const count = prev.count + 1;
  writeJson(storageKey, { count });
  return { count, isFinal: count >= 3 };
}

function genericRejectMessage(kind: PhotoUploadKind, contactBlocked: boolean): string {
  if (contactBlocked) return GENERIC_PHOTO_REJECT_ALT;
  if (kind === "cover") return GENERIC_PHOTO_REJECT;
  return GENERIC_PHOTO_REJECT_ALT;
}

export function resetPhotoModerationStrikes(): void {
  writeJson(STORAGE_KEYS.photoModerationStrikes, { count: 0 });
}

export function resetVoiceModerationStrikes(): void {
  writeJson(STORAGE_KEYS.voiceModerationStrikes, { count: 0 });
}

/** Light checks for signup — no face heuristics; tolerates HEIC and empty MIME types. */
export async function moderateSignupPhotoUpload(
  file: File
): Promise<{ allowed: boolean; message: string }> {
  try {
    if (!isLikelyImageFile(file)) {
      return { allowed: false, message: SIGNUP_REJECT };
    }

    const contactScan = await scanImageForContactDetails(file, {
      strictTextHeavy: false,
      skipTextHeavy: true
    });
    if (contactScan.blocked) {
      return { allowed: false, message: SIGNUP_REJECT };
    }

    try {
      const bitmap = await loadImageBitmap(file);
      const width = bitmap.width;
      const height = bitmap.height;
      bitmap.close?.();
      if (width < 200 || height < 200) {
        return { allowed: false, message: SIGNUP_REJECT };
      }
    } catch {
      if (file.size < 8_000) {
        return { allowed: false, message: SIGNUP_REJECT };
      }
    }

    resetPhotoModerationStrikes();
    return { allowed: true, message: "" };
  } catch {
    return { allowed: true, message: "" };
  }
}

export async function moderatePhotoUpload(
  file: File,
  kind: PhotoUploadKind = "profile"
): Promise<{ allowed: boolean; message: string }> {
  if (kind === "signup") {
    return moderateSignupPhotoUpload(file);
  }
  try {
    const contactScan = await scanImageForContactDetails(file, {
      strictTextHeavy: kind === "cover"
    });
    if (contactScan.blocked) {
      return {
        allowed: false,
        message: genericRejectMessage(kind, true)
      };
    }

    const scan = await scanProfilePhoto(file, kind);
    if (scan.validPortrait) {
      resetPhotoModerationStrikes();
      return { allowed: true, message: "" };
    }

    if (scan.explicit) {
      trackEvent("photo_rejected_contact_text", { source: "explicit_heuristic" });
    }

    const { isFinal } = recordStrike(STORAGE_KEYS.photoModerationStrikes);
    if (contactScan.reason === "none" && (kind === "profile" || kind === "selfie")) {
      return {
        allowed: false,
        message: isFinal ? FACE_MESSAGE : scan.reason || GENERIC_PHOTO_REJECT_ALT
      };
    }

    return {
      allowed: false,
      message: genericRejectMessage(kind, false)
    };
  } catch {
    return { allowed: true, message: "" };
  }
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

/** @deprecated */
export async function scanPhotoForExplicitContent(file: File): Promise<boolean> {
  const scan = await scanProfilePhoto(file, "profile");
  return scan.explicit;
}
