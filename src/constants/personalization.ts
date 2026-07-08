export const PERSONALIZATION_MISSION =
  "Every member should experience BamSignal differently based on activity, trust, lifecycle stage and preferences — relevance only, never manipulation.";

export const PERSONALIZATION_ETHICS = [
  "No discrimination",
  "No manipulation",
  "No dark patterns",
  "No hidden pricing",
  "No fake scarcity",
  "No bias against non-premium users",
  "Recommendations must always be explainable",
  "Never create addictive patterns",
  "Respect privacy and notification preferences",
  "Communication remains owned by Macrista",
] as const;

export type PersonalizationSurface =
  | "home"
  | "discover"
  | "wallet"
  | "premium"
  | "notifications"
  | "campaigns"
  | "referral"
  | "onboarding";

export const PERSONALIZATION_SURFACES: {
  id: PersonalizationSurface;
  label: string;
  summary: string;
}[] = [
  { id: "home", label: "Home", summary: "Journey cues and today's suggestions" },
  { id: "discover", label: "Discover", summary: "Relevance ranking — quality over paywalls" },
  { id: "wallet", label: "Wallet", summary: "Top-up or rewards only when relevant" },
  { id: "premium", label: "Premium", summary: "Suggest Signal Pass only when it adds value" },
  { id: "notifications", label: "Notifications", summary: "Thoughtful reminders; no spam" },
  { id: "campaigns", label: "Campaigns", summary: "Lifecycle-aligned campaign eligibility" },
  { id: "referral", label: "Referral", summary: "Invite prompts when advocate-ready" },
  { id: "onboarding", label: "Onboarding", summary: "First-session guidance for new members" },
];

export type RecommendationPriority = "high" | "medium" | "low";

export type PersonalizationFlagMode =
  | "enabled"
  | "disabled"
  | "ab_test"
  | "percentage_rollout"
  | "founder_override";

export const PERSONALIZATION_FLAG_MODES: {
  id: PersonalizationFlagMode;
  label: string;
}[] = [
  { id: "enabled", label: "Enable" },
  { id: "disabled", label: "Disable" },
  { id: "ab_test", label: "A/B Testing" },
  { id: "percentage_rollout", label: "Percentage Rollout" },
  { id: "founder_override", label: "Founder Override" },
];

/** Premium may receive a tiny discover boost — never enough to hide quality free matches. */
export const DISCOVER_PREMIUM_WEIGHT_CAP = 0.05;

export const WALLET_LOW_BALANCE_THRESHOLD = 30;

export const PROFILE_COMPLETION_THRESHOLD = 80;
