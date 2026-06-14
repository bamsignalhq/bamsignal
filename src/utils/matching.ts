import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { computeCompatibilityPercent, hasActivePreferences, matchesPreferences } from "./compatibility";
import { isOnlineNow } from "./activity";
import { isPreferNot } from "./profile";
import { calculateProfileStrength } from "./profileStrength";
import { meetsDiscoveryQuality } from "./launchSeed";
import { trustRankingBoost } from "./trustScore";

const COMPAT_WEIGHT = 35;
const ACTIVITY_WEIGHT = 18;
const VERIFICATION_WEIGHT = 10;
const COMPLETENESS_WEIGHT = 12;
const PREMIUM_WEIGHT = 8;
const RESPONSE_WEIGHT = 10;
const PREF_BONUS = 6;

function profileCompleteness(candidate: DiscoverProfile): number {
  let score = 0;
  if (candidate.photo) score += 25;
  if (candidate.bio.trim().length >= 12) score += 20;
  if ((candidate.interests?.length ?? 0) >= 2) score += 20;
  if (candidate.intents.length >= 1) score += 15;
  if (candidate.voiceIntroUrl) score += 10;
  if (candidate.verified) score += 10;
  return score;
}

function responseRateScore(candidate: DiscoverProfile): number {
  if (!candidate.lastActiveAt) return 20;
  const hours = (Date.now() - new Date(candidate.lastActiveAt).getTime()) / 3600000;
  if (hours < 6) return 100;
  if (hours < 24) return 85;
  if (hours < 72) return 60;
  if (hours < 168) return 35;
  return 10;
}

function preferenceBonus(candidate: DiscoverProfile, prefs: MatchPreferences): number {
  let bonus = 0;
  if (prefs.intents.length && candidate.intents.some((i) => prefs.intents.includes(i))) bonus += PREF_BONUS;
  if (prefs.religions.length && candidate.religion && prefs.religions.includes(candidate.religion)) bonus += PREF_BONUS;
  if (prefs.lifestyles.length && candidate.lifestyle && prefs.lifestyles.includes(candidate.lifestyle)) bonus += PREF_BONUS;
  if (prefs.cities.length && prefs.cities.includes(candidate.city)) bonus += PREF_BONUS;
  return bonus;
}

/** Intelligence ranking — best profiles first, inactive last */
export function scoreProfile(
  candidate: DiscoverProfile,
  viewer: DatingProfile,
  prefs: MatchPreferences
): number {
  if (!meetsDiscoveryQuality(candidate)) return -100;

  const compat = computeCompatibilityPercent(viewer, candidate);
  let score = (compat / 100) * COMPAT_WEIGHT;

  if (isOnlineNow(candidate.lastActiveAt)) score += ACTIVITY_WEIGHT;
  else if (candidate.lastActiveAt) {
    const days = (Date.now() - new Date(candidate.lastActiveAt).getTime()) / 86400000;
    if (days < 3) score += ACTIVITY_WEIGHT * 0.7;
    else if (days > 14) score -= 12;
  } else {
    score -= 20;
  }

  if (candidate.verified) score += VERIFICATION_WEIGHT + 4;
  score += trustRankingBoost(candidate);
  score += (profileCompleteness(candidate) / 100) * COMPLETENESS_WEIGHT;
  score += (responseRateScore(candidate) / 100) * RESPONSE_WEIGHT;
  if (candidate.premium) score += PREMIUM_WEIGHT;

  score += preferenceBonus(candidate, prefs);

  if (prefs.minCompatibility != null && compat < prefs.minCompatibility) score -= 50;
  if (prefs.requireVerified && !candidate.verified) score -= 40;
  if (prefs.requireVoiceIntro && !candidate.voiceIntroUrl) score -= 30;

  if (prefs.preferenceMode === "strict" && hasActivePreferences(prefs)) {
    if (!matchesPreferences(candidate, prefs)) score -= 80;
  }

  return score;
}

export function rankProfiles(
  candidates: DiscoverProfile[],
  viewer: DatingProfile,
  prefs: MatchPreferences
): DiscoverProfile[] {
  const viewerStrength = calculateProfileStrength(viewer);

  return [...candidates].sort((a, b) => {
    if (prefs.onlineNow) {
      const onlineDiff = Number(isOnlineNow(b.lastActiveAt)) - Number(isOnlineNow(a.lastActiveAt));
      if (onlineDiff !== 0) return onlineDiff;
    }
    const diff = scoreProfile(b, viewer, prefs) - scoreProfile(a, viewer, prefs);
    if (diff !== 0) return diff;
    const activityDiff =
      new Date(b.lastActiveAt ?? 0).getTime() - new Date(a.lastActiveAt ?? 0).getTime();
    if (activityDiff !== 0) return activityDiff;
    const compatDiff =
      computeCompatibilityPercent(viewer, b) - computeCompatibilityPercent(viewer, a);
    if (compatDiff !== 0) return compatDiff;
    void viewerStrength;
    return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
  });
}
