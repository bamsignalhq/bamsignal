import type { DatingProfile, PhotoReviewMeta, UserProfile } from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import { syncMemberProfileRemote } from "../services/cityHome";
import { applyCoverPhotoUpdate } from "../utils/coverPhoto";
import { normalizeDatingProfile } from "../utils/profile";
import { writeJson } from "../utils/storage";

export function persistCoverPhotoChange(
  user: Pick<UserProfile, "email" | "phone" | "name" | "username">,
  profile: DatingProfile,
  update: { url?: string; path?: string; photoMeta?: Record<string, PhotoReviewMeta> }
): DatingProfile {
  const withCover = applyCoverPhotoUpdate(
    { ...profile, photoMeta: update.photoMeta ?? profile.photoMeta },
    { url: update.url, path: update.path, explicit: Boolean(update.url) }
  );
  const next = normalizeDatingProfile(withCover);
  writeJson(STORAGE_KEYS.datingProfile, next);
  void syncMemberProfileRemote(user, next);
  return next;
}
