import { getDatabaseStatus } from "../../server/db.js";
import { listCitySpotlightProfiles } from "../../server/cityHome.js";
import { sendLoggedApiError } from "../../server/services/errorResponse.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const city = String(req.query.city || "").trim();
  const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 8));

  if (!city) {
    return res.status(400).json({ ok: false, error: "City is required." });
  }

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(200).json({ ok: true, database, city, profiles: [] });
  }

  try {
    const profiles = await listCitySpotlightProfiles(city, limit);
    return res.status(200).json({ ok: true, database, city, profiles });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "city_spotlight_failed",
      error,
      status: 500,
      message: "City spotlight request failed.",
      context: { limit }
    });
  }
}
