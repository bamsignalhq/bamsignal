import { samePhotoRef } from "./photoRefs";
import type { DatingProfile } from "../types";

function cleanPhotos(photos: string[]): string[] {
  return photos.filter(Boolean);
}

export function resolveMainPhotoUrl(
  photos: string[],
  mainPhotoUrl?: string | null
): string {
  const list = cleanPhotos(photos);
  if (!list.length) return "";
  if (mainPhotoUrl && list.some((url) => samePhotoRef(url, mainPhotoUrl))) return mainPhotoUrl;
  return list[0];
}

export function orderPhotosWithMainFirst(photos: string[], mainPhotoUrl?: string | null): string[] {
  const list = cleanPhotos(photos);
  if (!list.length) return [];
  const main = resolveMainPhotoUrl(list, mainPhotoUrl);
  const rest = list.filter((url) => !samePhotoRef(url, main));
  return [main, ...rest];
}

export function normalizeMainPhoto(
  photos: string[],
  mainPhotoUrl?: string | null
): { photos: string[]; mainPhotoUrl?: string } {
  const list = cleanPhotos(photos);
  if (!list.length) return { photos: [], mainPhotoUrl: undefined };
  const main = resolveMainPhotoUrl(list, mainPhotoUrl);
  return {
    photos: orderPhotosWithMainFirst(list, main),
    mainPhotoUrl: main
  };
}

export function mainPhotoAfterDelete(
  photos: string[],
  mainPhotoUrl: string | undefined,
  deletedUrl: string
): { photos: string[]; mainPhotoUrl?: string } {
  const list = cleanPhotos(photos).filter((url) => !samePhotoRef(url, deletedUrl));
  if (!list.length) return { photos: [], mainPhotoUrl: undefined };
  const wasMain = Boolean(deletedUrl && samePhotoRef(deletedUrl, mainPhotoUrl));
  const nextMain = wasMain ? list[0] : resolveMainPhotoUrl(list, mainPhotoUrl);
  return normalizeMainPhoto(list, nextMain);
}

export function setMainPhoto(photos: string[], url: string): { photos: string[]; mainPhotoUrl: string } {
  const normalized = normalizeMainPhoto(photos, url);
  return { photos: normalized.photos, mainPhotoUrl: normalized.mainPhotoUrl! };
}

export function addProfilePhotos(
  photos: string[],
  mainPhotoUrl: string | undefined,
  newUrls: string[]
): { photos: string[]; mainPhotoUrl?: string } {
  const list = [...cleanPhotos(photos), ...cleanPhotos(newUrls)];
  const main = mainPhotoUrl || list[0];
  return normalizeMainPhoto(list, main);
}

export function resolveProfileMainPhoto(profile: Pick<DatingProfile, "photos" | "mainPhotoUrl">): string {
  return resolveMainPhotoUrl(profile.photos, profile.mainPhotoUrl);
}

export function isMainPhoto(url: string, profile: Pick<DatingProfile, "photos" | "mainPhotoUrl">): boolean {
  const main = resolveMainPhotoUrl(profile.photos, profile.mainPhotoUrl);
  return Boolean(main && samePhotoRef(url, main));
}
