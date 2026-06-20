import { config } from "../../server/config.js";
import { PAYSTACK_CHANNELS } from "../../server/paystackChannels.js";
import {
  initializePaystackTransaction,
  paystackConfigured,
  paystackErrorResponse,
  verifyPaystackTransaction
} from "../../server/services/paystackClient.js";
import { sendPurchaseConfirmationEmail, logPaymentInitialized } from "../../server/services/purchaseEmail.js";
import { appendPaymentAudit } from "../../server/services/paymentEvents.js";
import {
  claimPaymentFulfillment,
  getPaymentFulfillment,
  markPaymentFulfillmentStatus
} from "../../server/services/paymentFulfillments.js";
import {
  assertVerifiedPurchaseAmount,
  buildPaystackPurchaseMetadata,
  fulfillVerifiedPurchase,
  recordPurchaseIntent,
  resolveInitializeIntent
} from "../../server/services/paymentFortress.js";
import { isFastConnectionProductType } from "../../server/services/paymentCatalog.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

function buildReference(prefix) {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `bs_${prefix}_${stamp}_${random}`.slice(0, 64);
}

const APP_RETURN_PREFIXES = ["/home", "/fast-connection", "/profile", "/settings", "/subscription", "/discover", "/chats", "/signals"];

function normalizePaymentReturnPath(value, fallback = "/home") {
  const raw = String(value || "").trim();
  const fallbackPathname = String(fallback || "").split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const safeFallback = APP_RETURN_PREFIXES.some(
    (path) => fallbackPathname === path || fallbackPathname.startsWith(`${path}/`)
  )
    ? fallback
    : "/home";
  if (!raw || raw === "/" || raw.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(raw)) {
    return safeFallback;
  }
  const pathname = raw.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (APP_RETURN_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return raw.replace(/\/$/, "") || safeFallback;
  }
  return safeFallback;
}

function paymentReturnFrom(metadata = {}, body = {}, fallback = "/home") {
  const returnPath = normalizePaymentReturnPath(
    metadata.return_path || metadata.returnPath || body.returnPath || body.paymentReturnPath,
    fallback
  );
  const sourcePage = normalizePaymentReturnPath(
    metadata.source_page || metadata.sourcePage || body.sourcePage || returnPath,
    returnPath
  );
  return { returnPath, sourcePage };
}

function logPaystackFailure(scope, error, extra = {}) {
  console.error(`[paystack] ${scope} failed`, {
    code: error?.code,
    message: error?.message,
    upstreamStatus: error?.upstreamStatus,
    ...extra
  });
}

async function notifyPurchaseEmail({
  reference,
  email,
  name,
  productType,
  productId,
  amountKobo,
  metadata = {},
  returnPath
}) {
  const firstName = String(name || metadata.name || "").trim().split(/\s+/)[0] || "there";
  try {
    await sendPurchaseConfirmationEmail({
      reference,
      email,
      firstName,
      productType,
      productId,
      amountKobo: Number(amountKobo || 0),
      userId: metadata.user_id || metadata.userId || null,
      returnPath
    });
  } catch (error) {
    console.error("[paystack] purchase email failed", {
      reference,
      message: error?.message || String(error)
    });
  }
}

async function logPaymentReturnRedirect({ reference, returnPath, productType, productId, sourcePage }) {
  try {
    await appendPaymentAudit(reference, "payment_return_redirect", {
      returnPath,
      productType,
      productId,
      sourcePage: sourcePage || null,
      source: "verify_response"
    });
  } catch (error) {
    console.error("[paystack] payment return audit failed", {
      reference,
      message: error?.message || String(error)
    });
  }
}

