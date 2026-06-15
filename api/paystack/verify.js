import { activateAppUserPremium } from "../../server/db.js";
import { getPlatformSetting } from "../../server/db.js";
import { activateCityBoostPlacement, activateCitySpotlightPlacement } from "../../server/cityHome.js";
import { createVipInviteLink } from "../../server/telegram.js";
import { normalizePlan, normalizePlans, planDaysFromAmount } from "../../server/pricing.js";
import { config } from "../../server/config.js";
import {
  initializePaystackTransaction,
  paystackConfigured,
  paystackErrorResponse,
  verifyPaystackTransaction
} from "../../server/services/paystackClient.js";

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

function buildReference(prefix) {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `bs_${prefix}_${stamp}_${random}`.slice(0, 64);
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

function logPaystackFailure(scope, error, extra = {}) {
  console.error(`[paystack] ${scope} failed`, {
    code: error?.code,
    message: error?.message,
    upstreamStatus: error?.upstreamStatus,
    ...extra
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    if (!paystackConfigured()) {
      return res.status(503).json({ ok: false, error: "PAYSTACK_SECRET_KEY is not configured." });
    }

    const body = parseBody(req);
    const plans = await loadPricingPlans();
    const callbackUrl = config.paystackCallbackUrl;

    if (req.query.action === "initialize") {
      const email = String(body.email || "").trim().toLowerCase();
      const phone = normalizePhone(body.phone);
      const name = String(body.name || "").trim();
      const days = Number(body.days || body.planDays || 30);
      const amount = resolvePlanAmount(body, plans);

      if (!email) {
        return res.status(400).json({ ok: false, error: "A verified email is required before Paystack checkout." });
      }
      if (!Number.isFinite(days) || days <= 0 || days > 370) {
        return res.status(400).json({ ok: false, error: "Invalid VIP plan duration." });
      }

      const planMeta = String(body.plan || plans.find((item) => item.days === days)?.id || "monthly");
      const reference = buildReference(planMeta);

      try {
        const data = await initializePaystackTransaction({
          email,
          amount,
          reference,
          callback_url: callbackUrl,
          channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
          metadata: {
            app: "BamSignal",
            name,
            phone,
            days,
            plan_days: days,
            plan: planMeta,
            product_type: "premium"
          }
        });

        return res.status(200).json({
          ok: true,
          reference: data?.reference || reference,
          authorization_url: data?.authorization_url,
          access_code: data?.access_code
        });
      } catch (error) {
        logPaystackFailure("initialize", error, { email, plan: planMeta, amount });
        const mapped = paystackErrorResponse(error, "Unable to start payment. Please try again shortly.");
        return res.status(mapped.status).json(mapped.body);
      }
    }

    if (req.query.action === "initialize-boost") {
      const email = String(body.email || "").trim().toLowerCase();
      const phone = normalizePhone(body.phone);
      const name = String(body.name || "").trim();
      const boostId = String(body.boostId || body.product || "city-boost").trim();
      const city = String(body.city || "Lagos").trim();
      const priceNaira = Math.max(0, Math.round(Number(body.amount || body.price || 600)));
      const amount = priceNaira * 100;
      const durationHours = Math.max(1, Math.round(Number(body.durationHours || 48)));

      if (!email) {
        return res.status(400).json({ ok: false, error: "A verified email is required before Paystack checkout." });
      }
      if (!amount) {
        return res.status(400).json({ ok: false, error: "Invalid boost price." });
      }

      const reference = buildReference(boostId);

      try {
        const data = await initializePaystackTransaction({
          email,
          amount,
          reference,
          callback_url: callbackUrl,
          channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
          metadata: {
            app: "BamSignal",
            name,
            phone,
            city,
            boost_id: boostId,
            duration_hours: durationHours,
            product_type: "boost"
          }
        });

        return res.status(200).json({
          ok: true,
          reference: data?.reference || reference,
          authorization_url: data?.authorization_url,
          access_code: data?.access_code,
          productType: "boost",
          boostId
        });
      } catch (error) {
        logPaystackFailure("initialize-boost", error, { email, boostId, amount });
        const mapped = paystackErrorResponse(error, "Unable to start payment. Please try again shortly.");
        return res.status(mapped.status).json(mapped.body);
      }
    }

    const reference = String(body.reference || body.trxref || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = normalizePhone(body.phone);
    const name = String(body.name || "").trim();
    if (!reference) return res.status(400).json({ ok: false, error: "Payment reference is required." });
    if (!email && !phone) {
      return res.status(400).json({ ok: false, error: "User email or phone number is required." });
    }

    let transaction;
    try {
      transaction = await verifyPaystackTransaction(reference);
    } catch (error) {
      logPaystackFailure("verify", error, { reference });
      const mapped = paystackErrorResponse(error, "Payment verification is unavailable right now.");
      return res.status(mapped.status).json(mapped.body);
    }

    if (transaction?.status !== "success") {
      return res.status(402).json({ ok: false, error: "Payment is not successful yet." });
    }

    const transactionEmail = String(transaction?.customer?.email || transaction?.metadata?.email || "").toLowerCase();
    if (email && transactionEmail && transactionEmail !== email) {
      return res.status(403).json({ ok: false, error: "Payment email does not match this BamSignal account." });
    }

    const productType = String(transaction?.metadata?.product_type || body.productType || "premium").trim();

    if (productType === "boost") {
      const boostId = String(transaction?.metadata?.boost_id || body.boostId || "city-boost").trim();
      const city = String(transaction?.metadata?.city || body.city || "").trim();
      const durationHours = Math.max(
        1,
        Math.round(Number(transaction?.metadata?.duration_hours || body.durationHours || 48))
      );

      const allowedBoosts = new Set([
        "city-spotlight",
        "city-boost",
        "signal-boost",
        "profile-boost",
        "priority-signal-once"
      ]);
      if (!allowedBoosts.has(boostId)) {
        return res.status(422).json({ ok: false, error: "Unknown boost product." });
      }

      if (boostId === "city-spotlight") {
        const placement = await activateCitySpotlightPlacement({
          email: email || transactionEmail,
          phone,
          city,
          durationHours: durationHours || 24,
          paystackReference: reference
        });
        if (!placement) {
          return res.status(422).json({
            ok: false,
            error: "Complete onboarding in your city before buying City Spotlight."
          });
        }
        return res.status(200).json({
          ok: true,
          productType: "boost",
          boostId,
          city: placement.city,
          expiresAt: placement.expires_at
        });
      }

      if (boostId === "city-boost") {
        const placement = await activateCityBoostPlacement({
          email: email || transactionEmail,
          phone,
          city,
          durationHours,
          paystackReference: reference
        });
        if (!placement) {
          return res.status(422).json({
            ok: false,
            error: "Complete onboarding in your city before buying a City Boost."
          });
        }
        return res.status(200).json({
          ok: true,
          productType: "boost",
          boostId,
          city: placement.city,
          expiresAt: placement.expires_at
        });
      }

      return res.status(200).json({
        ok: true,
        productType: "boost",
        boostId,
        expiresAt: new Date(Date.now() + durationHours * 3600000).toISOString()
      });
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
    logPaystackFailure("handler", error);
    return res.status(500).json({ ok: false, error: error.message || "Payment request failed." });
  }
}
