import { config } from "../server/config.js";
import { query } from "../server/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const bookie = String(req.query.bookie || "").toLowerCase();
  const tipId = String(req.query.tipId || "unknown");
  const redirectUrl = config.affiliateUrls[bookie];

  try {
    await query(
      `insert into affiliate_clicks (tip_id, bookie, ip_address, user_agent)
       values ($1, $2, $3, $4)`,
      [
        tipId,
        bookie,
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || null,
        req.headers["user-agent"] || null
      ]
    );
  } catch {
    // Click tracking must never block the redirect.
  }

  if (!redirectUrl) {
    return res.status(404).json({ ok: false, error: "Affiliate link is not configured" });
  }

  return res.redirect(302, redirectUrl);
}
