import crypto from "node:crypto";
import { activateAppUserFastConnectionPass, activateAppUserPremium, query, withDbRetry } from "../../server/db.js";
import { activateCityBoostPlacement, activateCitySpotlightPlacement } from "../../server/cityHome.js";
import { createVipInviteLink } from "../../server/telegram.js";
import { sendPurchaseConfirmationEmail } from "../../server/services/purchaseEmail.js";
import {
  claimPaymentFulfillment,
  getPaymentFulfillment,
  markPaymentFulfillmentStatus
} from "../../server/services/paymentFulfillments.js";

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function verifySignature(rawBody, signature) {
  if (!process.env.PAYSTACK_SECRET_KEY || !signature) return false;
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

function premiumUntilFromEvent(data = {}) {
  const metadata = data.metadata || {};
  const explicit = metadata.premium_until || metadata.premiumUntil;
  if (explicit) return new Date(explicit).toISOString();
  const days = Number(metadata.days || metadata.plan_days || metadata.planDays || (Number(data.amount || 0) >= 295000 ? 30 : 7));
  return new Date(Date.now() + Math.max(1, Math.min(days, 370)) * 86400000).toISOString();
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

function isFastConnectionProductType(productType) {
  return productType === "quickie" || productType === "fast_connection";
}

function productDetails(data = {}) {
  const metadata = data.metadata || {};
  const productType = String(metadata.product_type || "premium").trim();
  if (isFastConnectionProductType(productType)) {
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

async function fulfillWebhookPurchase({ productType, boostId, email, phone, name, reference, data }) {
  const metadata = data.metadata || {};
  if (isFastConnectionProductType(productType)) {
    const passDays = Math.max(1, Math.round(Number(metadata.quickie_days || 7)));
    const passUntil = new Date(Date.now() + passDays * 86400000).toISOString();
    return activateAppUserFastConnectionPass({
      email,
      phone,
      name,
      passUntil,
      paystackReference: reference
    });
  }

  if (productType === "boost") {
    const city = String(metadata.city || "").trim();
    const durationHours = Math.max(1, Math.round(Number(metadata.duration_hours || 48)));
    if (boostId === "city-spotlight") {
      return activateCitySpotlightPlacement({
        email,
        phone,
        city,
        durationHours: durationHours || 24,
        paystackReference: reference
      });
    }
    if (boostId === "city-boost") {
      return activateCityBoostPlacement({
        email,
        phone,
        city,
        durationHours,
        paystackReference: reference
      });
    }
    return { ok: true, productType, boostId, paystackReference: reference };
  }

  const premiumUntil = premiumUntilFromEvent(data);
  const inviteLink = await createVipInviteLink(email || phone).catch(() => null);
  return activateAppUserPremium({
    email,
    phone,
    name,
    premiumUntil,
    paystackReference: reference,
    inviteLink
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const rawBody = await readRawBody(req);
  if (!verifySignature(rawBody, req.headers["x-paystack-signature"])) {
    return res.status(401).json({ ok: false, error: "Invalid Paystack signature" });
  }

  try {
    const event = JSON.parse(rawBody.toString("utf8"));
    const premiumEvents = new Set(["subscription.create", "charge.success", "invoice.payment_success"]);
    if (!premiumEvents.has(event.event)) {
      return res.status(200).json({ ok: true, ignored: true, event: event.event });
    }

    const data = event.data || {};
    const metadata = data.metadata || {};
    const email = String(data.customer?.email || data.customer_email || metadata.email || "").toLowerCase();
    const phone = normalizePhone(metadata.phone || metadata.phone_number || "");
    const name = String(metadata.name || data.customer?.first_name || "").trim();
    const reference = String(data.reference || metadata.reference || "");
    const { productType, productId, boostId } = productDetails(data);
    const returnPath = normalizeReturnPath(metadata.return_path || metadata.returnPath);
    let activationResult = null;

    const claim = reference
      ? await claimPaymentFulfillment({
          reference,
          userId: metadata.user_id || metadata.userId || null,
          productType,
          productId,
          amountKobo: Number(data.amount || 0),
          currency: String(data.currency || "").trim() || null,
          rawPayload: { source: "webhook", event: event.event, data }
        })
      : null;
    const existing = reference ? claim || (await getPaymentFulfillment(reference)) : null;
    if (existing?.status === "fulfilled") {
      return res.status(200).json({ ok: true, idempotent: true, reference, productType, productId });
    }

    const expectedAmount = Number(metadata.expected_amount_kobo || 0);
    if (expectedAmount > 0 && Number(data.amount || 0) !== expectedAmount) {
      if (reference) {
        await markPaymentFulfillmentStatus(reference, "failed", {
          productType,
          productId,
          amountKobo: Number(data.amount || 0),
          currency: String(data.currency || "").trim() || null,
          rawPayload: { error: "amount_mismatch", expectedAmount }
        });
      }
      return res.status(200).json({ ok: true, ignored: true, reason: "amount_mismatch" });
    }

    await withDbRetry(async () => {
      activationResult = await fulfillWebhookPurchase({
        productType,
        boostId,
        email,
        phone,
        name,
        reference,
        data
      });
      await query(
        `insert into subscription_events (provider, event_type, user_email, user_id, payload)
         values ('paystack', $1, $2, $3, $4)`,
        [event.event, email || null, metadata.user_id || metadata.userId || null, event]
      );
    });

    if (reference) {
      await markPaymentFulfillmentStatus(reference, "fulfilled", {
        productType,
        productId,
        amountKobo: Number(data.amount || 0),
        currency: String(data.currency || "").trim() || null
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

    return res.status(200).json({ ok: true, event: event.event, productType, productId, activation: activationResult });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Paystack webhook failed" });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
