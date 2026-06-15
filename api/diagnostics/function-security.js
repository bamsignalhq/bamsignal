import {
  fixFunctionSecurity,
  functionSecurityStatus
} from "../../server/fixFunctionSecurity.js";
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
      const functions = await functionSecurityStatus();
      return res.status(200).json({ ok: true, functions });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message || "Function security check failed." });
    }
  }

  if (req.method === "POST") {
    if (!isAuthorized(req)) {
      return res.status(401).json({ ok: false, error: "Diagnostics secret required." });
    }

    try {
      const result = await fixFunctionSecurity();
      const functions = await functionSecurityStatus();
      return res.status(200).json({ ok: result.ok, ...result, functions });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message || "Function security fix failed." });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
