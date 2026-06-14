import { STORAGE_KEYS } from "../constants/limits";
import {
  containsDigits,
  containsOtherOffPlatform,
  containsTelegramOrHandle
} from "./contactGuard";
import { readJson, writeJson } from "./storage";

type StrikeRecord = { count: number };

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

/** Heuristic scan — blocks likely explicit portrait uploads without sending images off-device. */
export async function scanPhotoForExplicitContent(file: File): Promise<boolean> {
  if (!file.type.startsWith("image/")) return false;

  const bitmap = await loadImageBitmap(file);
  const size = 72;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  ctx.drawImage(bitmap, 0, 0, size, size);
  bitmap.close?.();

  const { data } = ctx.getImageData(0, 0, size, size);
  let skin = 0;
  let sampled = 0;
  let lowVariance = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x < size * 0.12 || x > size * 0.88 || y < size * 0.08 || y > size * 0.92) continue;
      const i = (y * size + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      sampled++;
      if (isSkinLike(r, g, b)) skin++;
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      if (spread < 28) lowVariance++;
    }
  }

  if (!sampled) return false;
  const skinRatio = skin / sampled;
  const flatRatio = lowVariance / sampled;
  return skinRatio > 0.68 && flatRatio > 0.42;
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

export async function moderatePhotoUpload(file: File): Promise<{ allowed: boolean; message: string }> {
  try {
    const flagged = await scanPhotoForExplicitContent(file);
    if (!flagged) {
      resetPhotoModerationStrikes();
      return { allowed: true, message: "" };
    }
  } catch {
    return { allowed: true, message: "" };
  }

  const { isFinal } = recordStrike(STORAGE_KEYS.photoModerationStrikes);
  if (isFinal) {
    return { allowed: false, message: "Such photo not allowed." };
  }
  return { allowed: false, message: "That photo couldn't be saved. Try a different one." };
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
