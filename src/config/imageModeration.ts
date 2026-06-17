/** Client flag — on by default. Set VITE_ENABLE_IMAGE_MODERATION=false to disable (local debugging only). */
export function isImageModerationEnabled(): boolean {
  const raw = import.meta.env.VITE_ENABLE_IMAGE_MODERATION;
  if (raw === undefined || raw === "") return true;
  if (raw === "false" || raw === "0") return false;
  return raw === "true" || raw === "1";
}
