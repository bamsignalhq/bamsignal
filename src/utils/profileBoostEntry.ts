import type { DatingProfile, UserProfile } from "../types";
import { isViewerShadowBanned } from "./shadowBan";

export function canShowProfileBoostEntry(
  user: Pick<UserProfile, "email" | "phone">,
  profile: Pick<DatingProfile, "profilePausedAt">,
  options?: { deletePending?: boolean }
): boolean {
  if (isViewerShadowBanned(user.phone, user.email)) return false;
  if (profile.profilePausedAt) return false;
  if (options?.deletePending) return false;
  return true;
}
