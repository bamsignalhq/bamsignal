export type PlanId = "weekly" | "monthly" | "quarterly";

export type PremiumPlan = {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  days: number;
  amountKobo: number;
  highlight?: string;
  active?: boolean;
  visibility?: "public" | "hidden";
};

export type PremiumPlanInput = {
  id: PlanId;
  name: string;
  price: number;
  days: number;
  highlight?: string;
  active?: boolean;
  visibility?: "public" | "hidden";
};

export function formatPriceLabel(price: number): string {
  return `₦${price.toLocaleString("en-NG")}`;
}

export function durationLabel(days: number): string {
  if (days === 7) return "7 days";
  if (days === 30) return "30 days";
  if (days === 90) return "90 days";
  return `${days} days`;
}

export const PLAN_SHORT_NAMES: Record<PlanId, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "3 Months"
};

export const PLAN_DEFAULT_BADGES: Partial<Record<PlanId, string>> = {
  monthly: "Recommended",
  quarterly: "Best Value"
};

export const PLAN_CHECKOUT_LABELS: Record<PlanId, string> = {
  weekly: "Weekly Plan",
  monthly: "Monthly Plan",
  quarterly: "3 Months Plan"
};

export function planCheckoutLabel(plan: PremiumPlan): string {
  return PLAN_CHECKOUT_LABELS[plan.id] ?? planShortLabel(plan);
}

export function planShortLabel(plan: PremiumPlan): string {
  return (
    PLAN_SHORT_NAMES[plan.id] ??
    plan.name
      .replace(/\s*Discover Membership$/i, "")
      .replace(/\s*Signal Pass$/i, "")
  );
}

export function planBadge(plan: PremiumPlan): string | undefined {
  return plan.highlight || PLAN_DEFAULT_BADGES[plan.id];
}

export function hydratePlan(raw: PremiumPlanInput): PremiumPlan {
  const price = Math.max(0, Math.round(raw.price));
  const days = Math.max(1, Math.round(raw.days));
  const active = raw.active !== false;
  const visibility = raw.visibility === "hidden" || !active ? "hidden" : "public";
  return {
    id: raw.id,
    name: raw.name,
    price,
    priceLabel: formatPriceLabel(price),
    days,
    amountKobo: price * 100,
    highlight: raw.highlight?.trim() || undefined,
    active,
    visibility
  };
}

/** Plans offered for new checkout (hides retired intervals). */
export function plansForSale(plans: PremiumPlan[]): PremiumPlan[] {
  return plans.filter((plan) => plan.active !== false && plan.visibility !== "hidden");
}

export const PLAN_TAGLINES: Record<PlanId, string> = {
  weekly: "7-day sprint — try Discover Membership without a long commitment",
  monthly: "30 days — full inbox, filters & unlimited Signals",
  quarterly: "Legacy plan — no longer offered for new purchases"
};

export const PLAN_PERKS: Record<PlanId, string> = {
  weekly: "Ideal for a busy week of connecting",
  monthly: "Most chosen · renew or pause anytime",
  quarterly: "Grandfathered entitlement only"
};

/** Fallback when API/local overrides are unavailable */
export const DEFAULT_PREMIUM_PLAN_INPUTS: PremiumPlanInput[] = [
  {
    id: "weekly",
    name: "Weekly Discover Membership",
    price: 999,
    days: 7,
    active: true,
    visibility: "public"
  },
  {
    id: "monthly",
    name: "Monthly Discover Membership",
    price: 2999,
    days: 30,
    highlight: "Recommended",
    active: true,
    visibility: "public"
  },
  {
    id: "quarterly",
    name: "3 Months Discover Membership",
    price: 10999,
    days: 90,
    highlight: "Legacy",
    active: false,
    visibility: "hidden"
  }
];

export const DEFAULT_PREMIUM_PLANS: PremiumPlan[] = DEFAULT_PREMIUM_PLAN_INPUTS.map(hydratePlan);

/** Shown on Discover Membership upgrade */
export const SIGNAL_PASS_INCLUDES = [
  "Unlimited Signals",
  "Unlimited messaging",
  "Advanced Filters",
  "Premium boosts",
  "See Likes",
  "AI compatibility tools",
  "Full Discover experience",
] as const;

/** @deprecated use SIGNAL_PASS_INCLUDES */
export const PREMIUM_FEATURES = SIGNAL_PASS_INCLUDES;
