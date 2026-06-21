import { requireAdmin } from "../../server/adminAuth.js";
import { requireAdminConsent } from "../../server/adminConsent.js";
import { getDatabaseStatus } from "../../server/db.js";
import {
  adminSearchMembers,
  purgeMemberCompletely
} from "../../server/services/adminMemberPurge.js";
import {
  fetchMemberAuditTrailAdmin,
  fetchMemberComplianceAdmin
} from "../../server/services/memberCompliance.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

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

    if (action === "compliance") {
      const profileId = String(body.profileId || "").trim();
      if (!profileId) {
        return res.status(400).json({ ok: false, error: "profileId is required." });
      }
      const compliance = await fetchMemberComplianceAdmin(profileId);
      if (!compliance) {
        return res.status(404).json({ ok: false, error: "Member not found." });
      }
      return res.status(200).json({ ok: true, compliance });
    }

    if (action === "audit-trail") {
      const profileId = String(body.profileId || "").trim();
      if (!profileId) {
        return res.status(400).json({ ok: false, error: "profileId is required." });
      }
      const rows = await fetchMemberAuditTrailAdmin(profileId, Number(body.limit) || 100);
      return res.status(200).json({ ok: true, rows });
    }

    if (action === "repair-onboarding") {
      const profileId = String(body.profileId || "").trim();
      if (!profileId) {
        return res.status(400).json({ ok: false, error: "profileId is required." });
      }
      const { repairMemberOnboardingByProfileId } = await import(
        "../../server/services/onboardingRepair.js"
      );
      const result = await repairMemberOnboardingByProfileId(profileId);
      if (!result.ok) {
        return res.status(result.error === "Member not found." ? 404 : 400).json(result);
      }
      return res.status(200).json(result);
    }

    if (action === "reset-pin") {
      if (!(await requireAdminConsent(req, res))) return;
      const username = String(body.username || "").trim();
      const newPin = body.newPin != null ? String(body.newPin) : body.pin != null ? String(body.pin) : "";
      if (!username) {
        return res.status(400).json({ ok: false, error: "username is required." });
      }
      if (!/^\d{6}$/.test(newPin)) {
        return res.status(400).json({ ok: false, error: "newPin must be a 6-digit PIN." });
      }
      const { repairUserPin } = await import("../../server/services/pinLogin.js");
      const result = await repairUserPin({ username, newPin });
      return res.status(200).json(result);
    }

    return res.status(400).json({
      ok: false,
      error: "Unknown action. Use search, purge, compliance, audit-trail, repair-onboarding, or reset-pin."
    });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "admin_members_failed",
      error,
      status: 500,
      message: "Admin member request failed.",
      context: { action }
    });
  }
}
