import { activateAppUserPremium, activateAppUserFastConnectionPass } from "../../server/db.js";
import { getPlatformSetting } from "../../server/db.js";
import { activateCityBoostPlacement, activateCitySpotlightPlacement } from "../../server/cityHome.js";
import { createVipInviteLink } from "../../server/telegram.js";
import { normalizePlan, normalizePlans, planDaysFromAmount } from "../../server/pricing.js";
import { config } from "../../server/config.js";
import { PAYSTACK_CHANNELS } from "../../server/paystackChannels.js";
import {
  initializePaystackTransaction,
  paystackConfigured,
  paystackErrorResponse,
  verifyPaystackTransaction
} from "../../server/services/paystackClient.js";
import { sendPurchaseConfirmationEmail, logPaymentInitialized } from "../../server/services/purchaseEmail.js";
import { appendPaymentAudit } from "../../server/services/paymentEvents.js";
import {
  activePlanPrice,
  getProductFromCatalog,
  getSubscriptionCatalog
} from "../../server/services/subscriptionCatalog.js";

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

const APP_RETURN_PREFIXES = ["/home", "/profile", "/settings", "/subscription", "/discover", "/chats", "/signals"];

function normalizePaymentReturnPath(value, fallback = "/home") {
  const raw = String(value || "").trim();
  const fallbackPathname = String(fallback || "").split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const safeFallback = APP_RETURN_PREFIXES.some(
    (path) => fallbackPathname === path || fallbackPathname.startsWith(`${path}/`)
  )
    ? fallback
    : "/home";
  if (!raw || raw === "/" || raw.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(raw)) {
    return safeFallback;
  }
  const pathname = raw.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (APP_RETURN_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return raw.replace(/\/$/, "") || safeFallback;
  }
  return safeFallback;
}

function paymentReturnFrom(metadata = {}, body = {}, fallback = "/home") {
  const returnPath = normalizePaymentReturnPath(
    metadata.return_path || metadata.returnPath || body.returnPath || body.paymentReturnPath,
    fallback
  );
  const sourcePage = normalizePaymentReturnPath(
    metadata.source_page || metadata.sourcePage || body.sourcePage || returnPath,
    returnPath
  );
  return { returnPath, sourcePage };
}

async function logPaymentReturnRedirect({ reference, returnPath, productType, productId, sourcePage }) {
  try {
    await appendPaymentAudit(reference, "payment_return_redirect", {
      returnPath,
      productType,
      productId,
      sourcePage: sourcePage || null,
      source: "verify_response"
    });
  } catch (error) {
    console.error("[paystack] payment return audit failed", {
      reference,
      message: error?.message || String(error)
    });
  }
}

let pricingPlansCache = null;
let pricingPlansCacheAt = 0;

