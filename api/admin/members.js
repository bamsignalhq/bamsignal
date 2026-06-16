import { requireAdmin } from "../../server/adminAuth.js";
import { requireAdminConsent } from "../../server/adminConsent.js";
import { getDatabaseStatus } from "../../server/db.js";
import {
  adminSearchMembers,
  purgeMemberCompletely
} from "../../server/services/adminMemberPurge.js";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!(await requireAdmin(req, res))) return;

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(503).json({ ok: false, error: "Database is not connected.", database });
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "").trim();

  try {
    if (action === "search") {
      const q = String(body.q || body.query || "").trim();
      if (q.length < 2) {
        return res.status(400).json({ ok: false, error: "Enter at least 2 characters to search." });
      }
      const members = await adminSearchMembers(q, body.limit);
      return res.status(200).json({ ok: true, members });
    }

    if (action === "purge") {
      if (!(await requireAdminConsent(req, res))) return;
      const confirm = String(body.confirm || "").trim().toUpperCase();
      if (confirm !== "DELETE") {
        return res.status(400).json({
          ok: false,
          error: 'Type DELETE in the confirm field to permanently remove this member.'
        });
      }

      const result = await purgeMemberCompletely({
        profileId: body.profileId,
        email: body.email,
        phone: body.phone,
        username: body.username,
        query: body.q || body.query
      });

      if (!result.ok) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action. Use search or purge." });
  } catch (error) {
    console.error("[bamsignal] admin members error:", error);
    return res.status(500).json({ ok: false, error: error.message || "Admin member request failed." });
  }
}
