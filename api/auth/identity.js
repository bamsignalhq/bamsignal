import {
  deactivatePlatformAdmin,
  findAppUserIdentity,
  getPlatformSetting,
  isPlatformAdminEmail,
  listPlatformAdmins,
  setPlatformSetting,
  upsertAppUserIdentity,
  upsertPlatformAdmin
} from "../../server/db.js";
import { normalizeEmailBranding } from "../../server/services/emailBranding.js";
import { normalizeHomeFeedAds } from "../../server/services/homeFeedAds.js";
import { normalizePlans } from "../../server/pricing.js";
import { registerDevicePush } from "../../server/firebase.js";
import { bot, registerBotCommands } from "../../server/telegram.js";
import { allowedAdminEmails } from "../../server/adminAuth.js";
import { requireAdminConsent } from "../../server/adminConsent.js";

function normalizePhone(value = "") {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234") && digits.length >= 13) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

function normalizePayload(body = {}) {
  return {
    email: String(body.email || "").trim().toLowerCase(),
    phone: normalizePhone(body.phone),
    name: String(body.name || "").trim(),
    referralCode: String(body.referralCode || "").trim().toUpperCase()
  };
}

async function verifySupabaseAdmin(req) {
  const adminEmails = allowedAdminEmails();
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!bearer || !process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) return false;

  const response = await fetch(`${process.env.VITE_SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: process.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${bearer}`
    }
  });
  if (!response.ok) return false;
  const user = await response.json();
  const email = String(user.email || "").toLowerCase();
  return adminEmails.includes(email) || await isPlatformAdminEmail(email);
}

