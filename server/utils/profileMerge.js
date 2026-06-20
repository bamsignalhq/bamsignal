/** Safe merge for app_member_profiles.profile JSON — scoped patches avoid last-write-wins races. */

import {
  normalizeProfilePatchScope,
  pickProfilePatchFields,
  PROFILE_EDITOR_KEYS,
  PROFILE_VOICE_KEYS
} from "../../shared/profilePatch.mjs";
import { sanitizeMemberPhotoMeta } from "../../shared/photoReview.mjs";

function pickCover(raw = {}) {
  return raw.coverPhotoUrl || raw.coverPhoto || null;
}

function coverTimestamp(raw = {}) {
  const value = raw.coverPhotoUpdatedAt;
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

function mergePhotoFields(existing = {}, incoming = {}, target = {}) {
  const existingCover = pickCover(existing);
  const incomingCover = pickCover(incoming);
  const existingTs = coverTimestamp(existing);
  const incomingTs = coverTimestamp(incoming);

  if (incomingCover) {
    const useIncoming =
      !existingCover || incomingTs >= existingTs || incoming.coverPhotoExplicit === true;
    if (useIncoming) {
      target.coverPhotoUrl = incomingCover;
      target.coverPhoto = incomingCover;
      target.coverPhotoPath = incoming.coverPhotoPath ?? existing.coverPhotoPath ?? null;
      target.coverPhotoExplicit = incoming.coverPhotoExplicit ?? true;
      target.coverPhotoUpdatedAt =
        incoming.coverPhotoUpdatedAt ?? existing.coverPhotoUpdatedAt ?? new Date().toISOString();
    } else {
      target.coverPhotoUrl = existingCover;
      target.coverPhoto = existingCover;
      target.coverPhotoPath = existing.coverPhotoPath ?? incoming.coverPhotoPath ?? null;
      target.coverPhotoExplicit = existing.coverPhotoExplicit ?? incoming.coverPhotoExplicit ?? true;
      target.coverPhotoUpdatedAt = existing.coverPhotoUpdatedAt ?? incoming.coverPhotoUpdatedAt ?? null;
    }
  } else if (existingCover) {
    target.coverPhotoUrl = existingCover;
    target.coverPhoto = existingCover;
    target.coverPhotoPath = existing.coverPhotoPath ?? null;
    target.coverPhotoExplicit = existing.coverPhotoExplicit ?? false;
    target.coverPhotoUpdatedAt = existing.coverPhotoUpdatedAt ?? null;
  }

  if (!Array.isArray(incoming.photos) || incoming.photos.length === 0) {
    target.photos = Array.isArray(existing.photos) ? existing.photos : incoming.photos ?? [];
  } else {
    target.photos = incoming.photos.filter(Boolean);
  }

  if (!incoming.mainPhotoUrl && existing.mainPhotoUrl) {
    target.mainPhotoUrl = existing.mainPhotoUrl;
  } else if (incoming.mainPhotoUrl) {
    target.mainPhotoUrl = incoming.mainPhotoUrl;
  }

  const photos = Array.isArray(target.photos) ? target.photos.filter(Boolean) : [];
  target.photos = photos;
  const cover = pickCover(target);
  const allowedPhotoUrls = cover ? [...photos, cover] : photos;
  target.photoMeta = sanitizeMemberPhotoMeta(existing.photoMeta, incoming.photoMeta, allowedPhotoUrls);

  return target;
}

export function mergeMemberProfilePayload(existing = {}, incoming = {}, options = {}) {
  const patchScope = normalizeProfilePatchScope(options.patchScope);
  const base = { ...existing };

  if (patchScope === "profile") {
    return { ...base, ...pickProfilePatchFields(incoming, PROFILE_EDITOR_KEYS) };
  }

  if (patchScope === "voice") {
    return { ...base, ...pickProfilePatchFields(incoming, PROFILE_VOICE_KEYS) };
  }

  if (patchScope === "photos") {
    return mergePhotoFields(existing, incoming, { ...base });
  }

  const next = { ...base, ...incoming };
  return mergePhotoFields(existing, incoming, next);
}
