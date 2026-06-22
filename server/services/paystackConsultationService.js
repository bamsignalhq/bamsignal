import crypto from "node:crypto";
import { PAYSTACK_CHANNELS } from "../paystackChannels.js";
import { config } from "../config.js";
import {
  initializePaystackTransaction,
  paystackConfigured,
  verifyPaystackTransaction
} from "./paystackClient.js";
import { recordPurchaseIntent, completePaymentFulfillment, buildPaystackPurchaseMetadata } from "./paymentFortress.js";

export const CONSULTATION_FEE_PRODUCT_TYPE = "consultation-fee";
export const CONSULTATION_FEE_PRODUCT_ID = "signal-concierge-consultation";
export const CONSULTATION_FEE_AMOUNT_NGN = 100_000;
export const CONSULTATION_FEE_AMOUNT_KOBO = CONSULTATION_FEE_AMOUNT_NGN * 100;
export const CONSULTATION_PAYMENT_ID_PATTERN = /^BS-PAY-\d{4}-\d{4}$/;

export const CONSULTATION_PAYMENT_RETURN_PREFIXES = [
  "/signal-concierge/consultation",
  "/signal-concierge/status",
  "/signal-concierge/apply"
];

/** Append-only payment timeline event kinds (client mirror). */
export const CONSULTATION_PAYMENT_TIMELINE_EVENTS = [
  "payment-created",
  "payment-initialized",
  "payment-completed",
  "payment-failed",
  "payment-refunded",
  "consultation-unlocked"
];

/** Future-ready — not implemented. */
export const CONSULTATION_PAYMENT_FUTURE_CAPABILITIES = [
  "international-currencies",
  "scholarships",
  "corporate-sponsorships"
];

export const CONSULTATION_PAYMENT_FUTURE_GATEWAYS = ["flutterwave", "stripe"];

export function resolvePaystackWebhookSecret() {
  return (
    process.env.PAYSTACK_WEBHOOK_SECRET?.trim() ||
    config.paystackWebhookSecret?.trim() ||
    config.paystackSecretKey?.trim() ||
    ""
  );
}

export function verifyConsultationWebhookSignature(rawBody, signature) {
  const secret = resolvePaystackWebhookSecret();
  if (!secret || !signature) return false;
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody || "");
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}

export function isValidConsultationPaymentId(value) {
  return CONSULTATION_PAYMENT_ID_PATTERN.test(String(value || "").trim().toUpperCase());
}

export function normalizeConsultationPaymentId(value) {
  return String(value || "").trim().toUpperCase();
}

export function isConsultationFeeProductType(productType) {
  return String(productType || "").trim().toLowerCase() === CONSULTATION_FEE_PRODUCT_TYPE;
}

export function isConsultationPaystackMetadata(metadata = {}) {
  return (
    isConsultationFeeProductType(metadata.product_type || metadata.productType) ||
    metadata.consultation_fee === true ||
    metadata.fee_kind === "consultation-fee"
  );
}

export function normalizeConsultationPaymentReturnPath(value, fallback = "/signal-concierge/consultation") {
  const raw = String(value || "").trim();
  const fallbackPathname = String(fallback || "").split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const safeFallback = CONSULTATION_PAYMENT_RETURN_PREFIXES.some(
    (path) => fallbackPathname === path || fallbackPathname.startsWith(`${path}/`)
  )
    ? fallback
    : "/signal-concierge/consultation";
  if (!raw || raw === "/" || raw.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(raw)) {
    return safeFallback;
  }
  const pathname = raw.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (CONSULTATION_PAYMENT_RETURN_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return raw.replace(/\/$/, "") || safeFallback;
  }
  return safeFallback;
}

export function resolveConsultationFeeIntent({ paymentId, memberId, journeyId = "" } = {}) {
  const normalizedPaymentId = normalizeConsultationPaymentId(paymentId);
  if (!isValidConsultationPaymentId(normalizedPaymentId)) return null;
  const normalizedMemberId = String(memberId || "").trim();
  if (!normalizedMemberId) return null;

  return {
    productType: CONSULTATION_FEE_PRODUCT_TYPE,
    productId: normalizedPaymentId,
    amountKobo: CONSULTATION_FEE_AMOUNT_KOBO,
    paymentId: normalizedPaymentId,
    memberId: normalizedMemberId,
    journeyId: String(journeyId || "").trim() || undefined
  };
}

