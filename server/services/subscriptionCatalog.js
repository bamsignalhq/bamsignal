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
  "Unlimited messaging",
  "Advanced Filters",
  "Premium boosts",
  "See Likes",
  "AI compatibility tools",
  "Full Discover experience"
];

export const DEFAULT_DISCREET_FEATURES = [
  "Complete anonymity in Discover",
  "Full Discover access while browsing",
  "Unlimited Signals and messaging",
  "Full search and premium filters",
  "Reveal yourself only when you initiate contact"
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
      active: plan.active !== false && plan.visibility !== "hidden"
    })
  );

  const discreetPlans = [
    normalizePlanRow({
      id: "monthly",
      name: "Monthly Discreet Membership",
      price: 9999,
      days: 30,
      sortOrder: 0,
      active: true
    })
  ];

  return {
    contactExchangePolicy: { ...DEFAULT_CONTACT_EXCHANGE_POLICY },
    products: [
      normalizeProduct(
        {
          id: "signal_pass",
          name: "Discover Membership",
          description: "Self-directed dating — freedom to explore, Signal, and chat at your own pace.",
          sortOrder: 1,
          visibility: "public",
          features: DEFAULT_SIGNAL_PASS_FEATURES,
          plans: signalPlans
        },
        signalPlans
      ),
      normalizeProduct(
        {
          id: "discreet_membership",
          name: "Discreet Membership",
          description: "Full Discover power while remaining undiscoverable until you initiate contact.",
          sortOrder: 2,
          visibility: "public",
          features: DEFAULT_DISCREET_FEATURES,
          plans: discreetPlans
        },
        discreetPlans
      ),
      normalizeProduct(
        {
          id: "fast_connection_pass",
          name: "Fast Connection Pass",
          description: "For members who prefer faster-paced connections.",
          sortOrder: 3,
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
      signal.name = signal.name === "Signal Pass" ? "Discover Membership" : signal.name;
      signal.plans = premiumPlans.map((plan, index) =>
        normalizePlanRow({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          days: plan.days,
          highlight: plan.highlight,
          sortOrder: index,
          active: plan.active !== false && plan.visibility !== "hidden"
        })
      );
    }
  }

  try {
    const { listMembershipPlans, DISCREET_PRODUCT_ID } = await import("./membershipCatalog.js");
    const discreetPlans = await listMembershipPlans(DISCREET_PRODUCT_ID, { forSaleOnly: false });
    if (discreetPlans.length) {
      let discreet = catalog.products.find((product) => product.id === "discreet_membership");
      if (!discreet) {
        discreet = normalizeProduct(
          {
            id: "discreet_membership",
            name: "Discreet Membership",
            description: "Full Discover power while remaining undiscoverable until you initiate contact.",
            sortOrder: 2,
            visibility: "public",
            features: DEFAULT_DISCREET_FEATURES,
            plans: []
          },
          []
        );
        catalog.products.push(discreet);
      }
      discreet.plans = discreetPlans.map((plan, index) =>
        normalizePlanRow({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          days: plan.days,
          highlight: plan.highlight,
          sortOrder: index,
          active: plan.active !== false && plan.visibility !== "hidden"
        })
      );
    }
  } catch {
    /* tables may not exist yet */
  }

  catalog.products.sort((a, b) => a.sortOrder - b.sortOrder);
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
        highlight: plan.highlight || "",
        active: plan.active !== false,
        visibility: plan.active === false ? "hidden" : "public"
      }))
    );
    try {
      const { upsertMembershipPlans, DISCOVER_PRODUCT_ID } = await import("./membershipCatalog.js");
      await upsertMembershipPlans(
        DISCOVER_PRODUCT_ID,
        signal.plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          days: plan.days,
          highlight: plan.highlight || "",
          active: plan.active !== false,
          visibility: plan.active === false ? "hidden" : "public"
        }))
      );
    } catch {
      /* best effort until migration applied */
    }
  }

  const discreet = normalized.products.find((product) => product.id === "discreet_membership");
  if (discreet?.plans?.length) {
    await setPlatformSetting(
      "discreet_plans",
      discreet.plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        days: plan.days,
        highlight: plan.highlight || "",
        active: plan.active !== false
      }))
    );
    try {
      const { upsertMembershipPlans, DISCREET_PRODUCT_ID } = await import("./membershipCatalog.js");
      await upsertMembershipPlans(
        DISCREET_PRODUCT_ID,
        discreet.plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          days: plan.days,
          highlight: plan.highlight || "",
          active: plan.active !== false
        }))
      );
    } catch {
      /* best effort */
    }
  }

  const { writePlatformAudit } = await import("./auditTrail.js");
  await writePlatformAudit({
    action: "pricing_changed",
    details: {
      products: normalized.products.map((product) => ({
        id: product.id,
        active: product.active,
        visibility: product.visibility
      })),
      contactExchangePolicy: normalized.contactExchangePolicy
    }
  });

  return normalized;
}

export function getProductFromCatalog(catalog, productId) {
  return catalog?.products?.find((product) => product.id === productId && product.active) || null;
}

export function activePlanPrice(product, planId = "weekly") {
  const plan = product?.plans?.find((row) => row.id === planId && row.active !== false);
  return plan?.price || 0;
}
