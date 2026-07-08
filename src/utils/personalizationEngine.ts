/**
 * PROGRAM 002 M12 — Dynamic Personalization Engine
 * Relevance only. Deterministic fallback when personalization is unavailable.
 */
import type { DatingProfile, UserProfile } from "../types";
import { FREE_DAILY_SWIPES, STORAGE_KEYS } from "../constants/limits";
import {
  DISCOVER_PREMIUM_WEIGHT_CAP,
  PERSONALIZATION_ETHICS,
  PERSONALIZATION_MISSION,
  PROFILE_COMPLETION_THRESHOLD,
  WALLET_LOW_BALANCE_THRESHOLD,
  type PersonalizationFlagMode,
  type PersonalizationSurface,
} from "../constants/personalization";
import {
  RECOMMENDATION_REGISTRY,
  type RecommendationId,
  type RecommendationRule,
} from "../constants/recommendationRegistry";
import { getLifecycle, type UserLifecycleSnapshot } from "./userLifecycle";
import { calculateProfileStrength } from "./profileStrength";
import { computeTrustScore } from "./trustScore";
import { isPremiumActive } from "../services/premiumStatus";
import { getReferralState } from "./referrals";
import { countEvent, eventsSince, trackEvent } from "./analytics";
import { getActiveMarketingCampaigns } from "./marketingCampaignEngine";
import { readJson, writeJson } from "./storage";

export type PersonalizationProfile = {
  lifecycleStage: UserLifecycleSnapshot["stage"];
  trustScore: number;
  premiumStatus: boolean;
  profileCompletion: number;
  walletActivity: number;
  bayGoldBalance: number;
  referralStatus: {
    invitesSent: number;
    successfulReferrals: number;
    pendingRewards: number;
  };
  verificationStatus: {
    phone: boolean;
    selfie: boolean;
  };
  activityScore: number;
  discoveryBehaviour: {
    signalsSent: number;
    signalsToday: number;
    paywallVisits: number;
  };
  location: string;
  language: string;
  interests: string[];
  preferencesReady: boolean;
};

export type PersonalizedRecommendation = {
  id: RecommendationId;
  priority: RecommendationRule["priority"];
  surface: PersonalizationSurface;
  label: string;
  actionLabel: string;
  path?: string;
  reason: string;
  ethicsNote: string;
};

export type PersonalizationFlagState = {
  mode: PersonalizationFlagMode;
  percentage: number;
  founderOverride?: boolean;
  disabledIds: RecommendationId[];
};

type StoredPersonalization = {
  bayGoldBalance?: number;
  language?: string;
  flags?: PersonalizationFlagState;
  accepts?: { id: RecommendationId; at: string }[];
  impressions?: { id: RecommendationId; at: string }[];
  updatedAt?: string;
};

const PRIORITY_RANK: Record<RecommendationRule["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function loadStore(): StoredPersonalization {
  return readJson<StoredPersonalization>(STORAGE_KEYS.personalization, {});
}

function saveStore(next: StoredPersonalization): void {
  writeJson(STORAGE_KEYS.personalization, next);
}

function defaultFlags(): PersonalizationFlagState {
  return {
    mode: "enabled",
    percentage: 100,
    disabledIds: [],
  };
}

export function getPersonalizationFlags(): PersonalizationFlagState {
  return loadStore().flags ?? defaultFlags();
}

export function setPersonalizationFlags(
  patch: Partial<PersonalizationFlagState>,
): PersonalizationFlagState {
  const current = getPersonalizationFlags();
  const next = { ...current, ...patch, disabledIds: patch.disabledIds ?? current.disabledIds };
  const store = loadStore();
  store.flags = next;
  store.updatedAt = new Date().toISOString();
  saveStore(store);
  return next;
}

function isEngineActive(flags: PersonalizationFlagState): boolean {
  if (flags.founderOverride === false) return false;
  if (flags.mode === "disabled") return false;
  if (flags.mode === "percentage_rollout" && flags.percentage <= 0) return false;
  return true;
}