export function buildConsultationPaymentMetadata({
  intent,
  email = "",
  name = "",
  phone = "",
  returnPath = "/signal-concierge/consultation",
  sourcePage = "/signal-concierge/consultation"
}) {
  const metadata = buildPaystackPurchaseMetadata({
    intent,
    name,
    phone,
    returnPath,
    sourcePage
  });

  return {
    ...metadata,
    app: "BamSignal",
    product_type: CONSULTATION_FEE_PRODUCT_TYPE,
    product_id: intent.paymentId,
    expected_amount_kobo: intent.amountKobo,
    payment_id: intent.paymentId,
    member_id: intent.memberId,
    journey_id: intent.journeyId || "",
    consultation_fee: true,
    fee_kind: "consultation-fee"
  };
}

function buildReference(paymentId) {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  const slug = String(paymentId || "consultation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 24);
  return `bs_consult_${slug}_${stamp}_${random}`.slice(0, 64);
}

export function consultationPaystackConfigured() {
  return paystackConfigured();
}

export async function initializeConsultationPaymentCheckout({
  intent,
  email,
  name = "",
  phone = "",
  userId = null,
  callbackUrl,
  returnPath,
  sourcePage
}) {
  const reference = buildReference(intent.paymentId);
  const safeReturnPath = normalizeConsultationPaymentReturnPath(returnPath);
  const safeSourcePage = normalizeConsultationPaymentReturnPath(sourcePage, safeReturnPath);

  await recordPurchaseIntent({
    reference,
    userId,
    intent,
    source: "initialize-consultation-fee"
  });

  const data = await initializePaystackTransaction({
    email,
    amount: intent.amountKobo,
    reference,
    callback_url: callbackUrl,
    channels: PAYSTACK_CHANNELS,
    metadata: buildConsultationPaymentMetadata({
      intent,
      email,
      name,
      phone,
      returnPath: safeReturnPath,
      sourcePage: safeSourcePage
    })
  });

  return {
    reference: data?.reference || reference,
    authorization_url: data?.authorization_url,
    access_code: data?.access_code,
    returnPath: safeReturnPath,
    sourcePage: safeSourcePage
  };
}

export async function verifyConsultationPaymentCheckout({
  reference,
  email = "",
  phone = "",
  name = "",
  returnPath = "/signal-concierge/consultation",
  sourcePage = "/signal-concierge/consultation"
}) {
  const transaction = await verifyPaystackTransaction(reference);
  if (transaction?.status !== "success") {
    return { ok: false, pending: true, status: transaction?.status || null };
  }

  const metadata = transaction?.metadata || {};
  const safeReturnPath = normalizeConsultationPaymentReturnPath(
    metadata.return_path || metadata.returnPath || returnPath
  );
  const safeSourcePage = normalizeConsultationPaymentReturnPath(
    metadata.source_page || metadata.sourcePage || sourcePage,
    safeReturnPath
  );

  const result = await completePaymentFulfillment({
    reference,
    transaction,
    metadata,
    email: email || String(transaction?.customer?.email || metadata.email || "").toLowerCase(),
    phone,
    name,
    returnPath: safeReturnPath,
    sourcePage: safeSourcePage,
    ledgerSource: "consultation-verify"
  });

  return {
    ok: Boolean(result.ok),
    pending: Boolean(result.processing),
    idempotent: Boolean(result.idempotent),
    error: result.error || null,
    status: result.status || null,
    productType: result.productType || CONSULTATION_FEE_PRODUCT_TYPE,
    productId: result.productId || metadata.payment_id || metadata.product_id || null,
    paymentId: metadata.payment_id || metadata.product_id || result.productId || null,
    memberId: metadata.member_id || metadata.memberId || null,
    journeyId: metadata.journey_id || metadata.journeyId || null,
    returnPath: result.returnPath || safeReturnPath,
    sourcePage: result.sourcePage || safeSourcePage,
    consultationEligible: Boolean(result.ok),
    consultationUnlocked: Boolean(result.ok)
  };
}

export function consultationCallbackUrl(body = {}) {
  const useNativeCallback =
    body.platform === "native" ||
    body.platform === "android" ||
    String(body.callbackPlatform || "").toLowerCase() === "native";
  return useNativeCallback
    ? config.paystackAndroidCallbackUrl || config.paystackCallbackUrl
    : config.paystackCallbackUrl;
}
