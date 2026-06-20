import crypto from "node:crypto";
import express from "express";
import { config } from "../config.js";
import { activateAppUserFastConnectionPass, activateAppUserPremium } from "../db.js";
import { activateCityBoostPlacement, activateCitySpotlightPlacement } from "../cityHome.js";
import { createVipInviteLink } from "../telegram.js";
import { planDaysFromAmount, normalizePlans } from "../pricing.js";
import { sendPurchaseConfirmationEmail } from "../services/purchaseEmail.js";

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

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

function normalizeReturnPath(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "/" || raw.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(raw)) return "/home";
  const path = raw.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const allowed = ["/home", "/profile", "/settings", "/subscription", "/discover", "/chats", "/signals"];
  return allowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) ? raw.replace(/\/$/, "") : "/home";
}

function productDetails(data = {}) {
  const metadata = data.metadata || {};
  const productType = String(metadata.product_type || "premium").trim();
  if (productType === "quickie") {
    return { productType, productId: String(metadata.product_id || "fast-connection-pass") };
  }
  if (productType === "boost") {
    const boostId = String(metadata.boost_id || metadata.product_id || "city-boost").trim();
    return { productType, productId: String(metadata.product_id || boostId), boostId };
  }
  return {
    productType: "premium",
    productId: String(metadata.product_id || metadata.plan || metadata.plan_days || "monthly")
  };
}

async function activatePurchase(event) {
  const data = event.data || {};
  const customer = data.customer || {};
  const metadata = data.metadata || {};
  const email = String(customer.email || data.customer_email || metadata.email || "").toLowerCase();
  const phone = normalizePhone(metadata.phone || metadata.phone_number || "");
  const name = String(metadata.name || customer.first_name || "").trim();
  const reference = String(data.reference || metadata.reference || "");
  const { productType, productId, boostId } = productDetails(data);
  const returnPath = normalizeReturnPath(metadata.return_path || metadata.returnPath);

  if (!email && !phone) {
    return { ok: false, reason: "No user identifier in Paystack metadata/customer" };
  }

  let activation = null;
  if (productType === "quickie") {
    const passDays = Math.max(1, Math.round(Number(metadata.quickie_days || 7)));
    const passUntil = new Date(Date.now() + passDays * 86400000).toISOString();
    activation = await activateAppUserFastConnectionPass({
      email: email || null,
      phone: phone || null,
      name,
      passUntil,
      paystackReference: reference
    });
  } else if (productType === "boost") {
    const city = String(metadata.city || "").trim();
    const durationHours = Math.max(1, Math.round(Number(metadata.duration_hours || 48)));
    if (boostId === "city-spotlight") {
      activation = await activateCitySpotlightPlacement({
        email: email || null,
        phone: phone || null,
        city,
        durationHours: durationHours || 24,
        paystackReference: reference
      });
    } else if (boostId === "city-boost") {
      activation = await activateCityBoostPlacement({
        email: email || null,
        phone: phone || null,
        city,
        durationHours,
        paystackReference: reference
      });
    } else {
      activation = { ok: true, productType, boostId, paystackReference: reference };
    }
  } else {
    const premiumUntil = premiumUntilFromEvent(data);
    const inviteLink = await createVipInviteLink(email || phone).catch(() => null);
    activation = await activateAppUserPremium({
      email: email || null,
      phone: phone || null,
      name,
      premiumUntil,
      paystackReference: reference,
      inviteLink
    });
  }

  if (reference && email) {
    await sendPurchaseConfirmationEmail({
      reference,
      email,
      firstName: name.split(/\s+/)[0] || "there",
      productType,
      productId,
      amountKobo: Number(data.amount || 0),
      userId: metadata.user_id || metadata.userId || null,
      returnPath
    }).catch((error) => {
      console.error("[paystack webhook] purchase email failed", error?.message || error);
    });
  }

  return { ok: true, email, productType, productId, activation };
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
