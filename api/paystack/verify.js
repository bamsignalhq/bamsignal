import { activateAppUserPremium } from "../../server/db.js";
import { getPlatformSetting } from "../../server/db.js";
import { createVipInviteLink } from "../../server/telegram.js";
import { normalizePlan, normalizePlans, planDaysFromAmount } from "../../server/pricing.js";

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

async function loadPricingPlans() {
  const stored = await getPlatformSetting("premium_plans", null);
  return normalizePlans(stored);
}

async function premiumDaysFromTransaction(data) {
  const metadataDays = Number(data?.metadata?.days || data?.metadata?.plan_days || data?.metadata?.planDays);
  if (Number.isFinite(metadataDays) && metadataDays > 0 && metadataDays <= 370) return metadataDays;

  const plans = await loadPricingPlans();
  const amount = Number(data?.amount || 0);
  return planDaysFromAmount(amount, plans);
}

function resolvePlanAmount(body, plans) {
  const configuredAmount = Number(body.amount || 0);
  if (configuredAmount > 0) return Math.round(configuredAmount * 100);

  const planId = String(body.plan || "").trim();
  const byId = plans.find((item) => item.id === planId);
  if (byId) return byId.amountKobo;

  const days = Number(body.days || body.planDays || 30);
  const byDays = plans.find((item) => item.days === days);
  if (byDays) return byDays.amountKobo;

  return normalizePlan(plans[plans.length - 1] || {}).amountKobo;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(503).json({ ok: false, error: "PAYSTACK_SECRET_KEY is not configured." });
  }

  const body = parseBody(req);
  const plans = await loadPricingPlans();

  if (req.query.action === "initialize") {
    const email = String(body.email || "").trim().toLowerCase();
    const phone = normalizePhone(body.phone);
    const name = String(body.name || "").trim();
    const days = Number(body.days || body.planDays || 30);
    const amount = resolvePlanAmount(body, plans);

    if (!email) return res.status(400).json({ ok: false, error: "A verified email is required before Paystack checkout." });
    if (!Number.isFinite(days) || days <= 0 || days > 370) return res.status(400).json({ ok: false, error: "Invalid VIP plan duration." });

    const planMeta = String(body.plan || plans.find((item) => item.days === days)?.id || "monthly");
    const callbackUrl =
      process.env.PAYSTACK_CALLBACK_URL ||
      `${process.env.PUBLIC_APP_URL || "https://bamsignal.com"}/payment/success`;
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
          plan: planMeta
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

    const days = await premiumDaysFromTransaction(transaction);
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
