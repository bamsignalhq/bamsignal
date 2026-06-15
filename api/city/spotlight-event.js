import { getDatabaseStatus } from "../../server/db.js";
import { recordCitySpotlightEvent } from "../../server/cityHome.js";

const ALLOWED = new Set(["view", "click", "profile_open", "signal"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const eventType = String(body.eventType || body.event || "").trim();
  const city = String(body.city || "").trim();
  const profileId = body.profileId ? String(body.profileId) : null;
  const viewerKey = body.viewerKey ? String(body.viewerKey) : null;

  if (!ALLOWED.has(eventType)) {
    return res.status(400).json({ ok: false, error: "Invalid spotlight event type." });
  }
  if (!city) {
    return res.status(400).json({ ok: false, error: "City is required." });
  }

  const database = getDatabaseStatus();
  if (database !== "connected") {
    return res.status(200).json({ ok: true, database, recorded: false });
  }

  try {
    await recordCitySpotlightEvent({
      eventType,
      city,
      profileId,
      viewerKey,
      meta: body.meta && typeof body.meta === "object" ? body.meta : {}
    });
    return res.status(200).json({ ok: true, recorded: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Could not record spotlight event." });
  }
}
