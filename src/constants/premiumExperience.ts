import type { PlanId } from "./plans";

export type PremiumFeatureId =
  | "unlimited_signals"
  | "advanced_filters"
  | "priority_placement"
  | "read_receipts"
  | "exclusive_badge"
  | "profile_insights"
  | "future_benefits";

export type PremiumFeatureAudit = {
  id: PremiumFeatureId;
  label: string;
  summary: string;
  valueNote: string;
  freeTier: string;
  premiumTier: string;
};

export const PREMIUM_EXPERIENCE_MISSION =
  "Premium should feel valuable every day — members naturally understand why Signal Pass exists.";

export const PREMIUM_GRACE_DAYS = 3;

export const PREMIUM_RENEWAL_STAGES = [
  { id: "seven_days", label: "7 days before", daysBefore: 7 },
  { id: "three_days", label: "3 days before", daysBefore: 3 },
  { id: "one_day", label: "1 day before", daysBefore: 1 },
  { id: "expiry", label: "Expiry day", daysBefore: 0 },
  { id: "grace", label: "Grace period", daysBefore: -PREMIUM_GRACE_DAYS },
] as const;

export const PREMIUM_FEATURE_AUDIT: PremiumFeatureAudit[] = [
  {
    id: "unlimited_signals",
    label: "Unlimited Signals",
    summary: "Connect without daily signal caps.",
    valueNote: "Free tier: 5/day · Premium: unlimited",
    freeTier: "5 Signals per day",
    premiumTier: "Unlimited Signals",
  },
  {
    id: "advanced_filters",
    label: "Advanced Filters",
    summary: "Refine discovery by lifestyle, faith, and intent.",
    valueNote: "Premium unlocks full advanced filter sheet",
    freeTier: "Basic preferences",
    premiumTier: "Advanced filters",
  },
  {
    id: "priority_placement",
    label: "Priority Placement",
    summary: "Appear higher in recommendations and discovery.",
    valueNote: "Ranking boost while Signal Pass is active",
    freeTier: "Standard visibility",
    premiumTier: "Priority placement",
  },
  {
    id: "read_receipts",
    label: "Read Receipts",
    summary: "Know when messages are seen (when both allow).",
    valueNote: "Premium members can enable read receipts in Safety",
    freeTier: "Optional · both must allow",
    premiumTier: "Full read receipt control",
  },
  {
    id: "exclusive_badge",
    label: "Exclusive Badge",
    summary: "Signal Pass badge on profile and in feeds.",
    valueNote: "Trust and intent signal for other members",
    freeTier: "—",
    premiumTier: "Premium badge",
  },
  {
    id: "profile_insights",
    label: "Profile Insights",
    summary: "See who viewed your profile and momentum stats.",
    valueNote: "Visitors page and profile strength insights",
    freeTier: "Limited preview",
    premiumTier: "Full profile insights",
  },
  {
    id: "future_benefits",
    label: "Future Benefits",
    summary: "Early access to new Premium features as BamSignal grows.",
    valueNote: "Roadmap perks included at no extra cost",
    freeTier: "—",
    premiumTier: "Included roadmap access",
  },
];

export const PREMIUM_VALUE_VS_PRICE: Record<PlanId, { perDay: string; headline: string }> = {
  weekly: { perDay: "≈ ₦214/day", headline: "Try Premium for a busy week" },
  monthly: { perDay: "≈ ₦133/day", headline: "Best daily value for active daters" },
  quarterly: { perDay: "≈ ₦122/day", headline: "Lowest cost per week — serious connections" },
};

export function premiumFeatureLabels(): string[] {
  return PREMIUM_FEATURE_AUDIT.map((f) => f.label);
}
