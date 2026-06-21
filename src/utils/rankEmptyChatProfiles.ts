import { resolveStateName, stateForCity } from "../constants/profileOptions";
import type { DatingProfile, DiscoverProfile } from "../types";
import { safeArray, safeString } from "./safeProfile";

export type EmptyChatRankHints = {
  /** Future: boost members online right now */
  onlineNow?: boolean;
  /** Future: boost recently verified members */
  recentlyVerified?: boolean;
  /** Future: boost profiles with Voice Vibe */
  voiceVibeAvailable?: boolean;
  /** Future: boost profiles with fresh photos */
  newPhotosAdded?: boolean;
  /** Future: boost members who reply quickly */
  repliesQuickly?: boolean;
};

function profileCompletenessScore(profile: DiscoverProfile): number {
  let score = 0;
  if (profile.photo || safeArray<string>(profile.photos).length) score += 25;
  if (safeString(profile.bio).trim().length >= 12) score += 20;
  if (safeArray(profile.interests).length >= 2) score += 20;
  if (safeArray(profile.intents).length >= 1) score += 15;
  if (profile.voiceIntroUrl || profile.voiceVibeUrl) score += 10;
  if (profile.verified) score += 10;
  return score;
}

function activityScore(lastActiveAt?: string): number {
  if (!lastActiveAt) return 0;
  const hours = (Date.now() - new Date(lastActiveAt).getTime()) / 3600000;
  if (hours < 6) return 100;
  if (hours < 24) return 80;
  if (hours < 72) return 55;
  if (hours < 168) return 30;
  return 10;
}

/** Rank nearby members for the empty chats experience. */
export function rankEmptyChatProfiles(
  profiles: DiscoverProfile[],
  viewer: DatingProfile,
  max = 10
): DiscoverProfile[] {
  const viewerCity = safeString(viewer.city).trim().toLowerCase();
  const viewerState = resolveStateName(viewer.state || stateForCity(viewer.city) || "");

  const scored = profiles.map((profile) => {
    const city = safeString(profile.city).trim().toLowerCase();
    const state = resolveStateName(profile.state || stateForCity(profile.city) || "");
    let score = 0;

    if (profile.verified) score += 120;
    if (viewerCity && city && viewerCity === city) score += 90;
    else if (viewerState && state && viewerState === state) score += 45;

    score += activityScore(profile.lastActiveAt);
    score += profileCompletenessScore(profile) * 0.35;

    return { profile, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map((row) => row.profile)
    .slice(0, max);
}
