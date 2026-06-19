import { normalizeEthnicities, normalizeLifestyleTraits } from "../constants/profileOptions";
import { DEFAULT_PROFILE_COVER } from "../constants/photos";
import {
  coverPhotoDisplayUrl,
  hasExplicitCoverPhoto,
  mergeMemberCover,
  normalizeCoverFields,
  readCoverPhotoUrl
} from "./coverPhoto";
import { normalizeIntents } from "../constants/intents";
import type { DatingProfile, DiscoverProfile, IntentTag, UserProfile } from "../types";
import { isBlobPreviewUrl, isDataUrl, isStoragePhotoUrl } from "./photoRefs";
import { resolveMainPhotoUrl } from "./mainPhoto";

/** Marketing / demo assets — never a member's backdrop. */
export function isShowcasePhotoUrl(src?: string | null): boolean {
  return Boolean(src?.startsWith("/showcase/"));
}

export function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
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

/** Member backdrop — excludes bundled marketing / demo showcase assets. */
export function safeUserCoverPhoto(coverPhoto: unknown): string | undefined {
  const value = safeCoverPhoto(coverPhoto);
  if (!value || isShowcasePhotoUrl(value)) return undefined;
  return value;
}

/** Prefer a member-uploaded backdrop when merging local + server profile snapshots. */
export { mergeMemberCover } from "./coverPhoto";

export function resolveCoverPhoto(
  profile: Pick<DatingProfile, "coverPhoto" | "coverPhotoUrl" | "coverPhotoExplicit" | "coverPhotoUpdatedAt" | "onboardingComplete">,
  options?: { fallback?: string | null }
): string | null {
  const fallback =
    options?.fallback === undefined ? DEFAULT_PROFILE_COVER : options.fallback;
  const display = coverPhotoDisplayUrl(normalizeCoverFields(profile));
  if (!display) {
    return fallback;
  }
  return display;
}

export function hasExplicitCover(
  profile: Pick<DatingProfile, "coverPhoto" | "coverPhotoUrl" | "coverPhotoExplicit" | "coverPhotoUpdatedAt">
): boolean {
  return hasExplicitCoverPhoto(profile);
}

export function safeProfile(raw: Partial<DatingProfile> | null | undefined): Partial<DatingProfile> {
  if (!raw || typeof raw !== "object") return {};
  return {
    ...raw,
    photos: safePhotos(raw.photos),
    coverPhoto: readCoverPhotoUrl(raw) ?? safeUserCoverPhoto(raw.coverPhoto),
    bio: safeString(raw.bio),
    city: safeString(raw.city),
    state: safeString(raw.state),
    intents: normalizeIntents(safeArray<string>(raw.intents)),
    interests: safeArray<string>(raw.interests).map((item) => safeString(item)).filter(Boolean),
    profilePrompts: safeArray(raw.profilePrompts)
  };
}

export function safeUserProfile(raw: Partial<UserProfile> | null | undefined): UserProfile {
  if (!raw || typeof raw !== "object") {
    return { name: "", email: "", phone: "" };
  }
  return {
    name: safeString(raw.name),
    email: safeString(raw.email),
    phone: safeString(raw.phone),
    username: raw.username ? safeString(raw.username) : undefined,
    phoneVerified: Boolean(raw.phoneVerified),
    avatar: raw.avatar ? safeString(raw.avatar) : undefined,
    referralCode: raw.referralCode ? safeString(raw.referralCode) : undefined
  };
}

export function memberFirstName(
  user: Pick<UserProfile, "name" | "username">,
  fallback = "there"
): string {
  const name = safeString(user.name).trim();
  if (name) {
    const first = name.split(/\s+/)[0];
    if (first) return first;
  }
  return safeString(user.username) || fallback;
}

export function safeDiscoverProfile(raw: Partial<DiscoverProfile>): DiscoverProfile {
  const photos = safePhotos(raw.photos?.length ? raw.photos : raw.photo ? [raw.photo] : []);
  const photo =
    resolveMainPhotoUrl(photos, safeString(raw.mainPhotoUrl) || undefined) ||
    safeString(raw.photo) ||
    DEFAULT_PROFILE_COVER;
  return {
    id: safeString(raw.id, "unknown"),
    name: safeString(raw.name, "Member"),
    age: safeNumber(raw.age, 25),
    gender: raw.gender,
    lookingFor: raw.lookingFor,
    city: safeString(raw.city),
    state: safeString(raw.state) || undefined,
    bio: safeString(raw.bio),
    photo: isPersistablePhotoUrl(photo) ? photo : DEFAULT_PROFILE_COVER,
    photos: photos.length ? photos : [DEFAULT_PROFILE_COVER],
    intents: normalizeIntents(safeArray<string>(raw.intents)),
    interests: safeArray<string>(raw.interests).map((item) => safeString(item)).filter(Boolean),
    religion: raw.religion,
    ethnicity: raw.ethnicity,
    ethnicities: normalizeEthnicities(raw.ethnicities, raw.ethnicity),
    stateOfOrigin: raw.stateOfOrigin,
    statesOfOrigin: safeArray(raw.statesOfOrigin),
    occupation: raw.occupation,
    occupations: safeArray(raw.occupations),
    genotype: raw.genotype,
    genotypes: safeArray(raw.genotypes),
    kidsPreference: raw.kidsPreference,
    hasKidsOptions: safeArray(raw.hasKidsOptions),
    wantsKidsOptions: safeArray(raw.wantsKidsOptions),
    lifestyle: raw.lifestyle,
    lifestyles: normalizeLifestyleTraits(raw.lifestyles),
    bodyTypes: safeArray(raw.bodyTypes),
    voiceIntroUrl: raw.voiceIntroUrl ? safeString(raw.voiceIntroUrl) : undefined,
    distanceKm: raw.distanceKm != null ? safeNumber(raw.distanceKm) : undefined,
    verified: Boolean(raw.verified),
    safetySettings: raw.safetySettings,
    premium: Boolean(raw.premium),
    createdAt: raw.createdAt ? safeString(raw.createdAt) : undefined,
    lastActiveAt: raw.lastActiveAt ? safeString(raw.lastActiveAt) : undefined,
    isFoundingMember: Boolean(raw.isFoundingMember)
  };
}
