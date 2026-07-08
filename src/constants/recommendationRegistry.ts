/**
 * Recommendation Registry — single source of truth for auditable recommendations.
 * Add, remove, prioritize, or disable from here without hunting services.
 */
import type { LifecycleStage } from "./userLifecycle";
import type { PersonalizationSurface, RecommendationPriority } from "./personalization";

export type RecommendationId =
  | "COMPLETE_PROFILE"
  | "VERIFY_PHONE"
  | "UPLOAD_PHOTOS"
  | "START_DISCOVER"
  | "RECOMMENDED_MATCHES"
  | "TODAYS_SUGGESTIONS"
  | "WALLET_BALANCE"
  | "BUY_BAYGOLD"
  | "HIGHLIGHT_REWARD"
  | "CAMPAIGN_BONUS"
  | "SUGGEST_PREMIUM"
  | "PREMIUM_INSIGHTS"
  | "WELCOME_BACK"
  | "NEW_MEMBERS_NEARBY"
  | "REFERRAL_BONUS"
  | "SHARE_REFERRAL";

export type RecommendationRule = {
  id: RecommendationId;
  priority: RecommendationPriority;
  surface: PersonalizationSurface;
  label: string;
  actionLabel: string;
  path?: string;
  /** Human-readable eligibility — used in founder audits and member explanations */
  eligibility: string;
  lifecycleHint?: LifecycleStage[];
  enabled: boolean;
  /** Why this is relevance, not pressure */
  ethicsNote: string;
};

