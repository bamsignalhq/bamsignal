import { getPlatformSetting } from "../db.js";
import { normalizePlans } from "../pricing.js";
import {
  activePlanPrice,
  getProductFromCatalog,
  getSubscriptionCatalog
} from "./subscriptionCatalog.js";

/** Server-authoritative boost catalog — prices and durations must never come from the client. */
export const DEFAULT_BOOST_CATALOG = [
  { id: "signal-boost", price: 350, durationHours: 24 },
  { id: "priority-signal-once", price: 250, durationHours: null },
  { id: "profile-boost", price: 750, durationHours: 48 },
  { id: "city-boost", price: 600, durationHours: 48 },
  { id: "city-spotlight", price: 600, durationHours: 24 }
];

export const BOOST_PRODUCT_IDS = new Set(DEFAULT_BOOST_CATALOG.map((row) => row.id));

export const FAST_CONNECTION_PRODUCT_IDS = new Set([
  "fast-connection-pass",
  "fast_connection_pass",
  "fast_connection"
]);

export const FAST_CONNECTION_DEFAULT_PLAN_ID = "weekly";
export const FAST_CONNECTION_DAILY_SIGNALS = 30;

const PREMIUM_PLAN_ALIASES = new Map([
  ["premium_weekly", "weekly"],
  ["premium_monthly", "monthly"],
  ["premium_quarterly", "quarterly"]
]);

let premiumPlansCache = null;
let premiumPlansCacheAt = 0;

export async function loadPremiumPlans() {
  const now = Date.now();
  if (premiumPlansCache && now - premiumPlansCacheAt < 60_000) {
    return premiumPlansCache;
  }
  const stored = await getPlatformSetting("premium_plans", null);
  premiumPlansCache = normalizePlans(stored);
  premiumPlansCacheAt = now;
  return premiumPlansCache;
}

export function normalizePremiumPlanId(planId = "monthly") {
  const raw = String(planId || "monthly").trim();
  return PREMIUM_PLAN_ALIASES.get(raw) || raw;
}

export function isFastConnectionProductType(productType) {
  const value = String(productType || "").trim().toLowerCase();
  return value === "quickie" || value === "fast_connection";
}

export async function resolvePremiumPlan(planId = "monthly") {
  const id = normalizePremiumPlanId(planId);
  const plans = await loadPremiumPlans();
  const plan = plans.find((row) => row.id === id);
  if (!plan) return null;
  return {
    productType: "premium",
    productId: plan.id,
    amountKobo: plan.amountKobo,
    days: plan.days,
    durationHours: null,
    dailyFastSignals: null,
    planName: plan.name
  };
}

export async function resolveFastConnectionProduct(planId = FAST_CONNECTION_DEFAULT_PLAN_ID) {
  const catalog = await getSubscriptionCatalog();
  const product = getProductFromCatalog(catalog, "fast_connection_pass");
  const normalizedPlanId = String(planId || FAST_CONNECTION_DEFAULT_PLAN_ID).trim();
  const plan =
    product?.plans?.find((row) => row.id === normalizedPlanId && row.active !== false) ||
    product?.plans?.find((row) => row.active !== false);
  const price = Math.max(0, Math.round(Number(plan?.price || activePlanPrice(product, "weekly") || 999)));
  const days = Math.max(1, Math.round(Number(plan?.days || 7)));
  return {
    productType: "fast_connection",
    productId: "fast-connection-pass",
    amountKobo: price * 100,
    days,
    durationHours: null,
    dailyFastSignals: FAST_CONNECTION_DAILY_SIGNALS,
    planName: plan?.name || "Weekly Fast Connection Pass"
  };
}

export function resolveBoostProduct(boostId = "city-boost") {
  const id = String(boostId || "city-boost").trim();
  const boost = DEFAULT_BOOST_CATALOG.find((row) => row.id === id);
  if (!boost) return null;
  return {
    productType: "boost",
    productId: boost.id,
    boostId: boost.id,
    amountKobo: boost.price * 100,
    days: null,
    durationHours: boost.durationHours,
    dailyFastSignals: null,
    planName: boost.id
  };
}

export async function resolvePaymentProduct({
  productType = "premium",
  productId = "",
  planId = "",
  boostId = ""
} = {}) {
  const type = String(productType || "premium").trim().toLowerCase();
  const id = String(productId || planId || boostId || "").trim();

  if (type === "boost" || BOOST_PRODUCT_IDS.has(id)) {
    return resolveBoostProduct(id || boostId || "city-boost");
  }

  if (isFastConnectionProductType(type) || FAST_CONNECTION_PRODUCT_IDS.has(id)) {
    return resolveFastConnectionProduct(planId || FAST_CONNECTION_DEFAULT_PLAN_ID);
  }

  return resolvePremiumPlan(id || "monthly");
}

export function readPurchaseIntentFromFulfillment(fulfillment) {
  const intent = fulfillment?.raw_payload?.purchaseIntent;
  if (!intent || typeof intent !== "object") return null;
  const amountKobo = Number(intent.amountKobo || 0);
  const productType = String(intent.productType || "").trim();
  const productId = String(intent.productId || "").trim();
  if (!productType || !productId || !Number.isFinite(amountKobo) || amountKobo <= 0) {
    return null;
  }
  return {
    productType,
    productId,
    amountKobo,
    days: intent.days ?? null,
    durationHours: intent.durationHours ?? null,
    dailyFastSignals: intent.dailyFastSignals ?? null,
    boostId: intent.boostId ?? null,
    planName: intent.planName ?? null
  };
}

export async function resolvePurchaseIntent({ fulfillment, metadata = {} } = {}) {
  const stored = readPurchaseIntentFromFulfillment(fulfillment);
  if (stored) return stored;

  const productType = String(metadata.product_type || fulfillment?.product_type || "premium").trim();
  const productId = String(metadata.product_id || fulfillment?.product_id || metadata.plan || "monthly").trim();
  const boostId = String(metadata.boost_id || productId || "city-boost").trim();
  const resolved = await resolvePaymentProduct({ productType, productId, boostId });
  return resolved || null;
}

export function verifyExpectedAmount(transactionAmountKobo, intent) {
  const paid = Number(transactionAmountKobo || 0);
  const expected = Number(intent?.amountKobo || 0);
  if (!Number.isFinite(expected) || expected <= 0) {
    return { ok: false, reason: "missing_catalog_amount" };
  }
  if (paid !== expected) {
    return { ok: false, reason: "amount_mismatch", expectedAmount: expected, paidAmount: paid };
  }
  return { ok: true, expectedAmount: expected, paidAmount: paid };
}

export function premiumUntilFromIntent(intent) {
  const days = Math.max(1, Math.round(Number(intent?.days || 0)));
  if (!Number.isFinite(days) || days <= 0 || days > 370) return null;
  return new Date(Date.now() + days * 86400000).toISOString();
}

export function fastConnectionUntilFromIntent(intent) {
  const days = Math.max(1, Math.round(Number(intent?.days || 7)));
  return new Date(Date.now() + days * 86400000).toISOString();
}

export function boostExpiresAtFromIntent(intent) {
  const durationHours = Number(intent?.durationHours || 0);
  if (!Number.isFinite(durationHours) || durationHours <= 0) return null;
  return new Date(Date.now() + durationHours * 3600000).toISOString();
}
