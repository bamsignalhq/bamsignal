import {
  fixSecurityDefinerViews,
  securityInvokerViewStatus
} from "../../server/fixSecurityDefinerViews.js";
import { config } from "../../server/config.js";

function isAuthorized(req) {
  const allowed = [config.cronSecret, process.env.DIAGNOSTICS_SECRET]
    .filter(Boolean)
    .map((value) => String(value).trim());
  if (!allowed.length) return false;

  const provided =
    req.headers["x-bamsignal-secret"] ||
    req.query.secret ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");

  return Boolean(provided && allowed.includes(String(provided).trim()));
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const views = await securityInvokerViewStatus();
      return res.status(200).json({ ok: true, views });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message || "View security check failed." });
    }
  }

  if (req.method === "POST") {
    if (!isAuthorized(req)) {
      return res.status(401).json({ ok: false, error: "Diagnostics secret required." });
    }

    try {
      const result = await fixSecurityDefinerViews();
      const views = await securityInvokerViewStatus();
      return res.status(200).json({ ok: result.ok, fixed: result.fixed, views });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message || "View security fix failed." });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