export const RECOMMENDATION_REGISTRY: RecommendationRule[] = [
  {
    id: "COMPLETE_PROFILE",
    priority: "high",
    surface: "home",
    label: "Complete your profile",
    actionLabel: "Finish profile",
    path: "/profile",
    eligibility: "Profile strength below 80%",
    lifecycleHint: ["registered", "verified"],
    enabled: true,
    ethicsNote: "Improves match relevance; never gated behind payment.",
  },
  {
    id: "VERIFY_PHONE",
    priority: "high",
    surface: "home",
    label: "Verify your phone",
    actionLabel: "Verify phone",
    path: "/trusted-member",
    eligibility: "Phone not verified",
    lifecycleHint: ["registered"],
    enabled: true,
    ethicsNote: "Trust unlock — never used to pressure purchases.",
  },
  {
    id: "UPLOAD_PHOTOS",
    priority: "high",
    surface: "onboarding",
    label: "Upload photos",
    actionLabel: "Add photos",
    path: "/profile",
    eligibility: "Fewer than 2 profile photos",
    lifecycleHint: ["registered", "verified"],
    enabled: true,
    ethicsNote: "Visibility improvement only.",
  },
  {
    id: "START_DISCOVER",
    priority: "high",
    surface: "home",
    label: "Start discovering",
    actionLabel: "Open Discover",
    path: "/discover",
    eligibility: "No signals sent yet",
    lifecycleHint: ["profile_complete", "active"],
    enabled: true,
    ethicsNote: "Activation help — not a paywall.",
  },
  {
    id: "RECOMMENDED_MATCHES",
    priority: "medium",
    surface: "discover",
    label: "Recommended matches",
    actionLabel: "See matches",
    path: "/discover",
    eligibility: "Active member with preferences set",
    lifecycleHint: ["active", "engaged", "premium"],
    enabled: true,
    ethicsNote: "Ranked by preferences, trust, and activity — premium weight capped.",
  },
  {
    id: "TODAYS_SUGGESTIONS",
    priority: "medium",
    surface: "home",
    label: "Today's suggestions",
    actionLabel: "View suggestions",
    path: "/discover",
    eligibility: "Active in last 7 days",
    lifecycleHint: ["active", "engaged"],
    enabled: true,
    ethicsNote: "Relevance cues from lifecycle — not urgency timers.",
  },
  {
    id: "WALLET_BALANCE",
    priority: "low",
    surface: "wallet",
    label: "Wallet balance",
    actionLabel: "Open Wallet",
    path: "/profile",
    eligibility: "Member has opened wallet at least once",
    lifecycleHint: ["active", "engaged", "premium"],
    enabled: true,
    ethicsNote: "Informational — never interrupts conversations.",
  },
  {
    id: "BUY_BAYGOLD",
    priority: "medium",
    surface: "wallet",
    label: "Top up BayGold",
    actionLabel: "Top up",
    path: "/profile",
    eligibility: "Wallet balance below 30 BayGold",
    lifecycleHint: ["active", "engaged", "premium"],
    enabled: true,
    ethicsNote: "Only when balance is low or a real campaign bonus applies — no fake scarcity.",
  },
  {
    id: "HIGHLIGHT_REWARD",
    priority: "medium",
    surface: "wallet",
    label: "Reward available",
    actionLabel: "Claim reward",
    path: "/referral",
    eligibility: "Pending referral or welcome reward",
    enabled: true,
    ethicsNote: "Surfaces earned rewards — not invented urgency.",
  },
  {
    id: "CAMPAIGN_BONUS",
    priority: "low",
    surface: "campaigns",
    label: "Campaign bonus",
    actionLabel: "See campaign",
    path: "/referral",
    eligibility: "Active marketing campaign with member-eligible segment",
    enabled: true,
    ethicsNote: "Campaign copy must stay truthful; no countdown pressure.",
  },
  {
    id: "SUGGEST_PREMIUM",
    priority: "low",
    surface: "premium",
    label: "Signal Pass may help",
    actionLabel: "Learn about Signal Pass",
    path: "/subscription",
    eligibility: "Exhausted daily signals, used advanced filters, or repeated premium feature visits",
    lifecycleHint: ["active", "engaged"],
    enabled: true,
    ethicsNote: "Suggest only when clearer value exists — never spam; never hide free quality.",
  },
  {
    id: "PREMIUM_INSIGHTS",
    priority: "medium",
    surface: "premium",
    label: "Premium insights",
    actionLabel: "Open Premium Center",
    path: "/subscription",
    eligibility: "Premium / Signal Pass active",
    lifecycleHint: ["premium", "ambassador"],
    enabled: true,
    ethicsNote: "Value delivery for paying members — not upsell loops.",
  },
  {
    id: "WELCOME_BACK",
    priority: "high",
    surface: "home",
    label: "Welcome back",
    actionLabel: "See who's new",
    path: "/discover",
    eligibility: "Lifecycle stage is dormant or returning reactivated",
    lifecycleHint: ["dormant", "reactivated"],
    enabled: true,
    ethicsNote: "Re-engagement without guilt or compulsion techniques.",
  },
  {
    id: "NEW_MEMBERS_NEARBY",
    priority: "medium",
    surface: "home",
    label: "New members nearby",
    actionLabel: "Discover nearby",
    path: "/discover",
    eligibility: "Dormant / reactivated with city on profile",
    lifecycleHint: ["dormant", "reactivated"],
    enabled: true,
    ethicsNote: "Location relevance — never inflates counts.",
  },
  {
    id: "REFERRAL_BONUS",
    priority: "medium",
    surface: "referral",
    label: "Referral bonus available",
    actionLabel: "Invite friends",
    path: "/referral",
    eligibility: "Near referral reward threshold or pending rewards",
    lifecycleHint: ["active", "engaged", "premium", "ambassador"],
    enabled: true,
    ethicsNote: "Honest progress toward stated reward rules.",
  },
  {
    id: "SHARE_REFERRAL",
    priority: "low",
    surface: "referral",
    label: "Share your referral code",
    actionLabel: "Share invite",
    path: "/referral",
    eligibility: "Profile complete and verified; no recent share insist",
    lifecycleHint: ["profile_complete", "active", "engaged", "premium", "ambassador"],
    enabled: true,
    ethicsNote: "Optional growth — never required for core features.",
  },
];

export function getRecommendationRule(id: RecommendationId): RecommendationRule | undefined {
  return RECOMMENDATION_REGISTRY.find((rule) => rule.id === id);
}

export function listEnabledRecommendations(
  surface?: PersonalizationSurface,
): RecommendationRule[] {
  return RECOMMENDATION_REGISTRY.filter(
    (rule) => rule.enabled && (!surface || rule.surface === surface),
  );
}
