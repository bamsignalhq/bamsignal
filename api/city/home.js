import { getDatabaseStatus } from "../../server/db.js";
import { listCityHomeProfiles } from "../../server/cityHome.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const city = String(req.query.city || "").trim();
  const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 6));

  if (!city) {
    return res.status(400).json({ ok: false, error: "City is required." });
  }

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(200).json({ ok: true, database, city, profiles: [] });
  }

  try {
    const profiles = await listCityHomeProfiles(city, limit);
    return res.status(200).json({ ok: true, database, city, profiles });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "City home request failed." });
  }
}
