export type PlanId = "weekly" | "monthly" | "quarterly";

export type PremiumPlan = {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  days: number;
  amountKobo: number;
  highlight?: string;
};

export type PremiumPlanInput = {
  id: PlanId;
  name: string;
  price: number;
  days: number;
  highlight?: string;
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

export function planShortLabel(plan: PremiumPlan): string {
  return PLAN_SHORT_NAMES[plan.id] ?? plan.name.replace(/\s*Signal Pass$/i, "");
}

export function planBadge(plan: PremiumPlan): string | undefined {
  return plan.highlight || PLAN_DEFAULT_BADGES[plan.id];
}

export function hydratePlan(raw: PremiumPlanInput): PremiumPlan {
  const price = Math.max(0, Math.round(raw.price));
  const days = Math.max(1, Math.round(raw.days));
  return {
    id: raw.id,
    name: raw.name,
    price,
    priceLabel: formatPriceLabel(price),
    days,
    amountKobo: price * 100,
    highlight: raw.highlight?.trim() || undefined
  };
}

export const PLAN_TAGLINES: Record<PlanId, string> = {
  weekly: "7-day sprint — test Premium without a long commitment",
  monthly: "30-day pass — full inbox, filters & unlimited signals",
  quarterly: "90-day pass — lowest cost per week for serious daters"
};

export const PLAN_PERKS: Record<PlanId, string> = {
  weekly: "Ideal for a busy week of connecting",
  monthly: "Most chosen · renew or pause anytime",
  quarterly: "Best value · save vs paying weekly"
};

/** Fallback when API/local overrides are unavailable */
export const DEFAULT_PREMIUM_PLAN_INPUTS: PremiumPlanInput[] = [
  {
    id: "weekly",
    name: "Weekly Signal Pass",
    price: 1499,
    days: 7
  },
  {
    id: "monthly",
    name: "Monthly Signal Pass",
    price: 3999,
    days: 30,
    highlight: "Recommended"
  },
  {
    id: "quarterly",
    name: "3 Months Signal Pass",
    price: 10999,
    days: 90,
    highlight: "Best Value"
  }
];

export const DEFAULT_PREMIUM_PLANS: PremiumPlan[] = DEFAULT_PREMIUM_PLAN_INPUTS.map(hydratePlan);

/** Shown on Signal Pass upgrade — keep to four clear bullets */
export const SIGNAL_PASS_INCLUDES = [
  "Unlimited Signals",
  "See Profile Visitors",
  "Advanced Filters",
  "Priority Visibility"
] as const;

/** @deprecated use SIGNAL_PASS_INCLUDES */
export const PREMIUM_FEATURES = SIGNAL_PASS_INCLUDES;
