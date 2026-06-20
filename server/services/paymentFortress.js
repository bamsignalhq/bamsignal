import { activateAppUserFastConnectionPass, activateAppUserPremium } from "../db.js";
import { activateCityBoostPlacement, activateCitySpotlightPlacement } from "../cityHome.js";
import { createVipInviteLink } from "../telegram.js";
import { resetFastConnectionDailySignals } from "./fastConnection.js";
import {
  FAST_CONNECTION_DEFAULT_PLAN_ID,
  boostExpiresAtFromIntent,
  fastConnectionUntilFromIntent,
  isFastConnectionProductType,
  premiumUntilFromIntent,
  resolveBoostProduct,
  resolvePaymentProduct,
  resolvePurchaseIntent,
  verifyExpectedAmount
} from "./paymentCatalog.js";
import {
  claimPaymentFulfillment,
  getPaymentFulfillment,
  markPaymentFulfillmentStatus
} from "./paymentFulfillments.js";

export async function recordPurchaseIntent({
  reference,
  userId = null,
  intent,
  source = "initialize"
}) {
  if (!reference || !intent?.productType || !intent?.productId) return null;
  return claimPaymentFulfillment({
    reference,
    userId,
    productType: intent.productType,
    productId: intent.productId,
    amountKobo: Number(intent.amountKobo || 0),
    rawPayload: {
      source,
      purchaseIntent: {
        productType: intent.productType,
        productId: intent.productId,
        amountKobo: Number(intent.amountKobo || 0),
        days: intent.days ?? null,
        durationHours: intent.durationHours ?? null,
        dailyFastSignals: intent.dailyFastSignals ?? null,
        boostId: intent.boostId ?? null,
        planName: intent.planName ?? null
      }
    }
  });
}

export async function loadVerifiedPurchaseIntent(reference, metadata = {}) {
  const fulfillment = reference ? await getPaymentFulfillment(reference) : null;
  return resolvePurchaseIntent({ fulfillment, metadata });
}

export async function assertVerifiedPurchaseAmount(reference, transaction, metadata = {}) {
  const intent = await loadVerifiedPurchaseIntent(reference, metadata);
  if (!intent) {
    return { ok: false, error: "Unknown product in payment catalog.", intent: null };
  }
  const amountCheck = verifyExpectedAmount(transaction?.amount, intent);
  if (!amountCheck.ok) {
    if (reference) {
      await markPaymentFulfillmentStatus(reference, "failed", {
        productType: intent.productType,
        productId: intent.productId,
        amountKobo: Number(transaction?.amount || 0),
        currency: String(transaction?.currency || "").trim() || null,
        rawPayload: { error: amountCheck.reason, ...amountCheck }
      });
    }
    return {
      ok: false,
      error: "Payment amount does not match this purchase.",
      intent,
      amountCheck
    };
  }
  return { ok: true, intent, amountCheck };
}

export function buildPaystackPurchaseMetadata({
  intent,
  name = "",
  phone = "",
  returnPath = "/home",
  sourcePage = "/home",
  city = ""
}) {
  const metadata = {
    app: "BamSignal",
    name: String(name || "").trim(),
    phone: String(phone || "").replace(/\D/g, "").replace(/^234/, ""),
    product_type: intent.productType,
    product_id: intent.productId,
    expected_amount_kobo: Number(intent.amountKobo || 0),
    return_path: returnPath,
    source_page: sourcePage
  };

  if (intent.productType === "premium") {
    metadata.plan = intent.productId;
    metadata.plan_days = intent.days;
  }

  if (isFastConnectionProductType(intent.productType)) {
    metadata.quickie_days = intent.days;
    metadata.duration_days = intent.days;
    metadata.daily_fast_signals = intent.dailyFastSignals;
  }

  if (intent.productType === "boost") {
    metadata.boost_id = intent.boostId || intent.productId;
    if (intent.durationHours) metadata.duration_hours = intent.durationHours;
    if (city) metadata.city = String(city).trim();
  }

  return metadata;
}

export async function fulfillVerifiedPurchase({
  intent,
  email,
  phone = "",
  name = "",
  reference = "",
  city = "",
  transaction = null
}) {
  if (!intent) {
    return { ok: false, reason: "missing_intent" };
  }

  if (isFastConnectionProductType(intent.productType)) {
    const passUntil = fastConnectionUntilFromIntent(intent);
    const activation = await activateAppUserFastConnectionPass({
      email: email || null,
      phone: phone || null,
      name,
      passUntil,
      paystackReference: reference
    });
    await resetFastConnectionDailySignals({ email, phone }).catch(() => null);
    return {
      ok: true,
      productType: intent.productType,
      productId: intent.productId,
      activation,
      passUntil
    };
  }

  if (intent.productType === "boost") {
    const boostId = String(intent.boostId || intent.productId || "city-boost").trim();
    const durationHours = Math.max(1, Math.round(Number(intent.durationHours || 48)));
    const resolvedCity = String(city || transaction?.metadata?.city || "").trim();

    if (boostId === "city-spotlight") {
      const placement = await activateCitySpotlightPlacement({
        email: email || null,
        phone: phone || null,
        city: resolvedCity,
        durationHours: durationHours || 24,
        paystackReference: reference
      });
      return {
        ok: Boolean(placement),
        productType: "boost",
        productId: intent.productId,
        boostId,
        placement,
        expiresAt: placement?.expires_at || boostExpiresAtFromIntent(intent),
        requiresCity: !placement
      };
    }

    if (boostId === "city-boost") {
      const placement = await activateCityBoostPlacement({
        email: email || null,
        phone: phone || null,
        city: resolvedCity,
        durationHours,
        paystackReference: reference
      });
      return {
        ok: Boolean(placement),
        productType: "boost",
        productId: intent.productId,
        boostId,
        placement,
        expiresAt: placement?.expires_at || boostExpiresAtFromIntent(intent),
        requiresCity: !placement
      };
    }

    return {
      ok: true,
      productType: "boost",
      productId: intent.productId,
      boostId,
      expiresAt: boostExpiresAtFromIntent(intent)
    };
  }

  const premiumUntil = premiumUntilFromIntent(intent);
  if (!premiumUntil) {
    return { ok: false, reason: "invalid_premium_duration" };
  }

  const inviteLink = await createVipInviteLink(email || phone).catch(() => null);
  const activation = await activateAppUserPremium({
    email: email || null,
    phone: phone || null,
    name,
    premiumUntil,
    paystackReference: reference,
    inviteLink
  });

  return {
    ok: true,
    productType: "premium",
    productId: intent.productId,
    activation,
    premiumUntil,
    inviteLink
  };
}

export async function resolveInitializeIntent(action, body = {}) {
  if (action === "initialize") {
    const planId = String(body.productId || body.plan || "monthly").trim();
    const intent = await resolvePaymentProduct({ productType: "premium", productId: planId, planId });
    return intent || null;
  }

  if (action === "initialize-boost") {
    const boostId = String(body.productId || body.boostId || body.product || "city-boost").trim();
    return resolveBoostProduct(boostId);
  }

  if (action === "initialize-quickie") {
    const planId = String(body.planId || FAST_CONNECTION_DEFAULT_PLAN_ID).trim();
    return resolvePaymentProduct({
      productType: String(body.productType || "fast_connection").trim(),
      productId: String(body.productId || "fast-connection-pass").trim(),
      planId
    });
  }

  return null;
}
