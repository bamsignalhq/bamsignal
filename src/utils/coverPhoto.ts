import type { DatingProfile } from "../types";
import { isStoragePhotoUrl } from "./photoRefs";
import { isShowcasePhotoUrl, safeUserCoverPhoto } from "./persistablePhotoUrl";

export type CoverPhotoFields = {
  coverPhotoUrl?: string;
  coverPhotoPath?: string;
  coverPhotoExplicit?: boolean;
  coverPhotoUpdatedAt?: string;
  /** Legacy alias — kept in sync with coverPhotoUrl */
  coverPhoto?: string;
};

export type CoverPhotoUploadResult = {
  url: string;
  path?: string;
};

function pickString(data: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

/** Read canonical cover URL from any legacy field shape. */
export function readCoverPhotoUrl(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const data = raw as Record<string, unknown>;
  return safeUserCoverPhoto(
    pickString(data, "coverPhotoUrl", "coverPhoto", "coverImage", "backdropUrl", "backdropImage")
  );
}

export function normalizeCoverFields(raw: unknown): CoverPhotoFields {
  if (!raw || typeof raw !== "object") {
    return { coverPhotoExplicit: false };
  }
  const data = raw as Record<string, unknown>;
  const url = readCoverPhotoUrl(data);
  const explicit = url ? data.coverPhotoExplicit !== false : false;
  const updatedAt = pickString(data, "coverPhotoUpdatedAt");
  const path = pickString(data, "coverPhotoPath");

  return {
    coverPhotoUrl: url,
    coverPhoto: url,
    coverPhotoPath: path,
    coverPhotoExplicit: explicit,
    coverPhotoUpdatedAt: updatedAt
  };
}

export function applyCoverPhotoUpdate(
  profile: Partial<DatingProfile>,
  update: { url?: string; path?: string; explicit?: boolean }
): Partial<DatingProfile> {
  const url = update.url ? safeUserCoverPhoto(update.url) : undefined;
  const now = new Date().toISOString();

  if (!url) {
    return {
      ...profile,
      coverPhotoUrl: undefined,
      coverPhoto: undefined,
      coverPhotoPath: undefined,
      coverPhotoExplicit: false,
      coverPhotoUpdatedAt: undefined
    };
  }

  return {
    ...profile,
    coverPhotoUrl: url,
    coverPhoto: url,
    coverPhotoPath: update.path ?? profile.coverPhotoPath,
    coverPhotoExplicit: update.explicit ?? true,
    coverPhotoUpdatedAt: now
  };
}

function coverTimestamp(fields: CoverPhotoFields): number {
  if (!fields.coverPhotoUpdatedAt) return 0;
  const ts = new Date(fields.coverPhotoUpdatedAt).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

/** Merge local + remote cover — newer explicit storage URL wins; remote never dropped by stale local. */
export function mergeMemberCover(
  local: Partial<DatingProfile>,
  remote: Record<string, unknown>
): CoverPhotoFields {
  const localCover = normalizeCoverFields(local);
  const remoteCover = normalizeCoverFields(remote);

  if (!localCover.coverPhotoUrl && !remoteCover.coverPhotoUrl) {
    return { coverPhotoExplicit: false };
  }

  const localTs = coverTimestamp(localCover);
  const remoteTs = coverTimestamp(remoteCover);
  const localStorage = Boolean(
    localCover.coverPhotoUrl && isStoragePhotoUrl(localCover.coverPhotoUrl)
  );
  const remoteStorage = Boolean(
    remoteCover.coverPhotoUrl && isStoragePhotoUrl(remoteCover.coverPhotoUrl)
  );

  if (remoteCover.coverPhotoExplicit && remoteCover.coverPhotoUrl) {
    if (remoteTs >= localTs || !localCover.coverPhotoExplicit || !localStorage) {
      return remoteCover;
    }
  }

  if (localCover.coverPhotoExplicit && localCover.coverPhotoUrl && localStorage) {
    if (localTs > remoteTs || !remoteCover.coverPhotoUrl) {
      return localCover;
    }
  }

  if (remoteStorage && remoteCover.coverPhotoUrl) {
    return {
      ...remoteCover,
      coverPhotoExplicit: remoteCover.coverPhotoExplicit || localCover.coverPhotoExplicit || true
    };
  }

  if (localStorage && localCover.coverPhotoUrl) {
    return {
      ...localCover,
      coverPhotoExplicit: localCover.coverPhotoExplicit || remoteCover.coverPhotoExplicit || true
    };
  }

  return remoteTs >= localTs ? remoteCover : localCover;
}

/** Display URL with cache-bust query — does not mutate stored profile. */
export function coverPhotoDisplayUrl(fields: CoverPhotoFields): string | undefined {
  const url = readCoverPhotoUrl(fields);
  if (!url || fields.coverPhotoExplicit === false || isShowcasePhotoUrl(url)) {
    return undefined;
  }
  const version = fields.coverPhotoUpdatedAt;
  if (!version) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

export function hasExplicitCoverPhoto(profile: Partial<DatingProfile>): boolean {
  const cover = normalizeCoverFields(profile);
  return Boolean(cover.coverPhotoUrl && cover.coverPhotoExplicit !== false);
}
