import { DEFAULT_PROFILE_COVER } from "../constants/photos";
import type { DatingProfile } from "../types";
import { isBlobPreviewUrl, isDataUrl, isStoragePhotoUrl } from "./photoRefs";

export function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
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

export function safePhotos(photos: unknown): string[] {
  return safeArray<string>(photos)
    .map((photo) => safeString(photo).trim())
    .filter(isPersistablePhotoUrl);
}

export function safeCoverPhoto(coverPhoto: unknown): string | undefined {
  const value = safeString(coverPhoto).trim();
  return isPersistablePhotoUrl(value) ? value : undefined;
}

export function resolveCoverPhoto(
  profile: Pick<DatingProfile, "coverPhoto" | "coverPhotoExplicit" | "onboardingComplete">
): string {
  if (!profile.onboardingComplete) return DEFAULT_PROFILE_COVER;
  const cover = safeCoverPhoto(profile.coverPhoto);
  if (!cover) return DEFAULT_PROFILE_COVER;
  if (profile.coverPhotoExplicit === false) return DEFAULT_PROFILE_COVER;
  return cover;
}

export function hasExplicitCover(
  profile: Pick<DatingProfile, "coverPhoto" | "coverPhotoExplicit" | "onboardingComplete">
): boolean {
  if (!profile.onboardingComplete) return false;
  if (!safeCoverPhoto(profile.coverPhoto)) return false;
  return profile.coverPhotoExplicit !== false;
}

export function safeProfile(raw: Partial<DatingProfile> | null | undefined): Partial<DatingProfile> {
  if (!raw || typeof raw !== "object") return {};
  return {
    ...raw,
    photos: safePhotos(raw.photos),
    coverPhoto: safeCoverPhoto(raw.coverPhoto),
    bio: safeString(raw.bio),
    city: safeString(raw.city),
    state: safeString(raw.state)
  };
}
