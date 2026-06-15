import { requireAdmin } from "../../server/adminAuth.js";
import { getCitySpotlightAnalytics } from "../../server/cityHome.js";

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
    return res.status(500).json({ ok: false, error: error.message || "Spotlight analytics failed." });
  }
}
