import { requireAdmin } from "../../server/adminAuth.js";
import { getDatabaseStatus } from "../../server/db.js";
import {
  applyMembershipRefund,
  grantMembershipManual,
  listDiscreetMembershipAdminEvents,
  revokeMembershipManual
} from "../../server/services/membershipCommerce.js";
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
  const action = String(req.query.action || body.action || "dashboard").trim();

  try {
    if (action === "dashboard") {
      const limit = Math.max(1, Math.min(200, Number(body.limit) || 50));
      const dashboard = await listDiscreetMembershipAdminEvents({ limit });
      return res.status(200).json({
        ok: true,
        ...dashboard,
        product: { priceNgn: 9999, days: 30, productId: "discreet", planId: "monthly" }
      });
    }

    if (action === "grant") {
      const result = await grantMembershipManual({
        experienceMode: "discreet",
        email: body.email,
        phone: body.phone,
        days: Number(body.days) || 30,
        productId: "discreet",
        planId: body.planId || "monthly",
        adminActor: body.adminActor || "admin",
        metadata: { reason: body.reason || "admin_grant" }
      });
      return res.status(result.ok ? 200 : 422).json(result);
    }

    if (action === "revoke") {
      const result = await revokeMembershipManual({
        experienceMode: "discreet",
        email: body.email,
        phone: body.phone,
        adminActor: body.adminActor || "admin",
        reason: body.reason || "admin_revoke"
      });
      return res.status(result.ok ? 200 : 422).json(result);
    }

    if (action === "refund") {
      const result = await applyMembershipRefund({
        experienceMode: "discreet",
        email: body.email,
        phone: body.phone,
        paymentRef: body.paymentRef || body.reference || null,
        revoke: body.revoke !== false,
        metadata: { source: "admin_discreet_refund" }
      });
      return res.status(result.ok ? 200 : 422).json(result);
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    return sendLoggedApiError(req, res, error, { scope: "admin_discreet_membership", action });
  }
}
