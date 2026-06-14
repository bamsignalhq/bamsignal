import type { DatingProfile, DiscoverProfile } from "../types";
import { calculateProfileStrength } from "./profileStrength";
import { getReportCount } from "./safety";
import { readJson } from "./storage";
import { STORAGE_KEYS } from "../constants/limits";

/** Hidden internal trust score 0–100 — never shown to users */
export function computeTrustScore(
  profile: Pick<
    DiscoverProfile,
    "id" | "verified" | "createdAt" | "lastActiveAt" | "bio" | "photo" | "intents" | "interests" | "voiceIntroUrl"
  > &
    Partial<DatingProfile>
): number {
  let score = 40;

  const asDating: DatingProfile = {
    photos: "photos" in profile && profile.photos?.length ? profile.photos : profile.photo ? [profile.photo] : [],
    age: profile.age ?? 25,
    gender: profile.gender ?? "Prefer not to say",
    city: profile.city ?? "",
    bio: profile.bio ?? "",
    lookingFor: profile.lookingFor ?? "Everyone",
    intents: profile.intents ?? [],
    interests: profile.interests ?? [],
    verified: profile.verified,
    premium: profile.premium ?? false,
    createdAt: profile.createdAt,
    voiceIntroUrl: profile.voiceIntroUrl
  };

  score += (calculateProfileStrength(asDating) / 100) * 25;

  if (profile.verified) score += 18;

  const accountDays = profile.createdAt
    ? Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400000)
    : 0;
  score += Math.min(12, accountDays * 0.8);

  const reports = getReportCount(profile.id);
  score -= reports * 8;

  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);
  if (blocked.includes(profile.id)) score -= 30;

  if (profile.lastActiveAt) {
    const daysSince = (Date.now() - new Date(profile.lastActiveAt).getTime()) / 86400000;
    if (daysSince < 3) score += 8;
    else if (daysSince > 21) score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Ranking boost from hidden trust — verified users benefit most */
export function trustRankingBoost(profile: DiscoverProfile): number {
  const trust = computeTrustScore(profile);
  let boost = (trust / 100) * 14;
  if (profile.verified) boost += 6;
  return boost;
}
