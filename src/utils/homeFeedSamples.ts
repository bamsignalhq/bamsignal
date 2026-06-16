import { MOCK_PROFILES } from "../data/mockProfiles";
import type { DatingProfile, DiscoverProfile } from "../types";

export const HOME_FEED_MIN_VISIBLE = 12;

function matchesLookingFor(viewer: DatingProfile, profile: DiscoverProfile): boolean {
  const looking = viewer.lookingFor?.toLowerCase() ?? "";
  const gender = profile.gender?.toLowerCase() ?? "";
  if (!looking || looking === "everyone") return true;
  if (looking.includes("women") || looking === "woman") return gender === "woman";
  if (looking.includes("men") || looking === "man") return gender === "man";
  return true;
}

/** Pad a sparse home feed with local preview profiles so the grid looks alive. */
export function padHomeFeedWithSamples(
  profiles: DiscoverProfile[],
  options: {
    city: string;
    ageMin: number;
    ageMax: number;
    viewer: DatingProfile;
    excludeIds?: string[];
  }
): DiscoverProfile[] {
  const { city, ageMin, ageMax, viewer, excludeIds = [] } = options;
  const exclude = new Set([...excludeIds, ...profiles.map((p) => p.id)]);
  const displayCity = city.trim() || viewer.city?.trim() || "your area";
  const needed = Math.max(0, HOME_FEED_MIN_VISIBLE - profiles.length);
  if (needed === 0) return profiles;

  const candidates = MOCK_PROFILES.filter(
    (profile) =>
      !exclude.has(profile.id) &&
      !exclude.has(`sample-${profile.id}`) &&
      profile.age >= ageMin &&
      profile.age <= ageMax &&
      matchesLookingFor(viewer, profile)
  );

  const pool = candidates.length >= needed ? candidates : MOCK_PROFILES.filter(
    (profile) =>
      !exclude.has(profile.id) &&
      !exclude.has(`sample-${profile.id}`) &&
      profile.age >= ageMin &&
      profile.age <= ageMax
  );

  const samples = pool.slice(0, needed).map((profile, index) => ({
    ...profile,
    id: `sample-${profile.id}`,
    city: displayCity === "your area" ? profile.city : displayCity,
    distanceKm: profile.distanceKm ?? 2 + (index % 7)
  }));

  return [...profiles, ...samples];
}

export function isSampleHomeProfile(profile: Pick<DiscoverProfile, "id">): boolean {
  return profile.id.startsWith("sample-");
}
