import type { DiscoverProfile } from "../types";

/** Premium wins when both Premium and Fast Connection are active. */
export function resolveMemberPlanBadge(profile: Pick<DiscoverProfile, "premium" | "fastConnectionActive">): "Premium" | "Fast" | null {
  if (profile.premium) return "Premium";
  if (profile.fastConnectionActive) return "Fast";
  return null;
}
