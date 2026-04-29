import crypto from "node:crypto";
import express from "express";
import { config } from "../config.js";
import { query, withDbRetry } from "../db.js";
import { createVipInviteLink } from "../telegram.js";

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

async function activatePremium(event) {
  const data = event.data || {};
  const customer = data.customer || {};
  const metadata = data.metadata || {};
  const email = customer.email || data.customer_email || metadata.email;
  const userId = metadata.user_id || metadata.userId;
  const telegramUserId = metadata.telegram_user_id || metadata.telegramUserId;
  const premiumUntil = metadata.premium_until || metadata.premiumUntil || new Date(Date.now() + 30 * 86400000);

  if (!email && !userId) {
    return { ok: false, reason: "No user identifier in Paystack metadata/customer" };
  }

  const inviteLink = await createVipInviteLink(userId || email);

  await withDbRetry(async () => {
    await query(
      `update users
       set is_premium = true,
           premium_until = $1,
           telegram_user_id = coalesce($2, telegram_user_id),
           telegram_vip_invite_link = coalesce($3, telegram_vip_invite_link),
           updated_at = now()
       where ($4::text is not null and id::text = $4::text)
          or ($5::text is not null and email = $5::text)`,
      [premiumUntil, telegramUserId || null, inviteLink, userId || null, email || null]
    );

    await query(
      `insert into subscription_events (provider, event_type, user_email, user_id, payload)
       values ('paystack', $1, $2, $3, $4)`,
      [event.event, email || null, userId || null, event]
    );
  });

  return { ok: true, email, user_id: userId, invite_link: inviteLink };
}

paystackRouter.post("/webhooks/paystack", async (req, res, next) => {
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
});