function fallbackRecommendations(surface: PersonalizationSurface): PersonalizedRecommendation[] {
  const rule =
    RECOMMENDATION_REGISTRY.find((r) => r.id === "START_DISCOVER" && r.surface === surface) ??
    RECOMMENDATION_REGISTRY.find((r) => r.id === "COMPLETE_PROFILE") ??
    RECOMMENDATION_REGISTRY[0];
  if (!rule) return [];
  return [
    {
      id: rule.id,
      priority: rule.priority,
      surface: rule.surface,
      label: rule.label,
      actionLabel: rule.actionLabel,
      path: rule.path,
      reason: "Deterministic fallback — personalization unavailable.",
      ethicsNote: rule.ethicsNote,
    },
  ];
}

function activityScoreFromEvents(): number {
  const active7 = eventsSince("daily_active", 7 * 86400000);
  const signals7 = eventsSince("signal_sent", 7 * 86400000);
  return Math.min(100, active7 * 12 + signals7 * 8);
}

export function getPersonalizationProfile(input?: {
  user?: UserProfile | null;
  profile?: DatingProfile | null;
}): PersonalizationProfile {
  const store = loadStore();
  const lifecycle = getLifecycle(input);
  const user =
    input?.user ??
    readJson<UserProfile | null>(STORAGE_KEYS.userProfile, null);
  const profile =
    input?.profile ??
    readJson<DatingProfile | null>(STORAGE_KEYS.datingProfile, null);

  const phoneVerified = Boolean(user?.phoneVerified);
  const premium = isPremiumActive();
  const strength = profile
    ? calculateProfileStrength(profile, { phoneVerified, isPremium: premium })
    : 0;
  const trust = profile
    ? computeTrustScore({
        ...profile,
        id: localStorage.getItem(STORAGE_KEYS.memberProfileId) || "self",
        photo: profile.photos?.[0],
        verified: Boolean(profile.verified),
        premium,
      })
    : 40;

  const referral = user ? getReferralState(user) : null;
  const signalsSent = countEvent("signal_sent");
  const signalsToday = eventsSince("signal_sent", 24 * 60 * 60 * 1000);
  const paywallVisits = countEvent("paywall_seen") + countEvent("upgrade_impression");
  const walletActivity = countEvent("payment_successful") + countEvent("boost_activated");

  return {
    lifecycleStage: lifecycle.stage,
    trustScore: Math.round(trust),
    premiumStatus: premium,
    profileCompletion: strength,
    walletActivity,
    bayGoldBalance: store.bayGoldBalance ?? 0,
    referralStatus: {
      invitesSent: referral?.invitesSent ?? 0,
      successfulReferrals: referral?.successfulReferrals ?? 0,
      pendingRewards: referral
        ? Math.max(
            0,
            Math.floor(referral.successfulReferrals / 3) - (referral.rewardsClaimed ?? 0),
          )
        : 0,
    },
    verificationStatus: {
      phone: phoneVerified,
      selfie: Boolean(profile?.verified),
    },
    activityScore: activityScoreFromEvents(),
    discoveryBehaviour: {
      signalsSent,
      signalsToday,
      paywallVisits,
    },
    location: profile?.city?.trim() || "",
    language: store.language ?? "en",
    interests: profile?.interests ?? [],
    preferencesReady: Boolean(profile?.lookingFor),
  };
}

export function updatePersonalization(patch: {
  bayGoldBalance?: number;
  language?: string;
}): PersonalizationProfile {
  const store = loadStore();
  if (typeof patch.bayGoldBalance === "number") store.bayGoldBalance = patch.bayGoldBalance;
  if (patch.language) store.language = patch.language;
  store.updatedAt = new Date().toISOString();
  saveStore(store);
  trackEvent("personalization_updated", {
    fields: Object.keys(patch).join(","),
  });
  return getPersonalizationProfile();
}

