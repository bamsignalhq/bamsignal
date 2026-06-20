import crypto from "node:crypto";
import { query, withDbRetry } from "../../server/db.js";
import {
  completePaymentFulfillment
} from "../../server/services/paymentFortress.js";
import {
  PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE,
  isPaymentDatabaseError,
  paymentHttpStatusForError
} from "../../server/services/paymentDb.js";

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
    const returnPath = normalizeReturnPath(metadata.return_path || metadata.returnPath);

    if (!email && !phone) {
      return res.status(422).json({ ok: false, error: "No user identifier in Paystack metadata/customer" });
    }
    if (!reference) {
      return res.status(422).json({ ok: false, error: "Payment reference is required." });
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
        ledgerSource: "webhook"
      });

      if (result.ok) {
        await query(
          `insert into subscription_events (provider, event_type, user_email, user_id, payload)
           values ('paystack', $1, $2, $3, $4)`,
          [event.event, email || null, metadata.user_id || metadata.userId || null, event]
        );
      }
    });

    if (!result?.ok) {
      if (result?.status === 422 && /amount/i.test(String(result.error || ""))) {
        return res.status(200).json({ ok: true, ignored: true, reason: "amount_mismatch" });
      }
      return res.status(result?.status || 422).json({ ok: false, error: result?.error || "Unable to fulfill purchase." });
    }

    return res.status(200).json({
      ok: true,
      idempotent: Boolean(result.idempotent),
      event: event.event,
      productType: result.productType,
      productId: result.productId,
      activation: result.activation || null
    });
  } catch (error) {
    if (isPaymentDatabaseError(error)) {
      console.error("[paystack webhook] persistence unavailable", error?.message || error);
      return res.status(503).json({ ok: false, error: PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE });
    }
    return res.status(paymentHttpStatusForError(error)).json({
      ok: false,
      error: error.message || "Paystack webhook failed"
    });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