async function requireAdmin(req, res) {
  const allowedSecrets = [process.env.CRON_SECRET].filter(Boolean);
  const provided = req.headers["x-bamsignal-secret"] || req.query.secret || req.body?.secret;
  if (provided && allowedSecrets.includes(provided)) return true;
  if (await verifySupabaseAdmin(req)) return true;
  res.status(401).json({ ok: false, error: "Admin login required." });
  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    if (req.query.action === "telegram-webhook") {
      const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || process.env.CRON_SECRET || "";
      const providedSecret = req.query.secret || req.headers["x-telegram-bot-api-secret-token"];
      if (expectedSecret && providedSecret !== expectedSecret) {
        return res.status(401).json({ ok: false, error: "Invalid Telegram webhook secret." });
      }
      if (!bot) return res.status(503).json({ ok: false, error: "Telegram bot token is not configured." });
      registerBotCommands();
      await bot.handleUpdate(req.body, res);
      if (!res.headersSent) return res.status(200).json({ ok: true });
      return;
    }

    if (req.query.action === "admin-session") {
      if (await requireAdmin(req, res)) return res.status(200).json({ ok: true, method: "admin" });
      return res.status(401).json({ ok: false, error: "Admin login required." });
    }

    if (req.query.action === "settings") {
      const value = await getPlatformSetting("admin_content", null);
      return res.status(200).json({ ok: true, value });
    }

    if (req.query.action === "pricing") {
      const stored = await getPlatformSetting("premium_plans", null);
      const plans = normalizePlans(stored);
      return res.status(200).json({ ok: true, plans });
    }

    if (req.query.action === "pricing-save") {
      if (!await requireAdmin(req, res)) return;
      if (!await requireAdminConsent(req, res)) return;
      const plans = normalizePlans(req.body?.plans || []);
      const value = await setPlatformSetting("premium_plans", plans);
      return res.status(200).json({ ok: true, plans: value });
    }

    if (req.query.action === "subscription-catalog") {
      const { getSubscriptionCatalog } = await import("../../server/services/subscriptionCatalog.js");
      const catalog = await getSubscriptionCatalog();
      return res.status(200).json({ ok: true, catalog });
    }

    if (req.query.action === "subscription-catalog-save") {
      if (!await requireAdmin(req, res)) return;
      if (!await requireAdminConsent(req, res)) return;
      const { saveSubscriptionCatalog } = await import("../../server/services/subscriptionCatalog.js");
      const catalog = await saveSubscriptionCatalog(req.body?.catalog || {});
      return res.status(200).json({ ok: true, catalog });
    }

    if (req.query.action === "contact-exchange-metrics") {
      if (!await requireAdmin(req, res)) return;
      const { listContactExchangeMetrics } = await import("../../server/services/contactExchange.js");
      const metrics = await listContactExchangeMetrics({ limit: Number(req.body?.limit) || 100 });
      return res.status(200).json({ ok: true, metrics });
    }

    if (req.query.action === "settings-save") {
      if (!await requireAdmin(req, res)) return;
      if (!await requireAdminConsent(req, res)) return;
      const value = await setPlatformSetting("admin_content", req.body?.value || {});
      return res.status(200).json({ ok: true, value });
    }

    if (req.query.action === "email-branding") {
      const value = await getPlatformSetting("email_branding", null);
      return res.status(200).json({ ok: true, value: normalizeEmailBranding(value) });
    }

    if (req.query.action === "email-branding-save") {
      if (!await requireAdmin(req, res)) return;
      if (!await requireAdminConsent(req, res)) return;
      const value = await setPlatformSetting("email_branding", normalizeEmailBranding(req.body?.value || {}));
      return res.status(200).json({ ok: true, value });
    }

    if (req.query.action === "home-feed-ads") {
      const stored = await getPlatformSetting("home_feed_ads", null);
      return res.status(200).json({ ok: true, value: normalizeHomeFeedAds(stored) });
    }

    if (req.query.action === "home-feed-ads-save") {
      if (!await requireAdmin(req, res)) return;
      if (!await requireAdminConsent(req, res)) return;
      const value = await setPlatformSetting("home_feed_ads", normalizeHomeFeedAds(req.body?.value || {}));
      return res.status(200).json({ ok: true, value });
    }

    if (req.query.action === "admin-security") {
      if (!await requireAdmin(req, res)) return;
      return res.status(200).json({
        ok: true,
        envAdmins: allowedAdminEmails(),
        dbAdmins: await listPlatformAdmins()
      });
    }

    if (req.query.action === "admin-add") {
      if (!await requireAdmin(req, res)) return;
      if (!await requireAdminConsent(req, res)) return;
      const admin = await upsertPlatformAdmin(req.body?.email, req.body?.role || "admin");
      return res.status(200).json({ ok: true, admin, dbAdmins: await listPlatformAdmins() });
    }

    if (req.query.action === "admin-remove") {
      if (!await requireAdmin(req, res)) return;
      if (!await requireAdminConsent(req, res)) return;
      const admin = await deactivatePlatformAdmin(req.body?.email);
      return res.status(200).json({ ok: true, admin, dbAdmins: await listPlatformAdmins() });
    }

    const identity = normalizePayload(req.body);
    if (!identity.email && !identity.phone) {
      return res.status(400).json({ ok: false, error: "Email or phone number is required" });
    }

    if (req.query.action === "status") {
      const user = await findAppUserIdentity(identity);
      return res.status(200).json({ ok: true, user });
    }

    if (req.query.action === "push-token") {
      const token = String(req.body?.token || "").trim();
      if (!token) return res.status(400).json({ ok: false, error: "Push token is required" });
      const user = await findAppUserIdentity(identity);
      const premiumUntil = user?.premium_until ? new Date(user.premium_until).getTime() : 0;
      const isPremium = Boolean(user?.is_premium && premiumUntil > Date.now());
      const registration = await registerDevicePush({ token, isPremium });
      return res.status(200).json({ ok: true, is_premium: isPremium, registration });
    }

    if (req.query.action === "register") {
      const existing = await findAppUserIdentity(identity);
      const emailTaken = existing?.email && identity.email && existing.email.toLowerCase() !== identity.email.toLowerCase();
      const phoneTaken = existing?.phone && identity.phone && existing.phone !== identity.phone;
      if (emailTaken || phoneTaken) {
        return res.status(409).json({
          ok: false,
          exists: true,
          field: emailTaken ? "email" : "phone",
          error: `${emailTaken ? "Email" : "Phone number"} is already in use. Login instead.`
        });
      }
      const user = await upsertAppUserIdentity(identity);
      return res.status(200).json({ ok: true, user });
    }

    const existing = await findAppUserIdentity(identity);
    if (!existing) return res.status(200).json({ ok: true, exists: false });

    const field = identity.email && existing.email?.toLowerCase() === identity.email ? "email" : "phone";
    return res.status(200).json({ ok: true, exists: true, field });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Identity check failed" });
  }
}