async function loadPricingPlans() {
  const now = Date.now();
  if (pricingPlansCache && now - pricingPlansCacheAt < 60_000) {
    return pricingPlansCache;
  }
  const stored = await getPlatformSetting("premium_plans", null);
  pricingPlansCache = normalizePlans(stored);
  pricingPlansCacheAt = now;
  return pricingPlansCache;
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

async function notifyPurchaseEmail({
  reference,
  email,
  name,
  productType,
  productId,
  amountKobo,
  metadata = {},
  returnPath
}) {
  const firstName = String(name || metadata.name || "").trim().split(/\s+/)[0] || "there";
  try {
    await sendPurchaseConfirmationEmail({
      reference,
      email,
      firstName,
      productType,
      productId,
      amountKobo: Number(amountKobo || 0),
      userId: metadata.user_id || metadata.userId || null,
      returnPath
    });
  } catch (error) {
    console.error("[paystack] purchase email failed", {
      reference,
      message: error?.message || String(error)
    });
  }
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
    const useNativeCallback =
      body.platform === "native" ||
      body.platform === "android" ||
      String(body.callbackPlatform || "").toLowerCase() === "native";
    const callbackUrl = useNativeCallback
      ? config.paystackAndroidCallbackUrl || config.paystackCallbackUrl
      : config.paystackCallbackUrl;

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
      const { returnPath, sourcePage } = paymentReturnFrom({}, body, "/home");
      const reference = buildReference(planMeta);
      const startedAt = Date.now();

      try {
        const data = await initializePaystackTransaction({
          email,
          amount,
          reference,
          callback_url: callbackUrl,
          channels: PAYSTACK_CHANNELS,
          metadata: {
            app: "BamSignal",
            name,
            phone,
            days,
            plan_days: days,
            plan: planMeta,
            product_type: "premium",
            product_id: String(body.productId || planMeta),
            return_path: returnPath,
            source_page: sourcePage
          }
        });

        console.info("[paystack] payment initialized", {
          reference: data?.reference || reference,
          email,
          plan: planMeta,
          amount,
          hasAccessCode: Boolean(data?.access_code),
          ms: Date.now() - startedAt
        });

        await logPaymentInitialized({
          reference: data?.reference || reference,
          userEmail: email,
          productType: "premium",
          productId: String(body.productId || planMeta),
          returnPath
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

      const { returnPath, sourcePage } = paymentReturnFrom({}, body, "/profile");
      const reference = buildReference(boostId);

      try {
        const data = await initializePaystackTransaction({
          email,
          amount,
          reference,
          callback_url: callbackUrl,
          channels: PAYSTACK_CHANNELS,
          metadata: {
            app: "BamSignal",
            name,
            phone,
            city,
            boost_id: boostId,
            duration_hours: durationHours,
            product_type: "boost",
            product_id: String(body.productId || boostId),
            return_path: returnPath,
            source_page: sourcePage
          }
        });

        await logPaymentInitialized({
          reference: data?.reference || reference,
          userEmail: email,
          productType: "boost",
          productId: String(body.productId || boostId),
          returnPath
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

    if (req.query.action === "initialize-quickie") {
      const email = String(body.email || "").trim().toLowerCase();
      const phone = normalizePhone(body.phone);
      const name = String(body.name || "").trim();
      const catalog = await getSubscriptionCatalog();
      const product = getProductFromCatalog(catalog, "fast_connection_pass");
      const weeklyPlan = product?.plans?.find((plan) => plan.id === "weekly" && plan.active !== false);
      const defaultPrice = activePlanPrice(product, "weekly");
      const priceNaira = Math.max(0, Math.round(Number(body.amount || defaultPrice)));
      const passDays = Math.max(1, Math.round(Number(body.days || weeklyPlan?.days || 7)));
      const amount = priceNaira * 100;

      if (!email) {
        return res.status(400).json({ ok: false, error: "A verified email is required before Paystack checkout." });
      }
      if (!priceNaira) {
        return res.status(400).json({ ok: false, error: "Fast Connection Pass pricing is not configured yet." });
      }

      const { returnPath, sourcePage } = paymentReturnFrom({}, body, "/home");
      const reference = buildReference("quickie");

      try {
        const data = await initializePaystackTransaction({
          email,
          amount,
          reference,
          callback_url: callbackUrl,
          channels: PAYSTACK_CHANNELS,
          metadata: {
            app: "BamSignal",
            name,
            phone,
            product_type: "quickie",
            product_id: String(body.productId || "fast-connection-pass"),
            quickie_days: passDays,
            return_path: returnPath,
            source_page: sourcePage
          }
        });

        await logPaymentInitialized({
          reference: data?.reference || reference,
          userEmail: email,
          productType: "quickie",
          productId: String(body.productId || "fast-connection-pass"),
          returnPath
        });

        return res.status(200).json({
          ok: true,
          reference: data?.reference || reference,
          authorization_url: data?.authorization_url,
          access_code: data?.access_code,
          productType: "quickie",
          amount: priceNaira,
          days: passDays
        });
      } catch (error) {
        logPaystackFailure("initialize-quickie", error, { email, amount });
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
      console.info("[paystack] verification started", { reference, email: email || phone });
      transaction = await verifyPaystackTransaction(reference);
    } catch (error) {
      logPaystackFailure("verify", error, { reference });
      const mapped = paystackErrorResponse(error, "Payment verification is unavailable right now.");
      return res.status(mapped.status).json(mapped.body);
    }

    if (transaction?.status !== "success") {
      console.info("[paystack] verification result", { reference, ok: false, status: transaction?.status });
      return res.status(402).json({ ok: false, error: "Payment is not successful yet." });
    }

    console.info("[paystack] verification result", { reference, ok: true, status: transaction.status });

    const transactionEmail = String(transaction?.customer?.email || transaction?.metadata?.email || "").toLowerCase();
    if (email && transactionEmail && transactionEmail !== email) {
      return res.status(403).json({ ok: false, error: "Payment email does not match this BamSignal account." });
    }

    const metadata = transaction?.metadata || {};
    const productType = String(metadata.product_type || body.productType || "premium").trim();
    const { returnPath, sourcePage } = paymentReturnFrom(metadata, body, "/home");

    if (productType === "quickie") {
      const productId = String(metadata.product_id || body.productId || "fast-connection-pass");
      const passDays = Math.max(1, Math.round(Number(metadata.quickie_days || 7)));
      const passUntil = new Date(Date.now() + passDays * 24 * 3600000).toISOString();
      await activateAppUserFastConnectionPass({
        email: email || transactionEmail,
        phone,
        name,
        passUntil,
        paystackReference: reference
      });
      await notifyPurchaseEmail({
        reference,
        email: email || transactionEmail,
        name,
        productType: "quickie",
        productId,
        amountKobo: transaction?.amount,
        metadata,
        returnPath
      });
      await logPaymentReturnRedirect({
        reference,
        returnPath,
        sourcePage,
        productType: "quickie",
        productId
      });
      return res.status(200).json({
        ok: true,
        productType: "quickie",
        productId,
        returnPath,
        sourcePage,
        quickiePassUntil: passUntil,
        fastConnectionPassUntil: passUntil
      });
    }

    if (productType === "boost") {
      const boostId = String(metadata.boost_id || metadata.product_id || body.boostId || body.productId || "city-boost").trim();
      const productId = String(metadata.product_id || boostId);
      const city = String(metadata.city || body.city || "").trim();
      const durationHours = Math.max(
        1,
        Math.round(Number(metadata.duration_hours || body.durationHours || 48))
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
        await notifyPurchaseEmail({
          reference,
          email: email || transactionEmail,
          name,
          productType: "boost",
          productId,
          amountKobo: transaction?.amount,
          metadata,
          returnPath
        });
        await logPaymentReturnRedirect({
          reference,
          returnPath,
          sourcePage,
          productType: "boost",
          productId
        });
        return res.status(200).json({
          ok: true,
          productType: "boost",
          productId,
          returnPath,
          sourcePage,
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
        await notifyPurchaseEmail({
          reference,
          email: email || transactionEmail,
          name,
          productType: "boost",
          productId,
          amountKobo: transaction?.amount,
          metadata,
          returnPath
        });
        await logPaymentReturnRedirect({
          reference,
          returnPath,
          sourcePage,
          productType: "boost",
          productId
        });
        return res.status(200).json({
          ok: true,
          productType: "boost",
          productId,
          returnPath,
          sourcePage,
          boostId,
          city: placement.city,
          expiresAt: placement.expires_at
        });
      }

      await notifyPurchaseEmail({
        reference,
        email: email || transactionEmail,
        name,
        productType: "boost",
        productId,
        amountKobo: transaction?.amount,
        metadata,
        returnPath
      });
      await logPaymentReturnRedirect({
        reference,
        returnPath,
        sourcePage,
        productType: "boost",
        productId
      });
      return res.status(200).json({
        ok: true,
        productType: "boost",
        productId,
        returnPath,
        sourcePage,
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

    const planMeta = String(metadata.plan || metadata.plan_days || days);
    const productId = String(metadata.product_id || body.productId || planMeta);
    await notifyPurchaseEmail({
      reference,
      email: email || transactionEmail,
      name,
      productType: "premium",
      productId,
      amountKobo: transaction?.amount,
      metadata,
      returnPath
    });
    await logPaymentReturnRedirect({
      reference,
      returnPath,
      sourcePage,
      productType: "premium",
      productId
    });

    return res.status(200).json({
      ok: true,
      productType: "premium",
      productId,
      returnPath,
      sourcePage,
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
