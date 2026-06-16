import { requireAdmin } from "../../server/adminAuth.js";
import { requireAdminConsent, getAdminEmailFromRequest } from "../../server/adminConsent.js";
import { getDatabaseStatus } from "../../server/db.js";
import {
  applyShadowBan,
  canModerateMembers,
  liftShadowBan,
  listShadowBannedUsers
} from "../../server/services/moderation.js";

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

async function requireModerationAdmin(req, res) {
  if (!(await requireAdmin(req, res))) return null;
  const operatorEmail = await getAdminEmailFromRequest(req);
  if (!operatorEmail || !(await canModerateMembers(operatorEmail))) {
    res.status(403).json({ ok: false, error: "Moderation permission required." });
    return null;
  }
  return operatorEmail;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(503).json({ ok: false, error: "Database is not connected.", database });
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "").trim();

  try {
    if (action === "list-shadow-banned") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;

      const users = await listShadowBannedUsers();
      return res.status(200).json({ ok: true, users, count: users.length });
    }

    if (action === "lift-shadow-ban") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      if (!(await requireAdminConsent(req, res))) return;

      const profileId = String(body.profileId || "").trim();
      const reason = String(body.reason || "").trim();
      const result = await liftShadowBan({ profileId, operatorEmail, reason });
      if (!result.ok) {
        return res.status(400).json(result);
      }
      return res.status(200).json({
        ok: true,
        message: "User visibility restored.",
        profile: result.profile
      });
    }

    if (action === "shadow-ban") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      if (!(await requireAdminConsent(req, res))) return;

      const profileId = String(body.profileId || "").trim();
      const reason = String(body.reason || "").trim() || "Shadow ban applied by operator.";
      const result = await applyShadowBan({
        profileId,
        operatorEmail,
        reason,
        moderationNotes: body.moderationNotes || null
      });
      if (!result.ok) {
        return res.status(400).json(result);
      }
      return res.status(200).json({ ok: true, profile: result.profile });
    }

    if (action === "list-flags") {
      const operatorEmail = await requireModerationAdmin(req, res);
      if (!operatorEmail) return;
      const { listModerationFlags } = await import("../../server/memberTrust.js");
      const flags = await listModerationFlags({ limit: Number(body.limit) || 50 });
      return res.status(200).json({ ok: true, flags, count: flags.length });
    }

    return res.status(400).json({
      ok: false,
      error: "Unknown action. Use list-shadow-banned, lift-shadow-ban, or shadow-ban."
    });
  } catch (error) {
    console.error("[bamsignal] admin moderation error:", error);
    return res.status(500).json({ ok: false, error: error.message || "Moderation request failed." });
  }
}
