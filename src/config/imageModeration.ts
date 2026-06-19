export type PhotoModerationMode = "upload_first" | "review" | "strict";

/** Legacy alias — upload-first is the default production policy. */
export type LegacyPhotoModerationMode = "warn" | "block";

/** Master switch for optional client-side filename hints (never blocks upload). */
export function isImageModerationEnabled(): boolean {
  const raw = import.meta.env.VITE_ENABLE_IMAGE_MODERATION;
  if (raw === undefined || raw === "") return true;
  if (raw === "false" || raw === "0") return false;
  return raw === "true" || raw === "1";
}

/**
 * Client moderation mode — mirrors server PHOTO_MODERATION_MODE.
 * Upload-first: never block before storage; server decides review status.
 */
export function getPhotoModerationMode(): PhotoModerationMode {
  const raw = String(import.meta.env.VITE_PHOTO_MODERATION_MODE || "upload_first")
    .trim()
    .toLowerCase();

  if (raw === "strict") return "strict";
  if (raw === "review" || raw === "block") return "review";
  if (raw === "upload_first" || raw === "upload-first" || raw === "warn") return "upload_first";
  return "upload_first";
}
