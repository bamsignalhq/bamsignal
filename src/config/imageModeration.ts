export type PhotoModerationMode = "warn" | "block";

/** Master switch — upload-first: moderation heuristics disabled by default. */
export function isImageModerationEnabled(): boolean {
  const raw = import.meta.env.VITE_ENABLE_IMAGE_MODERATION;
  if (raw === undefined || raw === "") return false;
  if (raw === "false" || raw === "0") return false;
  return raw === "true" || raw === "1";
}

/**
 * Upload-first policy — mode is retained for logging only.
 * Weak heuristics never hard-block; only contact/doc filename leaks do.
 */
export function getPhotoModerationMode(): PhotoModerationMode {
  const raw = String(import.meta.env.VITE_PHOTO_MODERATION_MODE || "warn")
    .trim()
    .toLowerCase();
  return raw === "block" ? "block" : "warn";
}