function eligible(
  rule: RecommendationRule,
  profile: PersonalizationProfile,
): { ok: boolean; reason: string } {
  if (!rule.enabled) return { ok: false, reason: "Rule disabled in registry" };
  const flags = getPersonalizationFlags();
  if (flags.disabledIds.includes(rule.id)) return { ok: false, reason: "Disabled by founder flag" };

  switch (rule.id) {
    case "COMPLETE_PROFILE":
      return {
        ok: profile.profileCompletion < PROFILE_COMPLETION_THRESHOLD,
        reason: `Profile ${profile.profileCompletion}% < ${PROFILE_COMPLETION_THRESHOLD}%`,
      };
    case "VERIFY_PHONE":
      return { ok: !profile.verificationStatus.phone, reason: "Phone not verified" };
    case "UPLOAD_PHOTOS": {
      const photos = readJson<DatingProfile | null>(STORAGE_KEYS.datingProfile, null)?.photos?.length ?? 0;
      return { ok: photos < 2, reason: `Photos: ${photos}` };
    }
    case "START_DISCOVER":
      return {
        ok: profile.discoveryBehaviour.signalsSent === 0 && profile.profileCompletion >= 40,
        reason: "No signals sent yet",
      };
    case "RECOMMENDED_MATCHES":
      return {
        ok: profile.preferencesReady && ["active", "engaged", "premium", "ambassador"].includes(profile.lifecycleStage),
        reason: "Active with preferences",
      };
    case "TODAYS_SUGGESTIONS":
      return {
        ok: profile.activityScore >= 12,
        reason: `Activity score ${profile.activityScore}`,
      };
    case "WALLET_BALANCE":
      return { ok: profile.walletActivity > 0 || profile.bayGoldBalance > 0, reason: "Has wallet activity" };
    case "BUY_BAYGOLD": {
      const campaignBoost = getActiveMarketingCampaigns().length > 0 && profile.bayGoldBalance < WALLET_LOW_BALANCE_THRESHOLD;
      const low = profile.bayGoldBalance < WALLET_LOW_BALANCE_THRESHOLD && profile.walletActivity > 0;
      return {
        ok: low || campaignBoost,
        reason: low
          ? `Balance ${profile.bayGoldBalance} < ${WALLET_LOW_BALANCE_THRESHOLD}`
          : "Low balance with active campaign",
      };
    }
    case "HIGHLIGHT_REWARD":
      return {
        ok: profile.referralStatus.pendingRewards > 0,
        reason: `${profile.referralStatus.pendingRewards} pending rewards`,
      };
    case "CAMPAIGN_BONUS":
      return {
        ok: getActiveMarketingCampaigns().length > 0 && profile.activityScore >= 12,
        reason: "Eligible active campaign",
      };
    case "SUGGEST_PREMIUM": {
      if (profile.premiumStatus) return { ok: false, reason: "Already premium" };
      const exhausted =
        profile.discoveryBehaviour.signalsToday >= FREE_DAILY_SWIPES ||
        profile.discoveryBehaviour.paywallVisits >= 2;
      return {
        ok: exhausted,
        reason: exhausted
          ? "Exhausted free signals or visited premium surfaces"
          : "No premium value signal",
      };
    }
    case "PREMIUM_INSIGHTS":
      return { ok: profile.premiumStatus, reason: "Premium active" };
    case "WELCOME_BACK":
      return {
        ok: profile.lifecycleStage === "dormant" || profile.lifecycleStage === "reactivated",
        reason: `Stage ${profile.lifecycleStage}`,
      };
    case "NEW_MEMBERS_NEARBY":
      return {
        ok:
          (profile.lifecycleStage === "dormant" || profile.lifecycleStage === "reactivated") &&
          Boolean(profile.location),
        reason: profile.location ? `City ${profile.location}` : "No city",
      };
    case "REFERRAL_BONUS": {
      const nearGoal = profile.referralStatus.successfulReferrals % 3 === 2;
      return {
        ok: nearGoal || profile.referralStatus.pendingRewards > 0,
        reason: nearGoal ? "Near referral reward" : "Pending reward",
      };
    }
    case "SHARE_REFERRAL":
      return {
        ok:
          profile.verificationStatus.phone &&
          profile.profileCompletion >= PROFILE_COMPLETION_THRESHOLD &&
          profile.referralStatus.invitesSent < 3,
        reason: "Verified complete profile with room to invite",
      };
    default:
      return { ok: false, reason: "Unknown rule" };
  }
}

