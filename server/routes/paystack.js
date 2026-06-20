import crypto from "node:crypto";
import express from "express";
import { config } from "../config.js";
import { sendPurchaseConfirmationEmail } from "../services/purchaseEmail.js";
import {
  claimPaymentFulfillment,
  getPaymentFulfillment,
  markPaymentFulfillmentStatus
} from "../services/paymentFulfillments.js";
import {
  assertVerifiedPurchaseAmount,
  fulfillVerifiedPurchase
} from "../services/paymentFortress.js";

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
  const productType = String(metadata.product_type || "premium").trim();
  const productId = String(metadata.product_id || metadata.plan || "monthly").trim();
  const returnPath = normalizeReturnPath(metadata.return_path || metadata.returnPath);

  if (!email && !phone) {
    return { ok: false, reason: "No user identifier in Paystack metadata/customer" };
  }

  if (reference) {
    const claim = await claimPaymentFulfillment({
      reference,
      userId: metadata.user_id || metadata.userId || null,
      productType,
      productId,
      amountKobo: Number(data.amount || 0),
      currency: String(data.currency || "").trim() || null,
      rawPayload: { source: "webhook_route", event: event.event, data }
    });
    const existing = claim || (await getPaymentFulfillment(reference));
    if (existing?.status === "fulfilled") {
      return { ok: true, idempotent: true, reference, productType, productId };
    }
  }

  const amountCheck = await assertVerifiedPurchaseAmount(reference, data, metadata);
  if (!amountCheck.ok) {
    return { ok: false, reference, reason: amountCheck.amountCheck?.reason || "amount_mismatch" };
  }

  const intent = amountCheck.intent;
  const activation = await fulfillVerifiedPurchase({
    intent,
    email: email || null,
    phone: phone || null,
    name,
    reference,
    city: metadata.city || "",
    transaction: data
  });

  if (reference && email) {
    await markPaymentFulfillmentStatus(reference, "fulfilled", {
      productType: intent.productType,
      productId: intent.productId,
      amountKobo: Number(data.amount || 0),
      currency: String(data.currency || "").trim() || null,
      rawPayload: { purchaseIntent: intent, activation }
    });
    await sendPurchaseConfirmationEmail({
      reference,
      email,
      firstName: name.split(/\s+/)[0] || "there",
      productType: intent.productType,
      productId: intent.productId,
      amountKobo: Number(data.amount || 0),
      userId: metadata.user_id || metadata.userId || null,
      returnPath
    }).catch((error) => {
      console.error("[paystack webhook] purchase email failed", error?.message || error);
    });
  }

  return { ok: true, email, productType: intent.productType, productId: intent.productId, activation };
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
    return res.json({ ok: true, event: event.event, purchase: result });
  } catch (error) {
    return next(error);
  }
}

paystackRouter.post("/webhooks/paystack", handlePaystackWebhook);
paystackRouter.post("/api/paystack/webhook", handlePaystackWebhook);
