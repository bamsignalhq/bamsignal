import type { DatingProfile, DiscoverProfile } from "../types";
import { safeArray, safeString } from "./safeProfile";

export function meetsDiscoveryQuality(
  profile: Pick<DiscoverProfile, "bio" | "intents" | "photo"> | Pick<DatingProfile, "bio" | "intents" | "photos">
): boolean {
  const hasPhoto =
    "photos" in profile
      ? safeArray<string>(profile.photos).length >= 1 && Boolean(safeArray<string>(profile.photos)[0])
      : Boolean(safeString(profile.photo).trim());
  const hasBio = safeString(profile.bio).trim().length >= 8;
  const hasIntent = safeArray(profile.intents).length >= 1;
  return hasPhoto && hasBio && hasIntent;
}