function collect(
  surface: PersonalizationSurface,
  input?: { user?: UserProfile | null; profile?: DatingProfile | null },
): PersonalizedRecommendation[] {
  const flags = getPersonalizationFlags();
  if (!isEngineActive(flags)) return fallbackRecommendations(surface);

  try {
    const profile = getPersonalizationProfile(input);
    const picked: PersonalizedRecommendation[] = [];

    for (const rule of RECOMMENDATION_REGISTRY) {
      // Home aggregates home + onboarding + light referral cues
      const surfaceMatch =
        surface === "home"
          ? ["home", "onboarding", "referral"].includes(rule.surface)
          : rule.surface === surface;
      if (!surfaceMatch) continue;

      const check = eligible(rule, profile);
      if (!check.ok) continue;
      picked.push({
        id: rule.id,
        priority: rule.priority,
        surface: rule.surface,
        label: rule.label,
        actionLabel: rule.actionLabel,
        path: rule.path,
        reason: check.reason,
        ethicsNote: rule.ethicsNote,
      });
    }

    picked.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    const limited = picked.slice(0, surface === "home" ? 4 : 3);
    if (!limited.length) return fallbackRecommendations(surface);

    const store = loadStore();
    const impressions = Array.isArray(store.impressions) ? store.impressions.slice() : [];
    for (const item of limited) {
      impressions.push({ id: item.id, at: new Date().toISOString() });
      trackEvent("recommendation_impression", { id: item.id, surface });
    }
    store.impressions = impressions.slice(-100);
    saveStore(store);

    return limited;
  } catch {
    return fallbackRecommendations(surface);
  }
}

export function recommendHome(input?: {
  user?: UserProfile | null;
  profile?: DatingProfile | null;
}): PersonalizedRecommendation[] {
  return collect("home", input);
}

export function recommendDiscover(input?: {
  user?: UserProfile | null;
  profile?: DatingProfile | null;
}): PersonalizedRecommendation[] {
  return collect("discover", input);
}

export function recommendWallet(input?: {
  user?: UserProfile | null;
  profile?: DatingProfile | null;
}): PersonalizedRecommendation[] {
  return collect("wallet", input);
}

export function recommendPremium(input?: {
  user?: UserProfile | null;
  profile?: DatingProfile | null;
}): PersonalizedRecommendation[] {
  return collect("premium", input);
}

export function acceptRecommendation(id: RecommendationId): void {
  const store = loadStore();
  const accepts = Array.isArray(store.accepts) ? store.accepts.slice() : [];
  accepts.push({ id, at: new Date().toISOString() });
  store.accepts = accepts.slice(-100);
  saveStore(store);
  trackEvent("recommendation_accept", { id });
}

export function getPersonalizationAnalytics(): {
  impressions: number;
  accepts: number;
  acceptanceRate: number;
  byId: { id: RecommendationId; impressions: number; accepts: number }[];
} {
  const store = loadStore();
  const impressions = store.impressions ?? [];
  const accepts = store.accepts ?? [];
  const ids = [...new Set([...impressions.map((i) => i.id), ...accepts.map((a) => a.id)])];
  const byId = ids.map((id) => ({
    id,
    impressions: impressions.filter((i) => i.id === id).length,
    accepts: accepts.filter((a) => a.id === id).length,
  }));
  const impressionCount = impressions.length;
  const acceptCount = accepts.length;
  return {
    impressions: impressionCount,
    accepts: acceptCount,
    acceptanceRate: impressionCount ? Math.round((acceptCount / impressionCount) * 100) : 0,
    byId,
  };
}

export function getPersonalizationEthics(): readonly string[] {
  return PERSONALIZATION_ETHICS;
}

export function getPersonalizationMission(): string {
  return PERSONALIZATION_MISSION;
}

/** Tiny premium weight for discover — never hide quality free matches. */
export function discoverPremiumWeightCap(): number {
  return DISCOVER_PREMIUM_WEIGHT_CAP;
}

export function listRecommendationRegistry(): RecommendationRule[] {
  return RECOMMENDATION_REGISTRY.slice();
}
