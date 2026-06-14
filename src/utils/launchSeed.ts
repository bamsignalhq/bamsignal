import { isQuickieMode } from "../constants/quickie";
import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { cityProximityTier } from "../constants/seedCities";
import { getDiscoverCityConfig } from "../constants/discoverCityConfig";
import { scoreProfile } from "./matching";
import { readJson, writeJson } from "./storage";

export const NEW_SIGNAL_BOOST_DAYS = 7;

type ImpressionMap = Record<string, { count: number; lastAt: string }>;

export function meetsDiscoveryQuality(
  profile: Pick<DiscoverProfile, "bio" | "intents" | "photo"> | Pick<DatingProfile, "bio" | "intents" | "photos">
): boolean {
  const hasPhoto =
    "photos" in profile
      ? profile.photos.length >= 1 && Boolean(profile.photos[0])
      : Boolean(profile.photo?.trim());
  const hasBio = profile.bio.trim().length >= 8;
  const hasIntent = (profile.intents?.length ?? 0) >= 1;
  return hasPhoto && hasBio && hasIntent;
}

export function isNewSignalProfile(profile: { createdAt?: string }): boolean {
  if (!profile.createdAt) return false;
  const joined = new Date(profile.createdAt).getTime();
  const cutoff = Date.now() - NEW_SIGNAL_BOOST_DAYS * 24 * 60 * 60 * 1000;
  return joined >= cutoff;
}

export function isRecentlyActive(profile: { lastActiveAt?: string }): boolean {
  if (!profile.lastActiveAt) return false;
  return Date.now() - new Date(profile.lastActiveAt).getTime() < 3 * 24 * 60 * 60 * 1000;
}

function getImpressions(): ImpressionMap {
  return readJson<ImpressionMap>(STORAGE_KEYS.discoveryImpressions, {});
}

export function recordDiscoveryImpression(profileId: string): void {
  const map = getImpressions();
  const prev = map[profileId];
  map[profileId] = {
    count: (prev?.count ?? 0) + 1,
    lastAt: new Date().toISOString()
  };
  writeJson(STORAGE_KEYS.discoveryImpressions, map);
}

function impressionPenalty(profileId: string): number {
  const entry = getImpressions()[profileId];
  if (!entry) return 0;
  const hoursSince = (Date.now() - new Date(entry.lastAt).getTime()) / 3600000;
  if (hoursSince > 48) return 0;
  return Math.min(entry.count * 12, 48);
}

function cityPriorityRank(viewerCity: string, candidateCity: string): number {
  const order = getDiscoverCityConfig().cityPriorities[viewerCity] ?? [];
  const idx = order.indexOf(candidateCity);
  return idx >= 0 ? idx : 99;
}

function seedScore(
  candidate: DiscoverProfile,
  viewer: DatingProfile,
  prefs: MatchPreferences
): number {
  let score = scoreProfile(candidate, viewer, prefs);

  const tier = cityProximityTier(viewer.city, candidate.city);
  score += [40, 28, 14, 0][tier] ?? 0;

  if (isNewSignalProfile(candidate)) score += 28;
  if (candidate.verified) score += 10;
  if (candidate.premium) score += 12;
  if (isRecentlyActive(candidate)) score += 14;

  score -= impressionPenalty(candidate.id);

  return score;
}

function bucket(profile: DiscoverProfile): "new" | "verified" | "premium" | "active" | "other" {
  if (isNewSignalProfile(profile)) return "new";
  if (profile.premium) return "premium";
  if (profile.verified) return "verified";
  if (isRecentlyActive(profile)) return "active";
  return "other";
}

function diversifyDeck(ranked: DiscoverProfile[]): DiscoverProfile[] {
  const buckets: Record<string, DiscoverProfile[]> = {
    new: [],
    verified: [],
    premium: [],
    active: [],
    other: []
  };

  for (const p of ranked) {
    buckets[bucket(p)].push(p);
  }

  const order = ["new", "verified", "active", "premium", "other"] as const;
  const out: DiscoverProfile[] = [];
  let added = true;

  while (added && out.length < ranked.length) {
    added = false;
    for (const key of order) {
      const next = buckets[key].shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }

  return out.length ? out : ranked;
}

/** Same city → nearby → regional → expansion, with quality + rotation */
export function buildDiscoveryDeck(
  candidates: DiscoverProfile[],
  viewer: DatingProfile,
  prefs: MatchPreferences
): DiscoverProfile[] {
  const viewerQuickie = isQuickieMode(viewer.intents);
  const eligible = candidates.filter(
    (p) => meetsDiscoveryQuality(p) && isQuickieMode(p.intents) === viewerQuickie
  );
  const scored = eligible
    .map((p) => ({
      p,
      tier: cityProximityTier(viewer.city, p.city),
      score: seedScore(p, viewer, prefs)
    }))
    .sort(
      (a, b) =>
        a.tier - b.tier ||
        cityPriorityRank(viewer.city, a.p.city) - cityPriorityRank(viewer.city, b.p.city) ||
        b.score - a.score ||
        (a.p.distanceKm ?? 99) - (b.p.distanceKm ?? 99)
    );

  const byTier = new Map<number, DiscoverProfile[]>();
  for (const { p, tier } of scored) {
    const list = byTier.get(tier) ?? [];
    list.push(p);
    byTier.set(tier, list);
  }

  const orderedTiers = [0, 1, 2, 3].filter((t) => byTier.has(t));
  return orderedTiers.flatMap((t) => diversifyDeck(byTier.get(t) ?? []));
}

export function countSameCityProfiles(
  candidates: DiscoverProfile[],
  viewerCity: string,
  blocked: string[],
  passed: string[]
): number {
  return candidates.filter(
    (p) =>
      meetsDiscoveryQuality(p) &&
      p.city === viewerCity &&
      !blocked.includes(p.id) &&
      !passed.includes(p.id)
  ).length;
}

export function markJoinedAt(): string {
  const at = new Date().toISOString();
  writeJson(STORAGE_KEYS.memberJoinedAt, at);
  return at;
}

export function getJoinedAt(): string | null {
  return readJson<string | null>(STORAGE_KEYS.memberJoinedAt, null);
}

export function persistCitySelection(profile: DatingProfile, city: string): DatingProfile {
  const next = { ...profile, city };
  writeJson(STORAGE_KEYS.datingProfile, { ...next, onboardingComplete: false });
  return next;
}
