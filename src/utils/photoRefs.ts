import { sameImageDataUrl } from "./imageContactScan";

const STORAGE_PUBLIC_RE =
  /\/storage\/v1\/object\/public\/(profile-photos|cover-photos)\/(.+)$/i;

export function isDataUrl(src?: string | null): boolean {
  return Boolean(src?.startsWith("data:image/"));
}

export function isBlobPreviewUrl(src?: string | null): boolean {
  return Boolean(src?.startsWith("blob:"));
}

export function isStoragePhotoUrl(src?: string | null): boolean {
  if (!src) return false;
  return STORAGE_PUBLIC_RE.test(src);
}

const VOICE_STORAGE_PUBLIC_RE = /\/storage\/v1\/object\/public\/voice-intros\//i;

export function isStorageVoiceIntroUrl(src?: string | null): boolean {
  if (!src) return false;
  return VOICE_STORAGE_PUBLIC_RE.test(src);
}

export function parseStoragePhotoRef(src: string): { bucket: string; path: string } | null {
  const match = src.match(STORAGE_PUBLIC_RE);
  if (!match) return null;
  return { bucket: match[1], path: decodeURIComponent(match[2]) };
}

/** Compare gallery/cover refs — exact URL, storage path, or legacy data URL equality. */
export function samePhotoRef(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  if (a === b) return true;

  const storageA = parseStoragePhotoRef(a);
  const storageB = parseStoragePhotoRef(b);
  if (storageA && storageB) {
    return storageA.bucket === storageB.bucket && storageA.path === storageB.path;
  }

  if (isDataUrl(a) && isDataUrl(b)) {
    return sameImageDataUrl(a, b);
  }

  return false;
}
