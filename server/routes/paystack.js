import crypto from "node:crypto";
import express from "express";
import { config } from "../config.js";
import { query } from "../db.js";
import { completePaymentFulfillment } from "../services/paymentFortress.js";
import {
  PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE,
  isPaymentDatabaseError,
  paymentHttpStatusForError
} from "../services/paymentDb.js";

export const paystackRouter = express.Router();

function verifyPaystackSignature(req) {
  if (!config.paystackSecretKey) return false;
  const signature = req.headers["x-paystack-signature"];
  const hash = crypto
    .createHmac("sha512", config.paystackSecretKey)
    .update(req.rawBody)
    .digest("hex");
  return signature === hash;
}

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

function normalizeReturnPath(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "/" || raw.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(raw)) return "/home";
  const path = raw.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const allowed = ["/home", "/fast-connection", "/profile", "/settings", "/subscription", "/discover", "/chats", "/signals"];
  return allowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) ? raw.replace(/\/$/, "") : "/home";
}

async function activatePurchase(event) {
  const data = event.data || {};
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

  const result = await completePaymentFulfillment({
    reference,
    transaction: data,
    metadata,
    email,
    phone,
    name,
    city: metadata.city || "",
    returnPath,
    sourcePage: returnPath,
    ledgerSource: "webhook_route"
  });

  if (result.ok) {
    await query(
      `insert into subscription_events (provider, event_type, user_email, user_id, payload)
       values ('paystack', $1, $2, $3, $4)`,
      [event.event, email || null, metadata.user_id || metadata.userId || null, event]
    );
  }

  return result;
}

async function handlePaystackWebhook(req, res, next) {
  try {
    if (!verifyPaystackSignature(req)) {
      return res.status(401).json({ ok: false, error: "Invalid Paystack signature" });
    }

    const event = JSON.parse(req.rawBody.toString("utf8"));
    const premiumEvents = new Set(["subscription.create", "charge.success", "invoice.payment_success"]);
    if (!premiumEvents.has(event.event)) {
      return res.json({ ok: true, ignored: true, event: event.event });
    }

    const result = await activatePurchase(event);
    if (!result.ok) {
      if (result.status === 422 && /amount/i.test(String(result.error || ""))) {
        return res.json({ ok: true, ignored: true, reason: "amount_mismatch" });
      }
      return res.status(result.status || 422).json({ ok: false, error: result.error || "Unable to fulfill purchase." });
    }

    return res.json({
      ok: true,
      idempotent: Boolean(result.idempotent),
      event: event.event,
      productType: result.productType,
      productId: result.productId,
      activation: result.activation || null
    });
  } catch (error) {
    if (isPaymentDatabaseError(error)) {
      console.error("[paystack webhook route] persistence unavailable", error?.message || error);
      return res.status(503).json({ ok: false, error: PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE });
    }
    return next(error);
  }
}

paystackRouter.post("/webhooks/paystack", handlePaystackWebhook);
paystackRouter.post("/api/paystack/webhook", handlePaystackWebhook);
