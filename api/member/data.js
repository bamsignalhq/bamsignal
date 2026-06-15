import {
  fetchMemberBundle,
  findAppUserIdentity,
  getDatabaseStatus,
  persistReport,
  upsertAppUserIdentity
} from "../../server/db.js";
import { upsertMemberProfile } from "../../server/cityHome.js";
import {
  acceptIncomingSignal,
  completeOnboardingReferral,
  declineIncomingSignal,
  fetchIncomingSignals,
  fetchPremiumStatus,
  fetchProfileVisitors,
  fetchReferralStats,
  getMemberProfileById,
  listDiscoverProfiles,
  registerWithReferral,
  sendSignalToProfile
} from "../../server/memberSocial.js";

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

function normalizeIdentity(body = {}) {
  return {
    email: String(body.email || "").trim().toLowerCase(),
    phone: normalizePhone(body.phone),
    name: String(body.name || "").trim()
  };
}

function requireDatabase(res) {
  const database = getDatabaseStatus();
  if (database !== "connected") {
    res.status(503).json({
      ok: false,
      error: "Database is not connected.",
      database
    });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parseBody(req);
  const identity = normalizeIdentity(body);

  if (!identity.email && !identity.phone) {
    return res.status(400).json({ ok: false, error: "Email or phone is required." });
  }

  try {
    if (req.query.action === "pull") {
      if (!requireDatabase(res)) return;
      const bundle = await fetchMemberBundle(identity);
      return res.status(200).json({ ok: true, database: "connected", bundle });
    }

    if (req.query.action === "register") {
      if (!requireDatabase(res)) return;
      const user = body.referralCode
        ? await registerWithReferral({ ...identity, referralCode: body.referralCode })
        : await upsertAppUserIdentity(identity);
      return res.status(200).json({ ok: true, user });
    }

    if (req.query.action === "status") {
      if (!requireDatabase(res)) return;
      const user = await findAppUserIdentity(identity);
      const premium = await fetchPremiumStatus(identity);
      return res.status(200).json({ ok: true, user, premium });
    }

    if (req.query.action === "discover") {
      if (!requireDatabase(res)) return;
      const city = String(body.city || "").trim();
      if (!city) return res.status(400).json({ ok: false, error: "City is required." });
      const profiles = await listDiscoverProfiles({
        email: identity.email,
        phone: identity.phone,
        city,
        excludeProfileIds: Array.isArray(body.excludeProfileIds) ? body.excludeProfileIds : [],
        limit: Number(body.limit) || 48
      });
      return res.status(200).json({ ok: true, profiles });
    }

    if (req.query.action === "profile-by-id") {
      if (!requireDatabase(res)) return;
      const profile = await getMemberProfileById(String(body.profileId || "").trim());
      return res.status(200).json({ ok: Boolean(profile), profile });
    }

    if (req.query.action === "incoming") {
      if (!requireDatabase(res)) return;
      const incomingSignals = await fetchIncomingSignals(identity);
      return res.status(200).json({ ok: true, incomingSignals });
    }

    if (req.query.action === "visitors") {
      if (!requireDatabase(res)) return;
      const viewers = await fetchProfileVisitors(identity);
      return res.status(200).json({ ok: true, viewers });
    }

    if (req.query.action === "referral") {
      if (!requireDatabase(res)) return;
      const referral = await fetchReferralStats(identity);
      return res.status(200).json({ ok: true, referral });
    }

    if (req.query.action === "signal") {
      if (!requireDatabase(res)) return;
      const row = await sendSignalToProfile({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || "").trim(),
        signalType: String(body.signalType || "signal"),
        payload: body.payload || {}
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), signal: row });
    }

    if (req.query.action === "accept-signal") {
      if (!requireDatabase(res)) return;
      const result = await acceptIncomingSignal({
        email: identity.email,
        phone: identity.phone,
        signalId: String(body.signalId || "").trim()
      });
      return res.status(result ? 200 : 404).json({ ok: Boolean(result), ...result });
    }

    if (req.query.action === "decline-signal") {
      if (!requireDatabase(res)) return;
      const ok = await declineIncomingSignal({
        email: identity.email,
        phone: identity.phone,
        signalId: String(body.signalId || "").trim()
      });
      return res.status(ok ? 200 : 404).json({ ok });
    }

    if (req.query.action === "complete-onboarding") {
      if (!requireDatabase(res)) return;
      const result = await completeOnboardingReferral(identity);
      const referral = await fetchReferralStats(identity);
      return res.status(200).json({ ok: true, result, referral });
    }

    if (req.query.action === "match") {
      if (!requireDatabase(res)) return;
      const { persistMatch } = await import("../../server/db.js");
      const row = await persistMatch({
        email: identity.email,
        phone: identity.phone,
        match: body.match
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), match: row });
    }

    if (req.query.action === "message") {
      if (!requireDatabase(res)) return;
      const { persistMessage } = await import("../../server/db.js");
      const row = await persistMessage({
        email: identity.email,
        phone: identity.phone,
        threadId: String(body.threadId || "").trim(),
        message: body.message,
        threadMeta: body.threadMeta || {}
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), message: row });
    }

    if (req.query.action === "report") {
      if (!requireDatabase(res)) return;
      const row = await persistReport({
        email: identity.email,
        phone: identity.phone,
        report: body.report
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), report: row });
    }

    if (req.query.action === "profile") {
      if (!requireDatabase(res)) return;
      const city = String(body.city || body.profile?.city || "").trim();
      if (!city) {
        return res.status(400).json({ ok: false, error: "City is required for profile sync." });
      }

      const row = await upsertMemberProfile({
        email: identity.email,
        phone: identity.phone,
        name: identity.name || body.name,
        username: String(body.username || "").trim() || null,
        city,
        state: String(body.state || body.profile?.state || "").trim() || null,
        profile: body.profile || {},
        discoverable: body.discoverable !== false,
        onboardingComplete: Boolean(body.onboardingComplete ?? body.profile?.onboardingComplete),
        cityHomeHidden: Boolean(body.cityHomeHidden)
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), profile: row });
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Member data request failed." });
  }
}
