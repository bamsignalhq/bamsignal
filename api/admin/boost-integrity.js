import { requireAdmin } from "../../server/adminAuth.js";
import { getDatabaseStatus } from "../../server/db.js";
import {
  getBoostIntegrityDashboard,
  repairAllMissingBoostEntitlements,
  repairBoostEntitlementForReference
} from "../../server/services/boostIntegrity.js";
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
      const limit = Math.max(1, Math.min(100, Number(body.limit) || 25));
      const dashboard = await getBoostIntegrityDashboard(limit);
      return res.status(200).json({ ok: true, dashboard });
    }

    if (action === "repair") {
      const reference = String(body.reference || req.query.reference || "").trim();
      const dryRun = body.dryRun === true || req.query.dryRun === "true";
      if (reference) {
        const result = await repairBoostEntitlementForReference(reference, {
          dryRun,
          source: "admin_repair"
        });
        return res.status(result.ok ? 200 : 422).json({ ok: result.ok, result });
      }
      const limit = Math.max(1, Math.min(500, Number(body.limit) || 100));
      const batch = await repairAllMissingBoostEntitlements({
        dryRun,
        limit,
        source: "admin_repair"
      });
      return res.status(200).json({ ok: true, batch });
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    return sendLoggedApiError(req, res, error, { scope: "admin_boost_integrity", action });
  }
}
