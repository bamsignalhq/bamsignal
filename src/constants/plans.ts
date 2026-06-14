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
  if (days === 90) return "3 months";
  return `${days} days`;
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
    days: 30
  },
  {
    id: "quarterly",
    name: "3 Months Signal Pass",
    price: 10999,
    days: 90
  }
];

export const DEFAULT_PREMIUM_PLANS: PremiumPlan[] = DEFAULT_PREMIUM_PLAN_INPUTS.map(hydratePlan);

export const PREMIUM_FEATURES = [
  "Unlimited signals & messages",
  "See who liked you",
  "Advanced filters",
  "Priority visibility",
  "Verified badge support"
] as const;
