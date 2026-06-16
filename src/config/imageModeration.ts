/** Client flag — set VITE_ENABLE_IMAGE_MODERATION=true to re-enable blocking moderation. */
export function isImageModerationEnabled(): boolean {
  const raw = import.meta.env.VITE_ENABLE_IMAGE_MODERATION;
  if (raw === undefined || raw === "") return false;
  return raw === "true" || raw === "1";
}
