import { activateAppUserPremium } from "../../server/db.js";
import { createVipInviteLink } from "../../server/telegram.js";

const weeklyThresholdKobo = 95000;
const monthlyThresholdKobo = 295000;

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

function premiumDaysFromTransaction(data) {
  const metadataDays = Number(data?.metadata?.days || data?.metadata?.plan_days || data?.metadata?.planDays);
  if (Number.isFinite(metadataDays) && metadataDays > 0 && metadataDays <= 370) return metadataDays;
  const amount = Number(data?.amount || 0);
  if (amount >= monthlyThresholdKobo) return 30;
  if (amount >= weeklyThresholdKobo) return 7;
  return 0;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(503).json({ ok: false, error: "PAYSTACK_SECRET_KEY is not configured in Vercel." });
  }

  const body = parseBody(req);
  if (req.query.action === "initialize") {
    const email = String(body.email || "").trim().toLowerCase();
    const phone = normalizePhone(body.phone);
    const name = String(body.name || "").trim();
    const days = Number(body.days || body.planDays || 30);
    const configuredAmount = Number(body.amount || 0);
    const amount = configuredAmount > 0
      ? Math.round(configuredAmount * 100)
      : days <= 7
        ? weeklyThresholdKobo
        : monthlyThresholdKobo;

    if (!email) return res.status(400).json({ ok: false, error: "A verified email is required before Paystack checkout." });
    if (!Number.isFinite(days) || days <= 0 || days > 370) return res.status(400).json({ ok: false, error: "Invalid VIP plan duration." });

    const callbackUrl = `${process.env.PUBLIC_APP_URL || "https://bamsignal.com"}/app`;
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        amount,
        callback_url: callbackUrl,
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        metadata: {
          app: "BamSignal",
          name,
          phone,
          days,
          plan_days: days,
          plan: days <= 7 ? "weekly" : "monthly"
        }
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.status) {
      return res.status(502).json({ ok: false, error: payload?.message || "Paystack checkout could not start." });
    }
    return res.status(200).json({
      ok: true,
      reference: payload.data?.reference,
      authorization_url: payload.data?.authorization_url,
      access_code: payload.data?.access_code
    });
  }

  const reference = String(body.reference || body.trxref || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = normalizePhone(body.phone);
  const name = String(body.name || "").trim();
  if (!reference) return res.status(400).json({ ok: false, error: "Payment reference is required." });
  if (!email && !phone) return res.status(400).json({ ok: false, error: "User email or phone number is required." });

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.status) {
      return res.status(502).json({ ok: false, error: payload?.message || "Paystack verification failed." });
    }

    const transaction = payload.data;
    if (transaction?.status !== "success") {
      return res.status(402).json({ ok: false, error: "Payment is not successful yet." });
    }

    const transactionEmail = String(transaction?.customer?.email || transaction?.metadata?.email || "").toLowerCase();
    if (email && transactionEmail && transactionEmail !== email) {
      return res.status(403).json({ ok: false, error: "Payment email does not match this BamSignal account." });
    }

    const days = premiumDaysFromTransaction(transaction);
    if (!days) {
      return res.status(422).json({ ok: false, error: "Payment amount does not match an active VIP plan." });
    }

    const premiumUntil = new Date(Date.now() + days * 86400000).toISOString();
    const inviteLink = await createVipInviteLink(email || phone).catch(() => null);
    const user = await activateAppUserPremium({
      email: email || transactionEmail,
      phone,
      name,
      premiumUntil,
      paystackReference: reference,
      inviteLink
    });

    return res.status(200).json({
      ok: true,
      premium_until: premiumUntil,
      days,
      invite_link: inviteLink,
      user
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Payment verification failed." });
  }
}
