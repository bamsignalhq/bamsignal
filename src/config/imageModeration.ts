export type PhotoModerationMode = "warn" | "block";

/** Master switch — when false, all moderation checks are skipped. */
export function isImageModerationEnabled(): boolean {
  const raw = import.meta.env.VITE_ENABLE_IMAGE_MODERATION;
  if (raw === undefined || raw === "") return true;
  if (raw === "false" || raw === "0") return false;
  return raw === "true" || raw === "1";
}

/**
 * warn — uploads always proceed; risk is logged for Command Center review.
 * block — reject only high-confidence filename/text issues (no OCR/face/QR yet).
 */
export function getPhotoModerationMode(): PhotoModerationMode {
  const raw = String(import.meta.env.VITE_PHOTO_MODERATION_MODE || "warn")
    .trim()
    .toLowerCase();
  return raw === "block" ? "block" : "warn";
}
