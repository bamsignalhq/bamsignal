/** Default premium plan pricing — synced with src/constants/plans.ts defaults */
export const DEFAULT_PREMIUM_PLANS = [
  {
    id: "weekly",
    name: "Weekly Signal Pass",
    price: 1499,
    days: 7,
    highlight: ""
  },
  {
    id: "monthly",
    name: "Monthly Signal Pass",
    price: 3999,
    days: 30,
    highlight: "Popular"
  },
  {
    id: "quarterly",
    name: "3 Months Signal Pass",
    price: 10999,
    days: 90,
    highlight: "Best value"
  }
];

export function formatNaira(price) {
  return `₦${Number(price).toLocaleString("en-NG")}`;
}

export function normalizePlan(raw = {}) {
  const price = Math.max(0, Math.round(Number(raw.price) || 0));
  const days = Math.max(1, Math.round(Number(raw.days) || 1));
  const id = String(raw.id || "").trim();
  return {
    id,
    name: String(raw.name || id).trim(),
    price,
    priceLabel: formatNaira(price),
    days,
    amountKobo: price * 100,
    highlight: String(raw.highlight || "").trim() || undefined
  };
}

export function normalizePlans(input) {
  const source = Array.isArray(input) && input.length ? input : DEFAULT_PREMIUM_PLANS;
  return source
    .map(normalizePlan)
    .filter((plan) => plan.id && plan.price > 0 && plan.days > 0);
}

export function planDaysFromAmount(amountKobo, plans = DEFAULT_PREMIUM_PLANS) {
  const normalized = normalizePlans(plans);
  const sorted = [...normalized].sort((a, b) => b.amountKobo - a.amountKobo);
  const match = sorted.find((plan) => amountKobo >= plan.amountKobo);
  return match?.days || 0;
}
