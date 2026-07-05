import { activateAppUserFastConnectionPass, activateAppUserPremium } from "../db.js";
import { activateCityBoostPlacement, activateCitySpotlightPlacement } from "../cityHome.js";
import { activateMemberBoost } from "./memberBoosts.js";
import {
  evaluateBoostActivationIntegrity,
  fulfillBoostWithIntegrity,
  repairBoostEntitlementForReference
} from "./boostIntegrity.js";
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
import { afterBamSignalPurchaseFulfillment } from "./stankingsPlatform.js";

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

  if (intent.productType === "wallet_funding") {
    metadata.wallet_funding = true;
    metadata.resume_token = intent.resumeToken || "";
    metadata.baygold_amount = intent.bayGoldAmount ?? null;
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
  transaction = null,
  ledgerSource = "verify"
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
      const expiresAt = placement?.expires_at || boostExpiresAtFromIntent(intent);
      if (placement) {
        await activateMemberBoost({
          email: email || null,
          phone: phone || null,
          boostId,
          expiresAt,
          paystackReference: reference,
          city: resolvedCity
        });
      }
      return {
        ok: Boolean(placement),
        productType: "boost",
        productId: intent.productId,
        boostId,
        placement,
        expiresAt,
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
      const expiresAt = placement?.expires_at || boostExpiresAtFromIntent(intent);
      if (placement) {
        await activateMemberBoost({
          email: email || null,
          phone: phone || null,
          boostId,
          expiresAt,
          paystackReference: reference,
          city: resolvedCity
        });
      }
      return {
        ok: Boolean(placement),
        productType: "boost",
        productId: intent.productId,
        boostId,
        placement,
        expiresAt,
        requiresCity: !placement
      };
    }

    // Shop boosts (signal / priority / profile): transactional entitlement + fulfillment commit.
    const activation = await fulfillBoostWithIntegrity({
      intent,
      email,
      phone,
      reference,
      city: resolvedCity,
      transaction,
      ledgerSource,
      fulfillmentPatch: {
        productType: intent.productType,
        productId: intent.productId,
        amountKobo: Number(transaction?.amount || 0),
        currency: String(transaction?.currency || "").trim() || null,
        rawPayload: {
          purchaseIntent: intent,
          source: ledgerSource
        }
      }
    });
    if (!activation.ok || !activation.boost?.id) {
      return { ok: false, reason: "boost_activation_failed" };
    }
    return activation;
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

  if (action === "initialize-baygold") {
    return resolveBayGoldFundingIntent({
      shortfallBayGold: body.shortfallBayGold,
      resumeToken: body.resumeToken
    });
  }

  return null;
}

/** Wallet-only Paystack funding — credits BayGold then resumes platform purchase. */
export function resolveBayGoldFundingIntent({ shortfallBayGold = 0, resumeToken = "" } = {}) {
  const bayGoldAmount = Math.max(100, Math.ceil(Number(shortfallBayGold) || 100));
  return {
    productType: "wallet_funding",
    productId: "baygold",
    amountKobo: bayGoldAmount * 1000,
    bayGoldAmount,
    resumeToken: String(resumeToken || "").trim(),
    days: null,
    durationHours: null,
    dailyFastSignals: null,
    boostId: null,
    planName: `${bayGoldAmount} BayGold`
  };
}

export async function completeWalletFundingFulfillment({
  reference,
  metadata = {},
  memberId,
  email
}) {
  const resumeToken = String(metadata.resume_token || metadata.resumeToken || "").trim();
  if (!resumeToken) {
    return { ok: false, status: 422, error: "Wallet resume token missing." };
  }
  if (!memberId) {
    return { ok: false, status: 401, error: "Member identity required for wallet funding." };
  }

  const { resumePlatformPurchase } = await import("./stankingsPlatform.js");
  const resumed = await resumePlatformPurchase({
    memberId,
    email,
    resumeToken,
    paystackReference: reference
  });

  if (!resumed?.ok) {
    return {
      ok: false,
      status: resumed?.status || 502,
      error: resumed?.error || "Purchase resume failed after wallet funding."
    };
  }

  return {
    ok: true,
    idempotent: false,
    productType: "wallet_funding",
    productId: "baygold",
    walletFunding: true,
    purchase: resumed.purchase ?? null
  };
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

async function resolveIdempotentFulfillment(row, { reference, email, phone, returnPath, sourcePage }) {
  if (row?.product_type !== "boost") {
    return fulfillmentAlreadyComplete(row, returnPath, sourcePage);
  }

  const integrity = await evaluateBoostActivationIntegrity(reference, { email, phone });
  if (integrity.ok) {
    return {
      ...fulfillmentAlreadyComplete(row, returnPath, sourcePage),
      activation: {
        ok: true,
        productType: "boost",
        productId: row.product_id,
        boostId: integrity.entitlement?.productId || row.product_id,
        expiresAt: integrity.entitlement?.expiresAt || null,
        boost: integrity.entitlement,
        entitlementId: integrity.entitlement?.id || row.entitlement_id || null
      },
      entitlementId: integrity.entitlement?.id || null
    };
  }

  if (integrity.reason === "missing_entitlement") {
    const repaired = await repairBoostEntitlementForReference(reference, { source: "idempotent_repair" });
    if (repaired.ok && repaired.boost) {
      return {
        ...fulfillmentAlreadyComplete(row, returnPath, sourcePage),
        activation: {
          ok: true,
          productType: "boost",
          productId: row.product_id,
          boostId: repaired.boost.productId,
          expiresAt: repaired.boost.expiresAt,
          boost: repaired.boost,
          entitlementId: repaired.boost.id,
          repaired: true
        },
        entitlementId: repaired.boost.id
      };
    }
    return {
      ok: false,
      status: 422,
      error: "Payment fulfilled but boost entitlement is missing."
    };
  }

  return {
    ok: false,
    status: 422,
    error: "Boost entitlement is not active for this payment."
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
      return resolveIdempotentFulfillment(existingFulfillment, {
        reference,
        email,
        phone,
        returnPath,
        sourcePage
      });
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
    transaction,
    ledgerSource
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

  if (!activation.fulfillmentCommitted) {
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
  } else {
    await markPaymentFulfillmentStatus(reference, "fulfilled", {
      rawPayload: {
        purchaseIntent: intent,
        activation
      }
    });
  }

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

  const memberId = metadata.user_id || metadata.userId || email || phone;
  if (memberId) {
    await afterBamSignalPurchaseFulfillment({
      memberId: String(memberId),
      email,
      productType: intent.productType,
      productId: intent.productId,
      reference
    }).catch(() => null);
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
