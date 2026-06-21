import { config } from "../../server/config.js";
import { PAYSTACK_CHANNELS } from "../../server/paystackChannels.js";
import {
  PAYMENT_INITIALIZE_CLIENT_ERROR,
  PAYMENT_VERIFY_CLIENT_ERROR,
  initializePaystackTransaction,
  logPaymentProviderError,
  paystackConfigured,
  paystackErrorResponse,
  verifyPaystackTransaction
} from "../../server/services/paystackClient.js";
import { logPaymentInitialized } from "../../server/services/purchaseEmail.js";
import { appendPaymentAudit } from "../../server/services/paymentEvents.js";
import {
  buildPaystackPurchaseMetadata,
  completePaymentFulfillment,
  recordPurchaseIntent,
  resolveInitializeIntent
} from "../../server/services/paymentFortress.js";
import { isFastConnectionProductType } from "../../server/services/paymentCatalog.js";
import {
  PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE,
  isPaymentDatabaseError,
  paymentHttpStatusForError
} from "../../server/services/paymentDb.js";
import {
  logObservabilityEvent,
  observabilityContext
} from "../../server/services/observability.js";
import { requireMemberAuth } from "../../server/services/memberAuth.js";
import {
  PAYMENT_INITIALIZE_RATE_LIMITED_MESSAGE,
  enforcePaymentInitializeThrottle
} from "../../server/services/paymentInitializeThrottle.js";

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

async function logPaymentReturnRedirect(req, { reference, returnPath, productType, productId, sourcePage }) {
  try {
    await appendPaymentAudit(reference, "payment_return_redirect", {
      returnPath,
      productType,
      productId,
      sourcePage: sourcePage || null,
      source: "verify_response"
    });
  } catch (error) {
    logObservabilityEvent(
      "payment_audit_failed",
      observabilityContext(req, {
        scope: "payment_return_redirect",
        reference,
        error: error?.message || String(error)
      }),
      "warn"
    );
  }
}

function buildVerifySuccessResponse(result) {
  const { intent, activation, returnPath, sourcePage, productType, productId } = result;

  if (result.idempotent) {
    return {
      ok: true,
      productType,
      productId,
      returnPath,
      sourcePage
    };
  }

  if (isFastConnectionProductType(intent.productType)) {
    return {
      ok: true,
      productType: intent.productType,
      productId: intent.productId,
      returnPath,
      sourcePage,
      quickiePassUntil: activation.passUntil,
      fastConnectionPassUntil: activation.passUntil
    };
  }

  if (intent.productType === "boost") {
    return {
      ok: true,
      productType: "boost",
      productId: intent.productId,
      returnPath,
      sourcePage,
      boostId: activation.boostId,
      city: activation.placement?.city,
      expiresAt: activation.expiresAt
    };
  }

  return {
    ok: true,
    productType: "premium",
    productId: intent.productId,
    returnPath,
    sourcePage,
    premium_until: activation.premiumUntil,
    days: intent.days,
    invite_link: activation.inviteLink,
    user: activation.activation
  };
}

