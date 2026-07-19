import { requireMemberAuth } from "../services/memberAuth.js";
import {
  PAYMENT_INITIALIZE_CLIENT_ERROR,
  PAYMENT_VERIFY_CLIENT_ERROR,
  paystackErrorResponse
} from "../services/paystackClient.js";
import { logPaymentInitialized } from "../services/purchaseEmail.js";
import {
  PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE,
  isPaymentDatabaseError,
  paymentHttpStatusForError
} from "../services/paymentDb.js";
import {
  logObservabilityEvent,
  observabilityContext
} from "../services/observability.js";
import { sanitizeApiErrorForLog } from "../services/errorResponse.js";
import {
  PAYMENT_INITIALIZE_RATE_LIMITED_MESSAGE,
  enforcePaymentInitializeThrottle
} from "../services/paymentInitializeThrottle.js";
import {
  consultationCallbackUrl,
  consultationPaystackConfigured,
  initializeConsultationPaymentCheckout,
  resolveConsultationFeeIntent,
  verifyConsultationPaymentCheckout
} from "../services/paystackConsultationService.js";

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

async function handleInitialize(req, res, body, memberAuth) {
  const email = String(memberAuth?.identity?.email || memberAuth?.email || "").trim().toLowerCase();
  const phone = normalizePhone(memberAuth?.identity?.phone || memberAuth?.phone || "");
  const name = String(memberAuth?.identity?.name || body.name || "").trim();
  const intent = await resolveConsultationFeeIntent({
    paymentId: body.paymentId,
    memberId: body.memberId,
    journeyId: body.journeyId
  });

  if (!email) {
    return res.status(400).json({ ok: false, error: "A verified email is required before Paystack checkout." });
  }
  if (!intent) {
    return res.status(400).json({ ok: false, error: "Consultation payment details are incomplete." });
  }

  const returnPath = String(body.returnPath || body.paymentReturnPath || "/signal-concierge/consultation").trim();
  const sourcePage = String(body.sourcePage || returnPath).trim();
  const callbackUrl = consultationCallbackUrl(body);
  const startedAt = Date.now();

  try {
    const checkout = await initializeConsultationPaymentCheckout({
      intent,
      email,
      name,
      phone,
      userId: memberAuth?.authUserId || memberAuth?.memberId || null,
      callbackUrl,
      returnPath,
      sourcePage
    });

    logObservabilityEvent(
      "consultation_payment_initialized",
      observabilityContext(req, {
        reference: checkout.reference,
        paymentId: intent.paymentId,
        memberId: intent.memberId,
        journeyId: intent.journeyId,
        amount: intent.amountKobo,
        hasAccessCode: Boolean(checkout.access_code),
        ms: Date.now() - startedAt
      }),
      "info"
    );

    await logPaymentInitialized({
      reference: checkout.reference,
      userEmail: email,
      productType: intent.productType,
      productId: intent.productId,
      returnPath: checkout.returnPath
    });

    return res.status(200).json({
      ok: true,
      reference: checkout.reference,
      authorization_url: checkout.authorization_url,
      access_code: checkout.access_code,
      productType: intent.productType,
      productId: intent.productId,
      paymentId: intent.paymentId,
      memberId: intent.memberId,
      journeyId: intent.journeyId,
      amountKobo: intent.amountKobo,
      returnPath: checkout.returnPath
    });
  } catch (error) {
    if (isPaymentDatabaseError(error)) {
      return res.status(503).json({ ok: false, error: PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE });
    }
    const mapped = paystackErrorResponse(error, PAYMENT_INITIALIZE_CLIENT_ERROR);
    return res.status(mapped.status).json(mapped.body);
  }
}

async function handleVerify(req, res, body, memberAuth) {
  const reference = String(body.reference || body.trxref || "").trim();
  const email = String(memberAuth?.identity?.email || memberAuth?.email || body.email || "")
    .trim()
    .toLowerCase();
  const phone = normalizePhone(memberAuth?.identity?.phone || memberAuth?.phone || body.phone || "");
  const name = String(memberAuth?.identity?.name || body.name || "").trim();

  if (!reference) {
    return res.status(400).json({ ok: false, error: "Payment reference is required." });
  }
  if (!email && !phone) {
    return res.status(400).json({ ok: false, error: "User email or phone number is required." });
  }

  try {
    logObservabilityEvent(
      "consultation_payment_verify_started",
      observabilityContext(req, { reference }),
      "info"
    );

    const result = await verifyConsultationPaymentCheckout({
      reference,
      email,
      phone,
      name,
      returnPath: body.returnPath || body.paymentReturnPath,
      sourcePage: body.sourcePage
    });

    if (result.pending) {
      return res.status(402).json({ ok: false, error: "Payment is not successful yet.", pending: true });
    }

    if (!result.ok) {
      return res.status(result.status || 422).json({ ok: false, error: result.error || PAYMENT_VERIFY_CLIENT_ERROR });
    }

    logObservabilityEvent(
      "consultation_payment_verify_result",
      observabilityContext(req, {
        reference,
        ok: true,
        paymentId: result.paymentId,
        memberId: result.memberId,
        journeyId: result.journeyId,
        idempotent: Boolean(result.idempotent)
      }),
      "info"
    );

    return res.status(200).json({
      ok: true,
      idempotent: Boolean(result.idempotent),
      productType: result.productType,
      productId: result.productId,
      paymentId: result.paymentId,
      memberId: result.memberId,
      journeyId: result.journeyId,
      consultationEligible: result.consultationEligible,
      consultationUnlocked: result.consultationUnlocked,
      returnPath: result.returnPath
    });
  } catch (error) {
    if (isPaymentDatabaseError(error)) {
      return res.status(503).json({ ok: false, error: PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE });
    }
    const mapped = paystackErrorResponse(error, PAYMENT_VERIFY_CLIENT_ERROR);
    return res.status(mapped.status).json(mapped.body);
  }
}

export default async function consultationPaymentsHandler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const body = parseBody(req);
    const action = String(req.query.action || body.action || "").trim();
    const isInitialize = action === "initialize";

    const memberAuth = await requireMemberAuth(req, body);
    if (!memberAuth.ok) {
      return res.status(memberAuth.status || 401).json({ ok: false, error: "not_authorized" });
    }

    if (isInitialize) {
      const throttle = await enforcePaymentInitializeThrottle({
        req,
        action: "initialize-consultation-fee",
        memberAuth
      });
      if (!throttle.ok) {
        return res.status(throttle.status || 429).json({
          ok: false,
          error: throttle.error || PAYMENT_INITIALIZE_RATE_LIMITED_MESSAGE
        });
      }
    }

    if (!consultationPaystackConfigured()) {
      return res.status(503).json({
        ok: false,
        error: isInitialize ? PAYMENT_INITIALIZE_CLIENT_ERROR : PAYMENT_VERIFY_CLIENT_ERROR
      });
    }

    if (isInitialize) {
      return handleInitialize(req, res, body, memberAuth);
    }

    if (action === "verify") {
      return handleVerify(req, res, body, memberAuth);
    }

    return res.status(400).json({ ok: false, error: "Unknown consultation payment action." });
  } catch (error) {
    const sanitized = sanitizeApiErrorForLog(error);
    logObservabilityEvent(
      "consultation_payment_handler_error",
      observabilityContext(req, {
        error: sanitized.message,
        errorCategory: sanitized.category
      }),
      "error"
    );
    const status = paymentHttpStatusForError(error);
    return res.status(status).json({
      ok: false,
      error: isPaymentDatabaseError(error)
        ? PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE
        : PAYMENT_VERIFY_CLIENT_ERROR
    });
  }
}
