import { activateAppUserFastConnectionPass } from "../db.js";
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
  CONVERSATION_UNLOCK_PRODUCT_TYPE,
  boostExpiresAtFromIntent,
  fastConnectionUntilFromIntent,
  CONCIERGE_INVOICE_PRODUCT_TYPE,
  isConsultationFeeProductType,
  isConciergeInvoiceProductType,
  isConversationUnlockProductType,
  isDiscreetProductType,
  isFastConnectionProductType,
  resolveBoostProduct,
  resolveConversationUnlockProduct,
  resolveConciergeInvoiceProduct,
  resolvePaymentProduct,
  resolvePurchaseIntent,
  verifyExpectedAmount,
  loadPremiumPlans
} from "./paymentCatalog.js";
import { activateMembershipFromPayment } from "./membershipCommerce.js";
import { activateConversationUnlockFromPayment } from "./conversationUnlock.js";
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
  const row = await claimPaymentFulfillment({
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
        targetProfileId: intent.targetProfileId ?? null,
        planName: intent.planName ?? null
      }
    }
  });

  try {
    const { handlePaymentFinancialEvent } = await import("./finance/index.js");
    await handlePaymentFinancialEvent({
      reference,
      userId,
      amountKobo: Number(intent.amountKobo || 0),
      productType: intent.productType,
      productId: intent.productId,
      lifecycleStatus: "initialized",
      previousStatus: "unknown",
      reasonCode: "purchase_intent",
      ledgerSource: source
    });
    await handlePaymentFinancialEvent({
      reference,
      userId,
      amountKobo: Number(intent.amountKobo || 0),
      productType: intent.productType,
      productId: intent.productId,
      lifecycleStatus: "pending",
      previousStatus: "initialized",
      reasonCode: "purchase_pending",
      entryId: `pay_${reference}_pending`,
      ledgerSource: source
    });
  } catch {
    /* financial audit must not block payment initialize */
  }

  return row;
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

  if (isDiscreetProductType(intent.productType)) {
    metadata.plan = intent.productId;
    metadata.plan_days = intent.days;
    metadata.experience_mode = "discreet";
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

  if (isConversationUnlockProductType(intent.productType)) {
    metadata.target_profile_id = String(intent.targetProfileId || "").trim();
  }

  if (isConsultationFeeProductType(intent.productType)) {
    metadata.payment_id = intent.productId;
    metadata.consultation_fee = true;
    metadata.fee_kind = "consultation-fee";
  }

  if (isConciergeInvoiceProductType(intent.productType)) {
    metadata.invoice_id = intent.invoiceId || intent.productId;
    metadata.concierge_invoice = true;
    metadata.grants_membership = false;
    if (intent.memberId) metadata.member_id = intent.memberId;
    if (intent.journeyId) metadata.journey_id = intent.journeyId;
    if (intent.invoiceNumber) metadata.invoice_number = intent.invoiceNumber;
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
    // Consultation payment grants Concierge eligibility via membership events — not payment flags.
    const activation = await activateMembershipFromPayment({
      experienceMode: "concierge",
      email: email || null,
      phone: phone || null,
      name,
      days: Math.max(1, Math.round(Number(intent.days || 365))),
      productId: intent.productId || "consultation-fee",
      planId: intent.planId || intent.productId || null,
      paymentRef: reference,
      ledgerSource,
      metadata: {
        journeyId:
          String(transaction?.metadata?.journey_id || transaction?.metadata?.journeyId || "").trim() ||
          null,
        memberId:
          String(transaction?.metadata?.member_id || transaction?.metadata?.memberId || "").trim() ||
          null
      }
    });
    // Payment itself succeeds even if profile is not yet linked; eligibility is best-effort.
    return {
      ok: true,
      productType: intent.productType,
      productId: intent.productId,
      memberId: String(transaction?.metadata?.member_id || transaction?.metadata?.memberId || "").trim() || null,
      paymentId: intent.productId,
      journeyId:
        String(transaction?.metadata?.journey_id || transaction?.metadata?.journeyId || "").trim() || null,
      consultationEligible: true,
      membershipGranted: Boolean(activation?.ok),
      activation,
      entitlements: activation?.entitlements || null
    };
  }

  if (isConciergeInvoiceProductType(intent.productType)) {
    // Commerce records money only — Ops advances the case after verify (never membership).
    const invoiceId = String(
      intent.invoiceId || intent.productId || transaction?.metadata?.invoice_id || ""
    ).trim();
    return {
      ok: true,
      productType: CONCIERGE_INVOICE_PRODUCT_TYPE,
      productId: invoiceId || intent.productId,
      invoiceId,
      invoiceNumber: intent.invoiceNumber || transaction?.metadata?.invoice_number || null,
      amountKobo: Number(intent.amountKobo || transaction?.amount || 0),
      grantsMembership: false,
      membershipUnchanged: true,
      activation: {
        invoiceId,
        grantsMembership: false,
        membershipUnchanged: true
      }
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

  if (isDiscreetProductType(intent.productType)) {
    const days = Math.max(1, Math.round(Number(intent.days || 30)));
    const activation = await activateMembershipFromPayment({
      experienceMode: "discreet",
      email: email || null,
      phone: phone || null,
      name,
      days,
      planId: intent.productId,
      productId: "discreet",
      paymentRef: reference,
      ledgerSource,
      metadata: { planName: intent.planName || null }
    });
    if (!activation?.ok) {
      throw new PaymentDatabaseError();
    }
    return {
      ok: true,
      productType: "discreet",
      productId: intent.productId,
      activation,
      discreetUntil: activation.endsAt,
      privacyMode: "discreet",
      entitlements: activation.entitlements,
      duplicate: Boolean(activation.duplicate)
    };
  }

  if (isConversationUnlockProductType(intent.productType)) {
    const targetProfileId = String(
      intent.targetProfileId ||
        transaction?.metadata?.target_profile_id ||
        transaction?.metadata?.targetProfileId ||
        ""
    ).trim();
    const activation = await activateConversationUnlockFromPayment({
      email: email || null,
      phone: phone || null,
      name,
      targetProfileId,
      paymentRef: reference,
      ledgerSource,
      metadata: { productId: intent.productId }
    });
    if (!activation?.ok) {
      return { ok: false, reason: activation?.reason || "conversation_unlock_failed" };
    }
    return {
      ok: true,
      productType: CONVERSATION_UNLOCK_PRODUCT_TYPE,
      productId: intent.productId,
      activation,
      matchId: activation.matchId,
      targetProfileId,
      unlock: activation.unlock,
      grantsPremium: false,
      duplicate: Boolean(activation.duplicate)
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

  const days = Math.max(1, Math.round(Number(intent.days || 0)));
  if (!Number.isFinite(days) || days <= 0) {
    return { ok: false, reason: "invalid_premium_duration" };
  }

  const activation = await activateMembershipFromPayment({
    experienceMode: "discover",
    email: email || null,
    phone: phone || null,
    name,
    days,
    productId: intent.productId || "discover",
    planId: intent.productId || null,
    paymentRef: reference,
    ledgerSource,
    metadata: { planName: intent.planName || null }
  });
  if (!activation?.ok) {
    throw new PaymentDatabaseError();
  }

  const inviteLink = await createVipInviteLink(email || phone).catch(() => null);

  return {
    ok: true,
    productType: "premium",
    productId: intent.productId,
    activation,
    premiumUntil: activation.endsAt,
    inviteLink,
    entitlements: activation.entitlements,
    duplicate: Boolean(activation.duplicate)
  };
}

export async function resolveInitializeIntent(action, body = {}) {
  if (action === "initialize") {
    const planId = String(body.productId || body.plan || "monthly").trim();
    const productType = String(body.productType || "premium").trim().toLowerCase();
    if (productType === "discreet" || productType === "discreet_membership") {
      return resolvePaymentProduct({ productType: "discreet", productId: planId, planId });
    }
    const intent = await resolvePaymentProduct({ productType: "premium", productId: planId, planId });
    if (!intent) return null;
    const forSale = await loadPremiumPlans({ forSaleOnly: true });
    if (!forSale.some((plan) => plan.id === intent.productId)) {
      return null;
    }
    return intent;
  }

  if (action === "initialize-boost") {
    const boostId = String(body.productId || body.boostId || body.product || "city-boost").trim();
    return resolveBoostProduct(boostId);
  }

  if (action === "initialize-conversation-unlock") {
    const targetProfileId = String(body.targetProfileId || body.target_profile_id || "").trim();
    if (!targetProfileId) return null;
    return resolveConversationUnlockProduct(targetProfileId);
  }

  if (action === "initialize-concierge-invoice") {
    const invoiceId = String(body.invoiceId || body.productId || "").trim();
    if (!invoiceId) return null;
    const intent = await resolveConciergeInvoiceProduct(invoiceId);
    if (!intent) return null;
    const payerId = String(body.memberId || body.userId || "").trim();
    if (payerId && intent.memberId && payerId !== intent.memberId) {
      return null;
    }
    return intent;
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
  ledgerSource = "verify",
  webhookEventId = null
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
      try {
        const { handlePaymentFinancialEvent } = await import("./finance/index.js");
        await handlePaymentFinancialEvent({
          reference,
          webhookEventId,
          amountKobo: Number(transaction?.amount || existingFulfillment.amount_kobo || 0),
          productType: existingFulfillment.product_type,
          productId: existingFulfillment.product_id,
          lifecycleStatus: "successful",
          previousStatus: "processing",
          reasonCode: "idempotent_fulfillment",
          duplicateWebhook: ledgerSource === "webhook",
          ledgerSource
        });
      } catch {
        /* financial audit must not block idempotent fulfillment */
      }
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

  try {
    const { handlePaymentFinancialEvent } = await import("./finance/index.js");
    await handlePaymentFinancialEvent({
      reference,
      webhookEventId,
      userId: metadata.user_id || metadata.userId || null,
      amountKobo: Number(transaction?.amount || 0),
      productType: metadata.product_type || null,
      productId: metadata.product_id || null,
      lifecycleStatus: "processing",
      previousStatus: "pending",
      reasonCode: "fulfillment_processing",
      entryId: `pay_${reference}_processing`,
      ledgerSource,
      transaction
    });
  } catch {
    /* financial audit must not block fulfillment */
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
    try {
      const { handlePaymentFinancialEvent } = await import("./finance/index.js");
      await handlePaymentFinancialEvent({
        reference,
        webhookEventId,
        amountKobo: Number(transaction?.amount || 0),
        productType: amountCheck.intent?.productType || metadata.product_type || null,
        productId: amountCheck.intent?.productId || metadata.product_id || null,
        lifecycleStatus: "failed",
        previousStatus: "processing",
        reasonCode: "amount_mismatch",
        ledgerSource
      });
    } catch {
      /* financial audit must not block failure response */
    }
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
    try {
      const { handlePaymentFinancialEvent } = await import("./finance/index.js");
      await handlePaymentFinancialEvent({
        reference,
        webhookEventId,
        amountKobo: Number(transaction?.amount || 0),
        productType: intent.productType,
        productId: intent.productId,
        lifecycleStatus: "failed",
        previousStatus: "processing",
        reasonCode: "activation_failed",
        ledgerSource
      });
    } catch {
      /* financial audit must not block failure response */
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

  try {
    const { handlePaymentFinancialEvent } = await import("./finance/index.js");
    await handlePaymentFinancialEvent({
      reference,
      webhookEventId,
      userId: metadata.user_id || metadata.userId || null,
      memberId: metadata.profile_id || metadata.profileId || null,
      userKey: email || phone || null,
      amountKobo: Number(transaction?.amount || 0),
      productType: intent.productType,
      productId: intent.productId,
      lifecycleStatus: "successful",
      previousStatus: "processing",
      reasonCode: "fulfillment_complete",
      entryId: `pay_${reference}_successful`,
      ledgerSource,
      transaction,
      gatewayReference: transaction?.id || null
    });
  } catch {
    /* financial audit must not block success response */
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
