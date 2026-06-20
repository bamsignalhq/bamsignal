import type { DatingProfile, PhotoReviewMeta, UserProfile } from "../types";
import { applyCanonicalMemberSnapshot, revalidateMemberProfileAfterUpdate } from "../services/memberProfileSync";
import { syncMemberProfileWithResult } from "../services/cityHome";
import { applyCoverPhotoUpdate } from "../utils/coverPhoto";
import { normalizeDatingProfile } from "../utils/profile";

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
  applyCanonicalMemberSnapshot(next);
  void syncMemberProfileWithResult(user, next, { patchScope: "photos" }).then(async (synced) => {
    if (!synced.ok) return;
    await revalidateMemberProfileAfterUpdate(user, { profile: synced.profile ?? next });
  });
  return next;
}
