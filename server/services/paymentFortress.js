import { activateAppUserFastConnectionPass, activateAppUserPremium } from "../db.js";
import { activateCityBoostPlacement, activateCitySpotlightPlacement } from "../cityHome.js";
import { createVipInviteLink } from "../telegram.js";
import { resetFastConnectionDailySignals } from "./fastConnection.js";
import {
  FAST_CONNECTION_DEFAULT_PLAN_ID,
  boostExpiresAtFromIntent,
  fastConnectionUntilFromIntent,
  isConsultationFeeProductType,
  isFastConnectionProductType,
  premiumUntilFromIntent,
  resolveBoostProduct,
  resolvePaymentProduct,
  resolvePurchaseIntent,
  verifyExpectedAmount
} from "./paymentCatalog.js";
import {
  PaymentDatabaseError,
  requireDatabaseReadyForPayments
} from "./paymentDb.js";
import {
  claimPaymentFulfillment,
  claimPaymentFulfillmentProcessing,
  getPaymentFulfillment,
  markPaymentFulfillmentStatus
} from "./paymentFulfillments.js";
import { sendPurchaseConfirmationEmail } from "./purchaseEmail.js";

export async function recordPurchaseIntent({
  reference,
  userId = null,
  intent,
  source = "initialize"
}) {
  if (!reference || !intent?.productType || !intent?.productId) {
    throw new PaymentDatabaseError("Unable to store purchase intent.", "payment_persistence_failed");
  }
  requireDatabaseReadyForPayments();
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

  if (isConsultationFeeProductType(intent.productType)) {
    metadata.payment_id = intent.productId;
    metadata.consultation_fee = true;
    metadata.fee_kind = "consultation-fee";
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

  requireDatabaseReadyForPayments();

  if (isConsultationFeeProductType(intent.productType)) {
    return {
      ok: true,
      productType: intent.productType,
      productId: intent.productId,
      memberId: String(transaction?.metadata?.member_id || transaction?.metadata?.memberId || "").trim() || null,
      paymentId: intent.productId,
      journeyId:
        String(transaction?.metadata?.journey_id || transaction?.metadata?.journeyId || "").trim() || null,
      consultationEligible: true
    };
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
    if (!activation) {
      throw new PaymentDatabaseError();
    }
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
  if (!activation) {
    throw new PaymentDatabaseError();
  }

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

function cityBoostError(boostId) {
  return boostId === "city-spotlight"
    ? "Complete onboarding in your city before buying City Spotlight."
    : "Complete onboarding in your city before buying a City Boost.";
}

function fulfillmentAlreadyInProgress(row, returnPath, sourcePage) {
  return {
    ok: false,
    idempotent: true,
    processing: true,
    status: 503,
    error: "Payment fulfillment is already processing.",
    productType: row?.product_type || null,
    productId: row?.product_id || null,
    returnPath,
    sourcePage
  };
}

function fulfillmentAlreadyComplete(row, returnPath, sourcePage) {
  return {
    ok: true,
    idempotent: true,
    productType: row.product_type,
    productId: row.product_id,
    returnPath,
    sourcePage
  };
}

export async function completePaymentFulfillment({
  reference,
  transaction,
  metadata = {},
  email,
  phone = "",
  name = "",
  city = "",
  returnPath = "/home",
  sourcePage = "/home",
  ledgerSource = "verify"
}) {
  requireDatabaseReadyForPayments();

  const processingClaim = await claimPaymentFulfillmentProcessing({
    reference,
    userId: metadata.user_id || metadata.userId || null,
    productType: metadata.product_type || "premium",
    productId: metadata.product_id || null,
    amountKobo: Number(transaction?.amount || 0),
    currency: String(transaction?.currency || "").trim() || null,
    rawPayload: {
      source: ledgerSource,
      transaction
    }
  });

  if (!processingClaim.claimed) {
    const existingFulfillment = processingClaim.row || (await getPaymentFulfillment(reference));
    if (existingFulfillment?.status === "fulfilled") {
      return fulfillmentAlreadyComplete(existingFulfillment, returnPath, sourcePage);
    }
    if (existingFulfillment?.status === "processing") {
      return fulfillmentAlreadyInProgress(existingFulfillment, returnPath, sourcePage);
    }
    return {
      ok: false,
      status: existingFulfillment?.status === "failed" ? 422 : 409,
      error:
        existingFulfillment?.status === "failed"
          ? "Payment could not be fulfilled."
          : "Payment fulfillment is not available for this reference."
    };
  }

  const amountCheck = await assertVerifiedPurchaseAmount(reference, transaction, metadata);
  if (!amountCheck.ok) {
    await markPaymentFulfillmentStatus(reference, "failed", {
      productType: amountCheck.intent?.productType || metadata.product_type || null,
      productId: amountCheck.intent?.productId || metadata.product_id || null,
      amountKobo: Number(transaction?.amount || 0),
      currency: String(transaction?.currency || "").trim() || null,
      rawPayload: {
        error: amountCheck.amountCheck?.reason || amountCheck.error || "payment_verification_failed",
        amountCheck
      }
    });
    return {
      ok: false,
      status: 422,
      error: amountCheck.error || "Payment amount does not match this purchase."
    };
  }

  const intent = amountCheck.intent;
  const activation = await fulfillVerifiedPurchase({
    intent,
    email,
    phone,
    name,
    reference,
    city,
    transaction
  });

  if (!activation.ok) {
    await markPaymentFulfillmentStatus(reference, "failed", {
      productType: intent.productType,
      productId: intent.productId,
      amountKobo: Number(transaction?.amount || 0),
      currency: String(transaction?.currency || "").trim() || null,
      rawPayload: {
        purchaseIntent: intent,
        activation,
        error: activation.requiresCity ? "requires_city" : "activation_failed"
      }
    });
    if (activation.requiresCity) {
      return { ok: false, status: 422, error: cityBoostError(activation.boostId) };
    }
    return { ok: false, status: 422, error: "Unable to activate this purchase." };
  }

  await markPaymentFulfillmentStatus(reference, "fulfilled", {
    productType: intent.productType,
    productId: intent.productId,
    amountKobo: Number(transaction?.amount || 0),
    currency: String(transaction?.currency || "").trim() || null,
    rawPayload: {
      purchaseIntent: intent,
      activation
    }
  });

  if (email) {
    await sendPurchaseConfirmationEmail({
      reference,
      email,
      firstName: String(name || metadata.name || "").trim().split(/\s+/)[0] || "there",
      productType: intent.productType,
      productId: intent.productId,
      amountKobo: Number(transaction?.amount || 0),
      userId: metadata.user_id || metadata.userId || null,
      returnPath
    });
  }

  return {
    ok: true,
    idempotent: false,
    intent,
    activation,
    productType: intent.productType,
    productId: intent.productId,
    returnPath,
    sourcePage
  };
}
