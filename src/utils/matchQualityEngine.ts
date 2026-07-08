/**
 * PROGRAM 002 M7 — Match Quality Engine
 * Meaningful matches over raw swipe volume.
 */
import { normalizeOccupations } from "../constants/profileOptions";
import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { computeCompatibilityPercent, matchesPreferences } from "./compatibility";
import { isOnlineNow } from "./activity";
import { impressionPenalty } from "./matchQualityDiscovery";
import { calculateProfileStrength } from "./profileStrength";
import { computeTrustScore } from "./trustScore";
import { scoreProfile } from "./matching";
import { isAutoFlagged } from "./safety";
import { getReportCount } from "./reportCount";
import { isPreferNot } from "./preferNot";
import { safeString } from "./safeProfile";
import { relationshipDiscoverScore } from "./buildDiscoverRankingCore";
import { discoverPremiumWeightCap } from "./personalizationEngine";

export type MatchQualityFactorId =
  | "location"
  | "age"
  | "preferences"
  | "religion"
  | "occupation"
  | "lifestyle"
  | "activity"
  | "trust_score"
  | "profile_quality"
  | "response_rate";

export type MatchQualityBreakdown = Record<MatchQualityFactorId, number>;

export type MatchQualityScore = {
  total: number;
  breakdown: MatchQualityBreakdown;
  spamPenalty: number;
  inactivePenalty: number;
  repeatPenalty: number;
};

const INACTIVE_DAYS = 14;
const STALE_DAYS = 21;

function agePreferenceScore(
  _viewer: DatingProfile,
  candidate: DiscoverProfile,
  prefs: MatchPreferences
): number {
  const min = prefs.ageMin ?? 18;
  const max = prefs.ageMax ?? 99;
  const age = candidate.age ?? 0;
  if (age < min || age > max) return 0;
  const mid = (min + max) / 2;
  const spread = Math.max(1, (max - min) / 2);
  const distance = Math.abs(age - mid);
  return Math.max(0, 100 - (distance / spread) * 40);
}

function religionAlignment(viewer: DatingProfile, candidate: DiscoverProfile): number {
  const v = safeString(viewer.religion).trim();
  const c = safeString(candidate.religion).trim();
  if (!v || !c || isPreferNot(v) || isPreferNot(c)) return 30;
  return v === c ? 100 : 10;
}

function occupationAlignment(viewer: DatingProfile, candidate: DiscoverProfile): number {
  const viewerOcc = new Set(
    normalizeOccupations(viewer.occupations, viewer.occupation).filter((o) => !isPreferNot(o))
  );
  const candidateOcc = normalizeOccupations(candidate.occupations, candidate.occupation).filter(
    (o) => !isPreferNot(o)
  );
  if (!viewerOcc.size || !candidateOcc.length) return 40;
  return candidateOcc.some((o) => viewerOcc.has(o)) ? 100 : 35;
}

function lifestyleAlignment(viewer: DatingProfile, candidate: DiscoverProfile): number {
  return Math.round((computeCompatibilityPercent(viewer, candidate) / 100) * 55 + 20);
}

function activityScore(candidate: DiscoverProfile): number {
  if (isOnlineNow(candidate.lastActiveAt)) return 100;
  if (!candidate.lastActiveAt) return 5;
  const days = (Date.now() - new Date(candidate.lastActiveAt).getTime()) / 86400000;
  if (days < 1) return 90;
  if (days < 3) return 75;
  if (days < 7) return 55;
  if (days < INACTIVE_DAYS) return 30;
  return 0;
}

function responseRateScore(candidate: DiscoverProfile): number {
  return activityScore(candidate);
}

function profileQualityScore(candidate: DiscoverProfile): number {
  return calculateProfileStrength(candidate as DatingProfile);
}

function preferenceFit(candidate: DiscoverProfile, prefs: MatchPreferences): number {
  if (prefs.preferenceMode === "strict" && !matchesPreferences(candidate, prefs)) return 0;
  return matchesPreferences(candidate, prefs) ? 100 : 55;
}

