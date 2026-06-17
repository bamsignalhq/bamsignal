import { getPlatformSetting, setPlatformSetting } from "../db.js";
import { DEFAULT_PREMIUM_PLANS, normalizePlans } from "../pricing.js";

export const CATALOG_SETTING_KEY = "subscription_catalog";

const DEFAULT_FAST_CONNECTION_PLANS = [
  {
    id: "weekly",
    name: "Weekly Fast Connection Pass",
    price: 999,
    days: 7,
    active: true,
    highlight: ""
  }
];

export const DEFAULT_CONTACT_EXCHANGE_POLICY = {
  freeLimit: 1,
  windowDays: 30
};

export const DEFAULT_SIGNAL_PASS_FEATURES = [
  "Unlimited Signals",
  "People Interested In You",
  "Advanced Filters",
  "Priority Visibility",
  "Unlimited Undo",
  "Unlimited Contact Exchanges",
  "Premium badge",
  "Faster support"
];

export const DEFAULT_FAST_CONNECTION_FEATURES = [
  "Unlimited contact exchanges",
  "Priority in Discover among Fast Connection members",
  "See other Fast Connection members",
  "Priority contact request handling",
  "Fast Connection badge"
];

function normalizePlanRow(raw = {}) {
  return {
    id: String(raw.id || "").trim(),
    name: String(raw.name || "").trim(),
    price: Math.max(0, Math.round(Number(raw.price) || 0)),
    days: Math.max(1, Math.round(Number(raw.days) || 1)),
    active: raw.active !== false,
    highlight: String(raw.highlight || "").trim() || undefined,
    sortOrder: Math.max(0, Math.round(Number(raw.sortOrder) || 0))
  };
}

function normalizeProduct(raw = {}, fallbackPlans = []) {
  const plans = (Array.isArray(raw.plans) && raw.plans.length ? raw.plans : fallbackPlans)
    .map(normalizePlanRow)
    .filter((plan) => plan.id && plan.price > 0);
  return {
    id: String(raw.id || "").trim(),
    active: raw.active !== false,
    name: String(raw.name || "").trim(),
    description: String(raw.description || "").trim(),
    badgeText: String(raw.badgeText || "").trim() || undefined,
    visibility: raw.visibility === "hidden" ? "hidden" : "public",
    sortOrder: Math.max(0, Math.round(Number(raw.sortOrder) || 0)),
    features: Array.isArray(raw.features)
      ? raw.features.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
    plans
  };
}

export function defaultSubscriptionCatalog() {
  const signalPlans = normalizePlans(DEFAULT_PREMIUM_PLANS).map((plan, index) =>
    normalizePlanRow({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      days: plan.days,
      highlight: plan.highlight,
      sortOrder: index,
      active: true
    })
  );

  return {
    contactExchangePolicy: { ...DEFAULT_CONTACT_EXCHANGE_POLICY },
    products: [
      normalizeProduct(
        {
          id: "signal_pass",
          name: "Signal Pass",
          description: "Connect without limits on BamSignal.",
          sortOrder: 1,
          visibility: "public",
          features: DEFAULT_SIGNAL_PASS_FEATURES,
          plans: signalPlans
        },
        signalPlans
      ),
      normalizeProduct(
        {
          id: "fast_connection_pass",
          name: "Fast Connection Pass",
          description: "For members who prefer faster-paced connections.",
          sortOrder: 2,
          visibility: "public",
          badgeText: "Fast Connection",
          features: DEFAULT_FAST_CONNECTION_FEATURES,
          plans: DEFAULT_FAST_CONNECTION_PLANS
        },
        DEFAULT_FAST_CONNECTION_PLANS
      )
    ]
  };
}

export function normalizeSubscriptionCatalog(raw) {
  const base = defaultSubscriptionCatalog();
  if (!raw || typeof raw !== "object") return base;

  const policy = {
    freeLimit: Math.max(
      0,
      Math.round(Number(raw.contactExchangePolicy?.freeLimit ?? base.contactExchangePolicy.freeLimit))
    ),
    windowDays: Math.max(
      1,
      Math.round(Number(raw.contactExchangePolicy?.windowDays ?? base.contactExchangePolicy.windowDays))
    )
  };

  const productsById = new Map(base.products.map((product) => [product.id, product]));
  const incoming = Array.isArray(raw.products) ? raw.products : [];
  for (const item of incoming) {
    const id = String(item?.id || "").trim();
    if (!id) continue;
    const fallback = productsById.get(id);
    productsById.set(
      id,
      normalizeProduct(item, fallback?.plans || [])
    );
  }

  return {
    contactExchangePolicy: policy,
    products: [...productsById.values()].sort((a, b) => a.sortOrder - b.sortOrder)
  };
}

export async function getSubscriptionCatalog() {
  const stored = await getPlatformSetting(CATALOG_SETTING_KEY, null);
  const catalog = normalizeSubscriptionCatalog(stored);

  const premiumStored = await getPlatformSetting("premium_plans", null);
  const premiumPlans = normalizePlans(premiumStored);
  if (premiumPlans.length) {
    const signal = catalog.products.find((product) => product.id === "signal_pass");
    if (signal) {
      signal.plans = premiumPlans.map((plan, index) =>
        normalizePlanRow({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          days: plan.days,
          highlight: plan.highlight,
          sortOrder: index,
          active: true
        })
      );
    }
  }

  return catalog;
}

export async function saveSubscriptionCatalog(catalog) {
  const normalized = normalizeSubscriptionCatalog(catalog);
  await setPlatformSetting(CATALOG_SETTING_KEY, normalized);

  const signal = normalized.products.find((product) => product.id === "signal_pass");
  if (signal?.plans?.length) {
    await setPlatformSetting(
      "premium_plans",
      signal.plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        days: plan.days,
        highlight: plan.highlight || ""
      }))
    );
  }

  return normalized;
}

export function getProductFromCatalog(catalog, productId) {
  return catalog?.products?.find((product) => product.id === productId && product.active) || null;
}

export function activePlanPrice(product, planId = "weekly") {
  const plan = product?.plans?.find((row) => row.id === planId && row.active !== false);
  return plan?.price || 0;
}
