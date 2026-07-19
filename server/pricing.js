/** Default Discover Membership pricing — synced with src/constants/plans.ts defaults */
export const DEFAULT_PREMIUM_PLANS = [
  {
    id: "weekly",
    name: "Weekly Discover Membership",
    price: 999,
    days: 7,
    highlight: "",
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

export function formatNaira(price) {
  return `₦${Number(price).toLocaleString("en-NG")}`;
}

export function normalizePlan(raw = {}) {
  const price = Math.max(0, Math.round(Number(raw.price) || 0));
  const days = Math.max(1, Math.round(Number(raw.days) || 1));
  const id = String(raw.id || "").trim();
  const active = raw.active !== false;
  const visibility = raw.visibility === "hidden" ? "hidden" : "public";
  return {
    id,
    name: String(raw.name || id).trim(),
    price,
    priceLabel: formatNaira(price),
    days,
    amountKobo: price * 100,
    highlight: String(raw.highlight || "").trim() || undefined,
    active,
    visibility
  };
}

export function normalizePlans(input, { forSaleOnly = false } = {}) {
  const source = Array.isArray(input) && input.length ? input : DEFAULT_PREMIUM_PLANS;
  const plans = source
    .map(normalizePlan)
    .filter((plan) => plan.id && plan.price > 0 && plan.days > 0);
  if (forSaleOnly) {
    return plans.filter((plan) => plan.active !== false && plan.visibility !== "hidden");
  }
  return plans;
}

export function planDaysFromAmount(amountKobo, plans = DEFAULT_PREMIUM_PLANS) {
  const normalized = normalizePlans(plans);
  const sorted = [...normalized].sort((a, b) => b.amountKobo - a.amountKobo);
  const match = sorted.find((plan) => amountKobo >= plan.amountKobo);
  return match?.days || 0;
}
