/** Client flag — default off. Set VITE_ENABLE_IMAGE_MODERATION=true (or ENABLE_IMAGE_MODERATION in Docker) to re-enable. */
export function isImageModerationEnabled(): boolean {
  const raw = import.meta.env.VITE_ENABLE_IMAGE_MODERATION;
  if (raw === undefined || raw === "") return false;
  return raw === "true" || raw === "1";
}