function locationScore(viewer: DatingProfile, candidate: DiscoverProfile): number {
  if (viewer.city && candidate.city && viewer.city.toLowerCase() === candidate.city.toLowerCase()) {
    return 100;
  }
  if (candidate.distanceKm != null) {
    if (candidate.distanceKm <= 15) return 85;
    if (candidate.distanceKm <= 40) return 60;
    if (candidate.distanceKm <= 80) return 35;
  }
  return 20;
}

export function isInactiveDiscoverProfile(profile: DiscoverProfile): boolean {
  if (!profile.lastActiveAt) return true;
  const days = (Date.now() - new Date(profile.lastActiveAt).getTime()) / 86400000;
  return days > INACTIVE_DAYS;
}

export function isStaleDiscoverProfile(profile: DiscoverProfile): boolean {
  if (!profile.lastActiveAt) return true;
  const days = (Date.now() - new Date(profile.lastActiveAt).getTime()) / 86400000;
  return days > STALE_DAYS;
}

export function isSpamRiskProfile(profile: DiscoverProfile): boolean {
  if (isAutoFlagged(profile.id)) return true;
  if (getReportCount(profile.id) >= 2) return true;
  if (computeTrustScore(profile) < 25) return true;
  return false;
}

export function computeMatchQualityScore(
  viewer: DatingProfile,
  candidate: DiscoverProfile,
  prefs: MatchPreferences
): MatchQualityScore {
  const breakdown: MatchQualityBreakdown = {
    location: locationScore(viewer, candidate),
    age: agePreferenceScore(viewer, candidate, prefs),
    preferences: preferenceFit(candidate, prefs),
    religion: religionAlignment(viewer, candidate),
    occupation: occupationAlignment(viewer, candidate),
    lifestyle: lifestyleAlignment(viewer, candidate),
    activity: activityScore(candidate),
    trust_score: computeTrustScore(candidate),
    profile_quality: profileQualityScore(candidate),
    response_rate: responseRateScore(candidate)
  };

  const weights: Record<MatchQualityFactorId, number> = {
    location: 1.2,
    age: 0.9,
    preferences: 1.1,
    religion: 0.7,
    occupation: 0.6,
    lifestyle: 0.8,
    activity: 1.3,
    trust_score: 1.4,
    profile_quality: 1.0,
    response_rate: 1.2
  };

  let weighted = 0;
  let weightSum = 0;
  for (const key of Object.keys(breakdown) as MatchQualityFactorId[]) {
    weighted += breakdown[key] * weights[key];
    weightSum += weights[key];
  }

  const relationship = relationshipDiscoverScore(viewer, candidate);
  const intelligence = scoreProfile(candidate, viewer, prefs);

  // Premium visibility: tiny capped boost — never enough to bury quality free matches.
  const premiumBoost = candidate.premium ? 100 * discoverPremiumWeightCap() : 0;

  let spamPenalty = 0;
  if (isSpamRiskProfile(candidate)) spamPenalty = 500;

  let inactivePenalty = 0;
  if (isStaleDiscoverProfile(candidate)) inactivePenalty = 120;
  else if (isInactiveDiscoverProfile(candidate)) inactivePenalty = 60;

  const repeatPenalty = impressionPenalty(candidate.id);

  const total =
    weighted / weightSum +
    relationship * 0.35 +
    intelligence * 2.5 +
    premiumBoost -
    spamPenalty -
    inactivePenalty -
    repeatPenalty;

  return {
    total,
    breakdown,
    spamPenalty,
    inactivePenalty,
    repeatPenalty
  };
}

export function rankForMeaningfulMatches(
  profiles: DiscoverProfile[],
  viewer: DatingProfile,
  prefs: MatchPreferences
): DiscoverProfile[] {
  const eligible = profiles.filter((p) => !isSpamRiskProfile(p));

  return [...eligible].sort((a, b) => {
    const scoreA = computeMatchQualityScore(viewer, a, prefs).total;
    const scoreB = computeMatchQualityScore(viewer, b, prefs).total;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const activityDiff =
      new Date(b.lastActiveAt ?? 0).getTime() - new Date(a.lastActiveAt ?? 0).getTime();
    if (activityDiff !== 0) return activityDiff;
    return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
  });
}
