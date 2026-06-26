import { isBlobPreviewUrl, isDataUrl, isStoragePhotoUrl } from "./photoRefs";

/** Marketing / demo assets — never a member's backdrop. */
export function isShowcasePhotoUrl(src?: string | null): boolean {
  return Boolean(src?.startsWith("/showcase/"));
}

/** URLs safe to persist and render after refresh. */
export function isPersistablePhotoUrl(src?: string | null): boolean {
  if (!src || typeof src !== "string") return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (isBlobPreviewUrl(trimmed)) return false;
  if (import.meta.env.PROD && isDataUrl(trimmed)) return false;
  if (isStoragePhotoUrl(trimmed)) return true;
  if (trimmed.startsWith("/")) return true;
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return true;
  return false;
}

export function safeCoverPhoto(coverPhoto: unknown): string | undefined {
  const value = typeof coverPhoto === "string" ? coverPhoto.trim() : "";
  return isPersistablePhotoUrl(value) ? value : undefined;
}

/** Member backdrop — excludes bundled marketing / demo showcase assets. */
export function safeUserCoverPhoto(coverPhoto: unknown): string | undefined {
  const value = safeCoverPhoto(coverPhoto);
  if (!value || isShowcasePhotoUrl(value)) return undefined;
  return value;
}
