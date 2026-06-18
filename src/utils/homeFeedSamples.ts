import { MOCK_PROFILES } from "../data/mockProfiles";
import { SHOWCASE_PROFILE_POOL } from "../constants/showcase";
import type { DiscoverProfile } from "../types";

/** Show preview cards until the feed has this many real member profiles. */
export const HOME_FEED_PREVIEW_UNTIL_MEMBERS = 9;

export const HOME_FEED_MIN_VISIBLE = 12;

const SAMPLE_CACHE = new Map<string, DiscoverProfile[]>();

function isSampleId(id: string): boolean {
  return id.startsWith("sample-");
}

function citySampleCacheKey(city: string, count: number): string {
  return `${city.trim().toLowerCase() || "default"}::${count}`;
}

function uniqueDemoPhoto(index: number, usedPhotos: Set<string>, fallback: string): string {
  for (let i = 0; i < SHOWCASE_PROFILE_POOL.length; i += 1) {
    const photo = SHOWCASE_PROFILE_POOL[(index + i) % SHOWCASE_PROFILE_POOL.length];
    if (!usedPhotos.has(photo)) {
      usedPhotos.add(photo);
      return photo;
    }
  }
  usedPhotos.add(fallback);
  return fallback;
}

/** Same city always gets the same preview faces — avoids shuffle/blink on refetch. */
function getStableSamplesForCity(city: string, count: number, excludeIds: string[]): DiscoverProfile[] {
  const displayCity = city.trim() || "";
  const cacheKey = citySampleCacheKey(displayCity, count);
  const cached = SAMPLE_CACHE.get(cacheKey);
  if (cached) return cached;

  const exclude = new Set(excludeIds);
  const sorted = [...MOCK_PROFILES].sort((a, b) => a.id.localeCompare(b.id));
  let seed = 0;
  const key = displayCity.toLowerCase() || "default";
  for (let i = 0; i < key.length; i += 1) seed += key.charCodeAt(i);

  const samples: DiscoverProfile[] = [];
  const usedPhotos = new Set<string>();
  for (let i = 0; i < sorted.length && samples.length < count; i += 1) {
    const profile = sorted[(seed + i) % sorted.length];
    const sampleId = `sample-${profile.id}`;
    if (exclude.has(profile.id) || exclude.has(sampleId)) continue;
    samples.push({
      ...profile,
      id: sampleId,
      city: displayCity || profile.city,
      photo: uniqueDemoPhoto(samples.length, usedPhotos, profile.photo),
      distanceKm: profile.distanceKm ?? 2 + (samples.length % 7)
    });
  }

  SAMPLE_CACHE.set(cacheKey, samples);
  return samples;
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

  const displayCity = city.trim() || viewerCity.trim() || "";
  const targetCount = Math.max(HOME_FEED_PREVIEW_UNTIL_MEMBERS, HOME_FEED_MIN_VISIBLE);
  const needed = Math.max(0, targetCount - members.length);
  if (needed === 0) return members;

  const memberIds = new Set(members.map((profile) => profile.id));
  const samples = getStableSamplesForCity(displayCity, targetCount, excludeIds).filter(
    (profile) => !memberIds.has(profile.id) && !memberIds.has(profile.id.replace(/^sample-/, ""))
  );

  return [...samples.slice(0, needed), ...members];
}

export function isSampleHomeProfile(profile: Pick<DiscoverProfile, "id">): boolean {
  return isSampleId(profile.id);
}

export function countMemberProfiles(profiles: DiscoverProfile[]): number {
  return profiles.filter((profile) => !isSampleId(profile.id)).length;
}
