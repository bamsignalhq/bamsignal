import {
  deactivatePlatformAdmin,
  findAppUserIdentity,
  getPlatformSetting,
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
import { allowedAdminEmails, requireAdmin } from "../../server/adminAuth.js";
import { requireAdminConsent } from "../../server/adminConsent.js";
import { requireMemberAuth } from "../../server/services/memberAuth.js";
import {
  GENERIC_NOT_AVAILABLE,
  GENERIC_NOT_AUTHORIZED,
  logIdentityExposureBlocked,
  sendGenericNotAvailable
} from "../../server/services/identityExposure.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

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

async function requireMemberIdentity(req, res, body = {}) {
  const authResult = await requireMemberAuth(req, body);
  if (!authResult.ok) {
    logIdentityExposureBlocked({ endpoint: "identity", action: String(req.query.action || "") });
    res.status(authResult.status || 401).json({ ok: false, error: GENERIC_NOT_AUTHORIZED });
    return null;
  }
  return authResult.identity;
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

    if (req.query.action === "operator-logout") {
      if (!(await requireAdmin(req, res))) return;
      try {
        const { getAdminEmailFromRequest } = await import("../../server/adminConsent.js");
        const operatorEmail = await getAdminEmailFromRequest(req);
        if (operatorEmail) {
          const { writeAuditLog } = await import("../../server/services/auditLog.js");
          const forwarded = req.headers["x-forwarded-for"];
          const ip =
            typeof forwarded === "string" && forwarded.length
              ? forwarded.split(",")[0].trim()
              : req.socket?.remoteAddress || null;
          await writeAuditLog({
            operatorId: operatorEmail,
            action: "operator_logout",
            details: {},
            ip,
            userAgent: String(req.headers["user-agent"] || "").slice(0, 512) || null
          });
        }
      } catch {
        /* best effort */
      }
      return res.status(200).json({ ok: true });
    }

    if (req.query.action === "admin-session") {
      if (await requireAdmin(req, res)) {
        try {
          const { getAdminEmailFromRequest } = await import("../../server/adminConsent.js");
          const operatorEmail = await getAdminEmailFromRequest(req);
          if (operatorEmail) {
            const { writeAuditLog } = await import("../../server/services/auditLog.js");
            const forwarded = req.headers["x-forwarded-for"];
            const ip =
              typeof forwarded === "string" && forwarded.length
                ? forwarded.split(",")[0].trim()
                : req.socket?.remoteAddress || null;
            await writeAuditLog({
              operatorId: operatorEmail,
              action: "operator_login",
              details: {},
              ip,
              userAgent: String(req.headers["user-agent"] || "").slice(0, 512) || null
            });
          }
        } catch {
          /* best effort */
        }
        return res.status(200).json({ ok: true });
      }
      return;
    }

    if (req.query.action === "settings") {
      if (!(await requireAdmin(req, res))) return;
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

    if (req.query.action === "audit-trail") {
      if (!await requireAdmin(req, res)) return;
      const { listPlatformAudit } = await import("../../server/services/auditTrail.js");
      const rows = await listPlatformAudit({
        limit: Number(req.body?.limit) || 100,
        action: req.body?.action || null,
        operatorEmail: req.body?.operatorEmail || null,
        targetUserKey: req.body?.targetUserKey || null
      });
      return res.status(200).json({ ok: true, rows });
    }

    if (req.query.action === "audit-trail-export") {
      if (!await requireAdmin(req, res)) return;
      if (!await requireAdminConsent(req, res)) return;
      const { listPlatformAudit, auditCsvRows } = await import("../../server/services/auditTrail.js");
      const rows = await listPlatformAudit({ limit: Number(req.body?.limit) || 500 });
      return res.status(200).json({ ok: true, csv: auditCsvRows(rows) });
    }

    if (req.query.action === "spam-suspects") {
      if (!await requireAdmin(req, res)) return;
      const { listSpamSuspects } = await import("../../server/services/spamDetection.js");
      const suspects = await listSpamSuspects({ limit: Number(req.body?.limit) || 50 });
      return res.status(200).json({ ok: true, suspects });
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
      const memberIdentity = await requireMemberIdentity(req, res, req.body);
      if (!memberIdentity) return;
      const user = await findAppUserIdentity(memberIdentity);
      return res.status(200).json({ ok: true, user });
    }

    if (req.query.action === "push-token") {
      const memberIdentity = await requireMemberIdentity(req, res, req.body);
      if (!memberIdentity) return;
      const token = String(req.body?.token || "").trim();
      if (!token) return res.status(400).json({ ok: false, error: "Push token is required" });
      const user = await findAppUserIdentity(memberIdentity);
      const premiumUntil = user?.premium_until ? new Date(user.premium_until).getTime() : 0;
      const isPremium = Boolean(user?.is_premium && premiumUntil > Date.now());
      const registration = await registerDevicePush({ token, isPremium });
      return res.status(200).json({ ok: true, registration });
    }

    if (req.query.action === "register") {
      const memberIdentity = await requireMemberIdentity(req, res, req.body);
      if (!memberIdentity) return;
      const existing = await findAppUserIdentity(memberIdentity);
      const emailTaken =
        existing?.email &&
        memberIdentity.email &&
        existing.email.toLowerCase() !== memberIdentity.email.toLowerCase();
      const phoneTaken =
        existing?.phone &&
        memberIdentity.phone &&
        existing.phone !== memberIdentity.phone;
      if (emailTaken || phoneTaken) {
        logIdentityExposureBlocked({ endpoint: "identity", action: "register", reason: "conflict" });
        return res.status(409).json({ ok: false, error: GENERIC_NOT_AVAILABLE });
      }
      const user = await upsertAppUserIdentity({ ...memberIdentity, ...identity });
      return res.status(200).json({ ok: true, user });
    }

    logIdentityExposureBlocked({ endpoint: "identity", action: "exists-check" });
    return sendGenericNotAvailable(res);
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "identity_request_failed",
      error,
      status: 500,
      message: "Identity check failed.",
      context: { action: String(req.query.action || "") || "unknown" }
    });
  }
}
