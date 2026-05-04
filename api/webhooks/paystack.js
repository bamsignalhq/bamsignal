import crypto from "node:crypto";
import { activateAppUserPremium, query, withDbRetry } from "../../server/db.js";
import { createVipInviteLink } from "../../server/telegram.js";

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
    const phone = String(metadata.phone || metadata.phone_number || "").replace(/\D/g, "").replace(/^234/, "");
    const name = String(metadata.name || data.customer?.first_name || "").trim();
    const reference = String(data.reference || metadata.reference || "");
    const premiumUntil = premiumUntilFromEvent(data);
    const inviteLink = await createVipInviteLink(email || phone).catch(() => null);

    await withDbRetry(async () => {
      await activateAppUserPremium({
        email,
        phone,
        name,
        premiumUntil,
        paystackReference: reference,
        inviteLink
      });
      await query(
        `insert into subscription_events (provider, event_type, user_email, user_id, payload)
         values ('paystack', $1, $2, $3, $4)`,
        [event.event, email || null, metadata.user_id || metadata.userId || null, event]
      );
    });

    return res.status(200).json({ ok: true, event: event.event, premium_until: premiumUntil });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Paystack webhook failed" });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
