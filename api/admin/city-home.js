import { requireAdmin } from "../../server/adminAuth.js";
import { getDatabaseStatus } from "../../server/db.js";
import {
  CITY_HOME_PLACEMENT_TYPES,
  listAdminCityPlacements,
  listMemberProfilesByCity,
  setCityHomeHidden,
  upsertAdminCityPlacement
} from "../../server/cityHome.js";

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

function memberSummary(row) {
  const profile = row.profile || {};
  const photos = Array.isArray(profile.photos) ? profile.photos : [];
  return {
    id: row.id,
    name: row.name || profile.name || "Member",
    city: row.city,
    email: row.email,
    phone: row.phone,
    photo: photos[0] || "",
    cityHomeHidden: row.city_home_hidden,
    onboardingComplete: row.onboarding_complete,
    updatedAt: row.updated_at
  };
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
  const city = String(body.city || req.query.city || "").trim();

  try {
    if (req.query.action === "members") {
      if (!city) return res.status(400).json({ ok: false, error: "City is required." });
      const members = (await listMemberProfilesByCity(city, 100)).map(memberSummary);
      const placements = await listAdminCityPlacements(city);
      return res.status(200).json({ ok: true, city, members, placements });
    }

    if (req.query.action === "set-placement") {
      if (!city) return res.status(400).json({ ok: false, error: "City is required." });
      const profileId = String(body.profileId || "").trim();
      const placementType = String(body.placementType || "").trim();
      const active = body.active !== false;

      if (!profileId) return res.status(400).json({ ok: false, error: "Profile id is required." });
      if (!CITY_HOME_PLACEMENT_TYPES.includes(placementType)) {
        return res.status(400).json({ ok: false, error: "Invalid placement type." });
      }

      const placement = await upsertAdminCityPlacement({
        city,
        profileId,
        placementType,
        sortOrder: Number(body.sortOrder) || 0,
        active,
        expiresAt: body.expiresAt || null,
        createdBy: "admin"
      });
      return res.status(200).json({ ok: true, placement });
    }

    if (req.query.action === "hide") {
      const profileId = String(body.profileId || "").trim();
      if (!profileId) return res.status(400).json({ ok: false, error: "Profile id is required." });
      const hidden = body.hidden !== false;
      const result = await setCityHomeHidden(profileId, hidden);
      return res.status(200).json({ ok: true, ...result });
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "City home admin request failed." });
  }
}
