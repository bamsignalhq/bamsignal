import {
  fetchMemberBundle,
  findAppUserIdentity,
  getDatabaseStatus,
  persistMatch,
  persistMessage,
  persistReport,
  persistSignal,
  upsertAppUserIdentity
} from "../../server/db.js";
import { upsertMemberProfile } from "../../server/cityHome.js";

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

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(503).json({
      ok: false,
      error: "Database is not connected.",
      database
    });
  }

  try {
    if (req.query.action === "pull") {
      const bundle = await fetchMemberBundle(identity);
      return res.status(200).json({ ok: true, database, bundle });
    }

    if (req.query.action === "register") {
      const user = await upsertAppUserIdentity(identity);
      return res.status(200).json({ ok: true, user });
    }

    if (req.query.action === "status") {
      const user = await findAppUserIdentity(identity);
      return res.status(200).json({ ok: true, user });
    }

    if (req.query.action === "signal") {
      const row = await persistSignal({
        email: identity.email,
        phone: identity.phone,
        targetProfileId: String(body.targetProfileId || "").trim(),
        signalType: String(body.signalType || "signal"),
        payload: body.payload || {}
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), signal: row });
    }

    if (req.query.action === "match") {
      const row = await persistMatch({
        email: identity.email,
        phone: identity.phone,
        match: body.match
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), match: row });
    }

    if (req.query.action === "message") {
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
      const row = await persistReport({
        email: identity.email,
        phone: identity.phone,
        report: body.report
      });
      return res.status(row ? 200 : 503).json({ ok: Boolean(row), report: row });
    }

    if (req.query.action === "profile") {
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