async function initializeCatalogCheckout(req, res, body, callbackUrl, action, fallbackReturnPath) {
  const email = String(body.email || "").trim().toLowerCase();
  const phone = normalizePhone(body.phone);
  const name = String(body.name || "").trim();
  const city = String(body.city || "Lagos").trim();
  const intent = await resolveInitializeIntent(action, body);

  if (!email) {
    return res.status(400).json({ ok: false, error: "A verified email is required before Paystack checkout." });
  }
  if (!intent?.amountKobo) {
    return res.status(400).json({ ok: false, error: "Unknown product or pricing is not configured yet." });
  }

  const { returnPath, sourcePage } = paymentReturnFrom({}, body, fallbackReturnPath);
  const referencePrefix =
    intent.productType === "boost"
      ? intent.boostId || intent.productId
      : isFastConnectionProductType(intent.productType)
        ? "quickie"
        : intent.productId;
  const reference = buildReference(referencePrefix);
  const startedAt = Date.now();

  try {
    await recordPurchaseIntent({
      reference,
      userId: body.userId || body.user_id || null,
      intent,
      source: action
    });

    const data = await initializePaystackTransaction({
      email,
      amount: intent.amountKobo,
      reference,
      callback_url: callbackUrl,
      channels: PAYSTACK_CHANNELS,
      metadata: buildPaystackPurchaseMetadata({
        intent,
        name,
        phone,
        returnPath,
        sourcePage,
        city
      })
    });

    console.info("[paystack] payment initialized", {
      reference: data?.reference || reference,
      email,
      productType: intent.productType,
      productId: intent.productId,
      amount: intent.amountKobo,
      hasAccessCode: Boolean(data?.access_code),
      ms: Date.now() - startedAt
    });

    await logPaymentInitialized({
      reference: data?.reference || reference,
      userEmail: email,
      productType: intent.productType,
      productId: intent.productId,
      returnPath
    });

    return res.status(200).json({
      ok: true,
      reference: data?.reference || reference,
      authorization_url: data?.authorization_url,
      access_code: data?.access_code,
      productType: intent.productType,
      productId: intent.productId,
      boostId: intent.boostId || undefined
    });
  } catch (error) {
    logPaystackFailure(action, error, {
      email,
      productType: intent.productType,
      productId: intent.productId,
      amount: intent.amountKobo
    });
    const mapped = paystackErrorResponse(error, "Unable to start payment. Please try again shortly.");
    return res.status(mapped.status).json(mapped.body);
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    if (!paystackConfigured()) {
      return res.status(503).json({ ok: false, error: "PAYSTACK_SECRET_KEY is not configured." });
    }

    const body = parseBody(req);
    const useNativeCallback =
      body.platform === "native" ||
      body.platform === "android" ||
      String(body.callbackPlatform || "").toLowerCase() === "native";
    const callbackUrl = useNativeCallback
      ? config.paystackAndroidCallbackUrl || config.paystackCallbackUrl
      : config.paystackCallbackUrl;

    if (req.query.action === "initialize") {
      return initializeCatalogCheckout(req, res, body, callbackUrl, "initialize", "/home");
    }

    if (req.query.action === "initialize-boost") {
      return initializeCatalogCheckout(req, res, body, callbackUrl, "initialize-boost", "/profile");
    }

    if (req.query.action === "initialize-quickie") {
      return initializeCatalogCheckout(req, res, body, callbackUrl, "initialize-quickie", "/home");
    }

    const reference = String(body.reference || body.trxref || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = normalizePhone(body.phone);
    const name = String(body.name || "").trim();
    if (!reference) return res.status(400).json({ ok: false, error: "Payment reference is required." });
    if (!email && !phone) {
      return res.status(400).json({ ok: false, error: "User email or phone number is required." });
    }

    let transaction;
    try {
      console.info("[paystack] verification started", { reference, email: email || phone });
      transaction = await verifyPaystackTransaction(reference);
    } catch (error) {
      logPaystackFailure("verify", error, { reference });
      const mapped = paystackErrorResponse(error, "Payment verification is unavailable right now.");
      return res.status(mapped.status).json(mapped.body);
    }

    if (transaction?.status !== "success") {
      console.info("[paystack] verification result", { reference, ok: false, status: transaction?.status });
      return res.status(402).json({ ok: false, error: "Payment is not successful yet." });
    }

    console.info("[paystack] verification result", { reference, ok: true, status: transaction.status });

    const transactionEmail = String(transaction?.customer?.email || transaction?.metadata?.email || "").toLowerCase();
    if (email && transactionEmail && transactionEmail !== email) {
      return res.status(403).json({ ok: false, error: "Payment email does not match this BamSignal account." });
    }

    const metadata = transaction?.metadata || {};
    const { returnPath, sourcePage } = paymentReturnFrom(metadata, {}, "/home");

    await claimPaymentFulfillment({
      reference,
      userId: metadata.user_id || metadata.userId || null,
      productType: metadata.product_type || "premium",
      productId: metadata.product_id || null,
      amountKobo: Number(transaction?.amount || 0),
      currency: String(transaction?.currency || "").trim() || null,
      rawPayload: {
        source: "verify",
        transaction
      }
    });

    const existingFulfillment = await getPaymentFulfillment(reference);
    if (existingFulfillment?.status === "fulfilled") {
      return res.status(200).json({
        ok: true,
        productType: existingFulfillment.product_type,
        productId: existingFulfillment.product_id,
        returnPath,
        sourcePage
      });
    }

    const amountCheck = await assertVerifiedPurchaseAmount(reference, transaction, metadata);
    if (!amountCheck.ok) {
      return res.status(422).json({ ok: false, error: amountCheck.error || "Payment amount does not match this purchase." });
    }

    const intent = amountCheck.intent;
    const activation = await fulfillVerifiedPurchase({
      intent,
      email: email || transactionEmail,
      phone,
      name,
      reference,
      city: metadata.city || "",
      transaction
    });

    if (!activation.ok) {
      if (activation.requiresCity) {
        return res.status(422).json({
          ok: false,
          error:
            activation.boostId === "city-spotlight"
              ? "Complete onboarding in your city before buying City Spotlight."
              : "Complete onboarding in your city before buying a City Boost."
        });
      }
      return res.status(422).json({ ok: false, error: "Unable to activate this purchase." });
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

    await notifyPurchaseEmail({
      reference,
      email: email || transactionEmail,
      name,
      productType: intent.productType,
      productId: intent.productId,
      amountKobo: transaction?.amount,
      metadata,
      returnPath
    });

    await logPaymentReturnRedirect({
      reference,
      returnPath,
      sourcePage,
      productType: intent.productType,
      productId: intent.productId
    });

    if (isFastConnectionProductType(intent.productType)) {
      return res.status(200).json({
        ok: true,
        productType: intent.productType,
        productId: intent.productId,
        returnPath,
        sourcePage,
        quickiePassUntil: activation.passUntil,
        fastConnectionPassUntil: activation.passUntil
      });
    }

    if (intent.productType === "boost") {
      return res.status(200).json({
        ok: true,
        productType: "boost",
        productId: intent.productId,
        returnPath,
        sourcePage,
        boostId: activation.boostId,
        city: activation.placement?.city,
        expiresAt: activation.expiresAt
      });
    }

    return res.status(200).json({
      ok: true,
      productType: "premium",
      productId: intent.productId,
      returnPath,
      sourcePage,
      premium_until: activation.premiumUntil,
      days: intent.days,
      invite_link: activation.inviteLink,
      user: activation.activation
    });
  } catch (error) {
    logPaystackFailure("handler", error);
    return res.status(500).json({ ok: false, error: error.message || "Payment request failed." });
  }
}
