import { requireAdmin } from "../../server/adminAuth.js";
import { getCitySpotlightAnalytics } from "../../server/cityHome.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!(await requireAdmin(req, res))) return;

  const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));

  try {
    const analytics = await getCitySpotlightAnalytics({ days });
    return res.status(200).json({ ok: true, analytics });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "admin_city_spotlight_failed",
      error,
      status: 500,
      message: "Spotlight analytics failed.",
      context: { days }
    });
  }
}