async function initializeCatalogCheckout(req, res, body, callbackUrl, action, fallbackReturnPath, memberAuth) {
  const email = String(memberAuth?.identity?.email || memberAuth?.email || "").trim().toLowerCase();
  const phone = normalizePhone(memberAuth?.identity?.phone || memberAuth?.phone || "");
  const name = String(memberAuth?.identity?.name || body.name || "").trim();
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
      userId: memberAuth?.authUserId || memberAuth?.memberId || null,
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

    logObservabilityEvent(
      "payment_initialized",
      observabilityContext(req, {
        reference: data?.reference || reference,
        productType: intent.productType,
        productId: intent.productId,
        amount: intent.amountKobo,
        hasAccessCode: Boolean(data?.access_code),
        ms: Date.now() - startedAt
      }),
      "info"
    );

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
    if (isPaymentDatabaseError(error)) {
      logPaymentProviderError(req, "initialize", error, {
        productType: intent.productType,
        productId: intent.productId
      });
      return res.status(503).json({ ok: false, error: PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE });
    }
    logPaymentProviderError(req, "initialize", error, {
      productType: intent.productType,
      productId: intent.productId,
      amount: intent.amountKobo
    });
    const mapped = paystackErrorResponse(error, PAYMENT_INITIALIZE_CLIENT_ERROR);
    return res.status(mapped.status).json(mapped.body);
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const body = parseBody(req);
    const action = String(req.query.action || "").trim();
    const isInitializeAction =
      action === "initialize" || action === "initialize-boost" || action === "initialize-quickie";

    let memberAuth = null;
    if (isInitializeAction) {
      memberAuth = await requireMemberAuth(req, body);
      if (!memberAuth.ok) {
        return res.status(memberAuth.status || 401).json({ ok: false, error: "not_authorized" });
      }

      const throttle = await enforcePaymentInitializeThrottle({ req, action, memberAuth });
      if (!throttle.ok) {
        return res.status(throttle.status || 429).json({
          ok: false,
          error: throttle.error || PAYMENT_INITIALIZE_RATE_LIMITED_MESSAGE
        });
      }
    }

    if (!paystackConfigured()) {
      return res.status(503).json({
        ok: false,
        error: isInitializeAction ? PAYMENT_INITIALIZE_CLIENT_ERROR : PAYMENT_VERIFY_CLIENT_ERROR
      });
    }

    const useNativeCallback =
      body.platform === "native" ||
      body.platform === "android" ||
      String(body.callbackPlatform || "").toLowerCase() === "native";
    const callbackUrl = useNativeCallback
      ? config.paystackAndroidCallbackUrl || config.paystackCallbackUrl
      : config.paystackCallbackUrl;

    if (action === "initialize") {
      return initializeCatalogCheckout(req, res, body, callbackUrl, "initialize", "/home", memberAuth);
    }

    if (action === "initialize-boost") {
      return initializeCatalogCheckout(req, res, body, callbackUrl, "initialize-boost", "/profile", memberAuth);
    }

    if (action === "initialize-quickie") {
      return initializeCatalogCheckout(req, res, body, callbackUrl, "initialize-quickie", "/home", memberAuth);
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
      logObservabilityEvent(
        "payment_verify_started",
        observabilityContext(req, { reference }),
        "info"
      );
      transaction = await verifyPaystackTransaction(reference);
    } catch (error) {
      logPaymentProviderError(req, "verify", error, { reference });
      const mapped = paystackErrorResponse(error, PAYMENT_VERIFY_CLIENT_ERROR);
      return res.status(mapped.status).json(mapped.body);
    }

    if (transaction?.status !== "success") {
      logObservabilityEvent(
        "payment_verify_result",
        observabilityContext(req, { reference, ok: false, status: transaction?.status || null }),
        "info"
      );
      return res.status(402).json({ ok: false, error: "Payment is not successful yet." });
    }

    logObservabilityEvent(
      "payment_verify_result",
      observabilityContext(req, { reference, ok: true, status: transaction.status }),
      "info"
    );

    const transactionEmail = String(transaction?.customer?.email || transaction?.metadata?.email || "").toLowerCase();
    if (email && transactionEmail && transactionEmail !== email) {
      return res.status(403).json({ ok: false, error: "Payment email does not match this BamSignal account." });
    }

    const metadata = transaction?.metadata || {};
    const { returnPath, sourcePage } = paymentReturnFrom(metadata, {}, "/home");

    try {
      const result = await completePaymentFulfillment({
        reference,
        transaction,
        metadata,
        email: email || transactionEmail,
        phone,
        name,
        city: metadata.city || "",
        returnPath,
        sourcePage,
        ledgerSource: "verify"
      });

      if (result.processing) {
        return res.status(503).json({ ok: false, error: PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE });
      }

      if (!result.ok) {
        return res.status(result.status || 422).json({ ok: false, error: result.error });
      }

      if (!result.idempotent) {
        await logPaymentReturnRedirect(req, {
          reference,
          returnPath,
          sourcePage,
          productType: result.productType,
          productId: result.productId
        });
      }

      return res.status(200).json(buildVerifySuccessResponse(result));
    } catch (error) {
      if (isPaymentDatabaseError(error)) {
        logPaymentProviderError(req, "verify", error, { reference, scope: "verify persistence" });
        return res.status(503).json({ ok: false, error: PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE });
      }
      throw error;
    }
  } catch (error) {
    logPaymentProviderError(req, "verify", error, { scope: "handler" });
    const status = paymentHttpStatusForError(error);
    return res.status(status).json({
      ok: false,
      error: isPaymentDatabaseError(error)
        ? PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE
        : PAYMENT_VERIFY_CLIENT_ERROR
    });
  }
}
