import crypto from "node:crypto";
import { query, withDbRetry } from "../../server/db.js";
import { sendPurchaseConfirmationEmail } from "../../server/services/purchaseEmail.js";
import {
  claimPaymentFulfillment,
  getPaymentFulfillment,
  markPaymentFulfillmentStatus
} from "../../server/services/paymentFulfillments.js";
import {
  assertVerifiedPurchaseAmount,
  fulfillVerifiedPurchase
} from "../../server/services/paymentFortress.js";

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
    const productType = String(metadata.product_type || "premium").trim();
    const productId = String(metadata.product_id || metadata.plan || "monthly").trim();
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

    const amountCheck = await assertVerifiedPurchaseAmount(reference, data, metadata);
    if (!amountCheck.ok) {
      return res.status(200).json({ ok: true, ignored: true, reason: amountCheck.amountCheck?.reason || "amount_mismatch" });
    }

    const intent = amountCheck.intent;

    await withDbRetry(async () => {
      activationResult = await fulfillVerifiedPurchase({
        intent,
        email,
        phone,
        name,
        reference,
        city: metadata.city || "",
        transaction: data
      });
      await query(
        `insert into subscription_events (provider, event_type, user_email, user_id, payload)
         values ('paystack', $1, $2, $3, $4)`,
        [event.event, email || null, metadata.user_id || metadata.userId || null, event]
      );
    });

    if (reference) {
      await markPaymentFulfillmentStatus(reference, "fulfilled", {
        productType: intent.productType,
        productId: intent.productId,
        amountKobo: Number(data.amount || 0),
        currency: String(data.currency || "").trim() || null,
        rawPayload: { purchaseIntent: intent, activation: activationResult }
      });
    }

    if (reference && email) {
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

    return res.status(200).json({
      ok: true,
      event: event.event,
      productType: intent.productType,
      productId: intent.productId,
      activation: activationResult
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Paystack webhook failed" });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
