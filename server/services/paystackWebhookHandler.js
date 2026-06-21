/**
 * Shared Paystack webhook handler — single source of truth for Express and serverless wrappers.
 *
 * Paystack dashboard webhook URL (production):
 *   https://bamsignal.com/api/paystack/webhook
 *
 * Alias paths remain mounted for backward compatibility; all call this module.
 */
import crypto from "node:crypto";
import { config } from "../config.js";
import { query, withDbRetry } from "../db.js";
import { completePaymentFulfillment } from "./paymentFortress.js";
import {
  PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE,
  isPaymentDatabaseError,
  paymentHttpStatusForError
} from "./paymentDb.js";
import { logAlertableEvent, logThresholdedAlert, observabilityContext } from "./observability.js";
import { sanitizeApiErrorForLog } from "./errorResponse.js";

export const PAYSTACK_WEBHOOK_CANONICAL_PATH = "/api/paystack/webhook";

export const PAYSTACK_WEBHOOK_ALIAS_PATHS = ["/webhooks/paystack", "/api/webhooks/paystack"];

export const PAYSTACK_WEBHOOK_MOUNT_PATHS = [
  PAYSTACK_WEBHOOK_CANONICAL_PATH,
  ...PAYSTACK_WEBHOOK_ALIAS_PATHS
];

const PREMIUM_EVENTS = new Set(["subscription.create", "charge.success", "invoice.payment_success"]);

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

function normalizeReturnPath(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "/" || raw.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(raw)) return "/home";
  const path = raw.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const allowed = [
    "/home",
    "/fast-connection",
    "/profile",
    "/settings",
    "/subscription",
    "/discover",
    "/chats",
    "/signals"
  ];
  return allowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
    ? raw.replace(/\/$/, "")
    : "/home";
}

export function verifyPaystackWebhookSignature(rawBody, signature, secretKey = config.paystackSecretKey) {
  if (!secretKey || !signature) return false;
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody || "");
  const hash = crypto.createHmac("sha512", secretKey).update(body).digest("hex");
  return hash === signature;
}

async function recordSubscriptionWebhookEvent(event, email, metadata) {
  await query(
    `insert into subscription_events (provider, event_type, user_email, user_id, payload)
     values ('paystack', $1, $2, $3, $4)`,
    [event.event, email || null, metadata.user_id || metadata.userId || null, event]
  );
}

async function fulfillPaystackWebhookEvent(event, { ledgerSource = "webhook" } = {}) {
  const data = event?.data || {};
  const customer = data.customer || {};
  const metadata = data.metadata || {};
  const email = String(customer.email || data.customer_email || metadata.email || "").toLowerCase();
  const phone = normalizePhone(metadata.phone || metadata.phone_number || "");
  const name = String(metadata.name || customer.first_name || "").trim();
  const reference = String(data.reference || metadata.reference || "");
  const returnPath = normalizeReturnPath(metadata.return_path || metadata.returnPath);

  if (!email && !phone) {
    return { ok: false, status: 422, error: "No user identifier in Paystack metadata/customer" };
  }
  if (!reference) {
    return { ok: false, status: 422, error: "Payment reference is required." };
  }

  let result;
  await withDbRetry(async () => {
    result = await completePaymentFulfillment({
      reference,
      transaction: data,
      metadata,
      email,
      phone,
      name,
      city: metadata.city || "",
      returnPath,
      sourcePage: returnPath,
      ledgerSource
    });

    if (result.ok && !result.idempotent) {
      await recordSubscriptionWebhookEvent(event, email, metadata);
    }
  });

  return result;
}

function buildWebhookSuccessBody(event, result) {
  return {
    ok: true,
    idempotent: Boolean(result.idempotent),
    processing: Boolean(result.processing),
    event: event.event,
    productType: result.productType,
    productId: result.productId,
    activation: result.activation || null
  };
}

/**
 * Core Paystack webhook processor. Returns HTTP status + JSON body for any transport.
 */
export async function handlePaystackWebhookRequest({
  method = "POST",
  rawBody,
  signature,
  secretKey = config.paystackSecretKey,
  ledgerSource = "webhook",
  requestId = null,
  correlationId = null
} = {}) {
  const logContext = observabilityContext(
    { observability: { requestId, correlationId } },
    { ledgerSource }
  );
  const errorBody = (message) => ({
    ok: false,
    error: message,
    ...(requestId ? { requestId } : {})
  });

  if (String(method || "").toUpperCase() !== "POST") {
    return {
      status: 405,
      headers: { Allow: "POST" },
      body: errorBody("Method not allowed")
    };
  }

  const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody || "");
  if (!verifyPaystackWebhookSignature(bodyBuffer, signature, secretKey)) {
    logThresholdedAlert("payment_webhook_failed", {
      ...logContext,
      reason: "invalid_signature"
    });
    return {
      status: 401,
      body: errorBody("Invalid Paystack signature")
    };
  }

  try {
    const event = JSON.parse(bodyBuffer.toString("utf8"));
    if (!PREMIUM_EVENTS.has(event.event)) {
      return {
        status: 200,
        body: { ok: true, ignored: true, event: event.event }
      };
    }

    const result = await fulfillPaystackWebhookEvent(event, { ledgerSource });
    if (result?.processing) {
      return {
        status: 503,
        body: errorBody(PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE)
      };
    }
    if (!result?.ok) {
      if (result?.status === 422 && /amount/i.test(String(result.error || ""))) {
        return {
          status: 200,
          body: { ok: true, ignored: true, reason: "amount_mismatch" }
        };
      }
      logThresholdedAlert("payment_webhook_failed", {
        ...logContext,
        event: event.event,
        reason: "fulfillment_failed",
        status: result?.status || 422
      });
      return {
        status: result?.status || 422,
        body: errorBody("Unable to fulfill purchase.")
      };
    }

    return {
      status: 200,
      body: buildWebhookSuccessBody(event, result)
    };
  } catch (error) {
    if (isPaymentDatabaseError(error)) {
      logThresholdedAlert("payment_webhook_failed", {
        ...logContext,
        reason: "persistence_unavailable",
        code: error?.code || null
      });
      return {
        status: 503,
        body: errorBody(PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE)
      };
    }
    const sanitized = sanitizeApiErrorForLog(error);
    logThresholdedAlert("payment_webhook_failed", {
      ...logContext,
      reason: sanitized.category,
      code: sanitized.code
    });
    return {
      status: paymentHttpStatusForError(error),
      body: errorBody("Paystack webhook failed")
    };
  }
}

export function sendPaystackWebhookHttpResponse(res, outcome) {
  if (outcome?.headers) {
    for (const [key, value] of Object.entries(outcome.headers)) {
      res.setHeader(key, value);
    }
  }
  return res.status(outcome.status).json(outcome.body);
}

export async function handlePaystackWebhookExpress(req, res, next) {
  try {
    const outcome = await handlePaystackWebhookRequest({
      method: req.method,
      rawBody: req.rawBody,
      signature: req.headers["x-paystack-signature"],
      requestId: req?.observability?.requestId || null,
      correlationId: req?.observability?.correlationId || null
    });
    return sendPaystackWebhookHttpResponse(res, outcome);
  } catch (error) {
    return next(error);
  }
}
