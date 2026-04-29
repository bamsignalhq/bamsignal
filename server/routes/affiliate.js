import express from "express";
import { config } from "../config.js";
import { query } from "../db.js";

export const affiliateRouter = express.Router();

affiliateRouter.get("/affiliate/:bookie/:tipId", async (req, res, next) => {
  try {
    const bookie = req.params.bookie.toLowerCase();
    const redirectUrl = config.affiliateUrls[bookie];

    await query(
      `insert into affiliate_clicks (tip_id, bookie, ip_address, user_agent)
       values ($1, $2, $3, $4)`,
      [req.params.tipId, bookie, req.ip, req.get("user-agent") || null]
    );

    if (!redirectUrl) {
      return res.status(404).json({ ok: false, error: "Affiliate link is not configured" });
    }

    return res.redirect(302, redirectUrl);
  } catch (error) {
    return next(error);
  }
});
