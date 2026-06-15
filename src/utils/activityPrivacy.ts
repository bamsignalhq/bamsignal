import type { ActivityVisibility } from "../types";
import type { DiscoverProfile } from "../types";
import { resolveSafetySettings } from "./safety";

export function resolveActivityVisibility(
  profile: Pick<DiscoverProfile, "safetySettings">
): ActivityVisibility {
  return resolveSafetySettings(profile).activityVisibility ?? "matches_only";
}

/** Whether another member may see this profile's activity badge on discovery surfaces */
export function canShowActivityStatus(
  profile: Pick<DiscoverProfile, "safetySettings">,
  options?: { isMatch?: boolean }
): boolean {
  const visibility = resolveActivityVisibility(profile);
  if (visibility === "nobody") return false;
  if (visibility === "everyone") return true;
  return Boolean(options?.isMatch);
}
