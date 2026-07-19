import { requireAdmin } from "../../server/adminAuth.js";
import { getDatabaseStatus } from "../../server/db.js";
import { listAllConversationUnlocksAdmin } from "../../server/services/conversationUnlock.js";
import { getBoostIntegrityDashboard } from "../../server/services/boostIntegrity.js";
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
      const [unlocks, boostDashboard] = await Promise.all([
        listAllConversationUnlocksAdmin({ limit }),
        getBoostIntegrityDashboard(Math.min(50, limit))
      ]);
      return res.status(200).json({
        ok: true,
        conversationUnlocks: unlocks,
        boosts: boostDashboard,
        products: {
          conversationUnlock: { priceNgn: 500, permanent: true },
          profileBoost: { priceNgn: 999, durationHours: 24 },
          premiumWeekly: { priceNgn: 999, days: 7 },
          premiumMonthly: { priceNgn: 2999, days: 30 }
        }
      });
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    return sendLoggedApiError(req, res, error, { scope: "admin_discover_commerce", action });
  }
}
