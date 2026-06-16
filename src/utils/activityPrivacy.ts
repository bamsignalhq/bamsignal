import type { ActivityVisibility } from "../types";
import type { DiscoverProfile } from "../types";
import { normalizePrivacyVisibility } from "../constants/safety";
import { resolveSafetySettings } from "./safety";

export function resolveLastSeenVisibility(
  profile: Pick<DiscoverProfile, "safetySettings">
): ActivityVisibility {
  const safety = resolveSafetySettings(profile);
  return normalizePrivacyVisibility(
    safety.lastSeenVisibility ?? safety.activityVisibility ?? "connections_only"
  );
}

export function resolveOnlineStatusVisibility(
  profile: Pick<DiscoverProfile, "safetySettings">
): ActivityVisibility {
  const safety = resolveSafetySettings(profile);
  return normalizePrivacyVisibility(
    safety.onlineStatusVisibility ?? safety.activityVisibility ?? "connections_only"
  );
}

function canShowForVisibility(
  visibility: ActivityVisibility,
  options?: { isConnection?: boolean }
): boolean {
  if (visibility === "nobody") return false;
  if (visibility === "everyone") return true;
  return Boolean(options?.isConnection);
}

/** Whether another member may see this profile's last-seen label */
export function canShowLastSeen(
  profile: Pick<DiscoverProfile, "safetySettings">,
  options?: { isConnection?: boolean }
): boolean {
  return canShowForVisibility(resolveLastSeenVisibility(profile), options);
}

/** Whether another member may see online status for this profile */
export function canShowOnlineStatus(
  profile: Pick<DiscoverProfile, "safetySettings">,
  options?: { isConnection?: boolean }
): boolean {
  return canShowForVisibility(resolveOnlineStatusVisibility(profile), options);
}

/** @deprecated Use canShowLastSeen / canShowOnlineStatus */
export function canShowActivityStatus(
  profile: Pick<DiscoverProfile, "safetySettings">,
  options?: { isMatch?: boolean; isConnection?: boolean }
): boolean {
  return canShowLastSeen(profile, { isConnection: options?.isConnection ?? options?.isMatch });
}

export function readReceiptsAllowed(
  viewerSettings: Pick<DiscoverProfile, "safetySettings">,
  peerSettings: Pick<DiscoverProfile, "safetySettings">
): boolean {
  const viewerOn = resolveSafetySettings(viewerSettings).readReceiptsEnabled !== false;
  const peerOn = resolveSafetySettings(peerSettings).readReceiptsEnabled !== false;
  return viewerOn && peerOn;
}
