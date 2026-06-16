import { MOCK_PROFILES } from "../data/mockProfiles";
import type { DiscoverProfile } from "../types";

/** Show preview cards until the feed has this many real member profiles. */
export const HOME_FEED_PREVIEW_UNTIL_MEMBERS = 9;

export const HOME_FEED_MIN_VISIBLE = 12;

function isSampleId(id: string): boolean {
  return id.startsWith("sample-");
}

/**
 * Prepend preview profiles so Near You looks alive while the member base is small.
 * Preview cards ignore age/gender filters — they are UI samples only.
 */
export function padHomeFeedWithSamples(
  profiles: DiscoverProfile[],
  options: {
    city: string;
    viewerCity?: string;
    excludeIds?: string[];
  }
): DiscoverProfile[] {
  const { city, viewerCity = "", excludeIds = [] } = options;
  const members = profiles.filter((profile) => !isSampleId(profile.id));
  if (members.length >= HOME_FEED_PREVIEW_UNTIL_MEMBERS) {
    return members;
  }

  const exclude = new Set([
    ...excludeIds,
    ...profiles.map((profile) => profile.id),
    ...profiles.map((profile) => (isSampleId(profile.id) ? profile.id : `sample-${profile.id}`))
  ]);

  const displayCity = city.trim() || viewerCity.trim() || "";
  const targetCount = Math.max(HOME_FEED_PREVIEW_UNTIL_MEMBERS, HOME_FEED_MIN_VISIBLE);
  const needed = Math.max(0, targetCount - members.length);

  const samples = MOCK_PROFILES.filter(
    (profile) => !exclude.has(profile.id) && !exclude.has(`sample-${profile.id}`)
  )
    .slice(0, needed)
    .map((profile, index) => ({
      ...profile,
      id: `sample-${profile.id}`,
      city: displayCity || profile.city,
      distanceKm: profile.distanceKm ?? 2 + (index % 7)
    }));

  return [...samples, ...members];
}

export function isSampleHomeProfile(profile: Pick<DiscoverProfile, "id">): boolean {
  return isSampleId(profile.id);
}

export function countMemberProfiles(profiles: DiscoverProfile[]): number {
  return profiles.filter((profile) => !isSampleId(profile.id)).length;
}
