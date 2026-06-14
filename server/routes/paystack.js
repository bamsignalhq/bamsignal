import crypto from "node:crypto";
import express from "express";
import { config } from "../config.js";
import { activateAppUserPremium } from "../db.js";
import { createVipInviteLink } from "../telegram.js";
import { planDaysFromAmount, normalizePlans } from "../pricing.js";

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
function premiumUntilFromEvent(data = {}) {
  const metadata = data.metadata || {};
  const explicit = metadata.premium_until || metadata.premiumUntil;
  if (explicit) return new Date(explicit).toISOString();

  const metadataDays = Number(metadata.days || metadata.plan_days || metadata.planDays);
  if (Number.isFinite(metadataDays) && metadataDays > 0 && metadataDays <= 370) {
    return new Date(Date.now() + metadataDays * 86400000).toISOString();
  }

  const amount = Number(data.amount || 0);
  const plans = normalizePlans(null);
  const days = planDaysFromAmount(amount, plans);
  return new Date(Date.now() + Math.max(1, Math.min(days || 7, 370)) * 86400000).toISOString();
}

async function activatePremium(event) {
  const data = event.data || {};
  const customer = data.customer || {};
  const metadata = data.metadata || {};
  const email = String(customer.email || data.customer_email || metadata.email || "").toLowerCase();
  const phone = String(metadata.phone || metadata.phone_number || "").replace(/\D/g, "").replace(/^234/, "");
  const name = String(metadata.name || customer.first_name || "").trim();
  const reference = String(data.reference || metadata.reference || "");
  const premiumUntil = premiumUntilFromEvent(data);
  const inviteLink = await createVipInviteLink(email || phone).catch(() => null);

  if (!email && !phone) {
    return { ok: false, reason: "No user identifier in Paystack metadata/customer" };
  }

  const user = await activateAppUserPremium({
    email: email || null,
    phone: phone || null,
    name,
    premiumUntil,
    paystackReference: reference,
    inviteLink
  });

  return { ok: true, email, premium_until: premiumUntil, invite_link: inviteLink, user };
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

    const result = await activatePremium(event);
    return res.json({ ok: true, event: event.event, premium: result });
  } catch (error) {
    return next(error);
  }
}

paystackRouter.post("/webhooks/paystack", handlePaystackWebhook);
paystackRouter.post("/api/paystack/webhook", handlePaystackWebhook);
