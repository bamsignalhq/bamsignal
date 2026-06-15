import { config } from "../../server/config.js";
import { probePaystackConnectivity } from "../../server/services/paystackClient.js";

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
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ ok: false, error: "Diagnostics secret required." });
  }

  try {
    const probe = await probePaystackConnectivity();
    return res.status(200).json({
      ok: probe.ok,
      service: "bamsignal",
      checkedAt: new Date().toISOString(),
      paystack: probe
    });
  } catch (error) {
    console.error("[paystack-diagnostics] probe failed:", error);
    return res.status(200).json({
      ok: false,
      service: "bamsignal",
      checkedAt: new Date().toISOString(),
      error: error.message || "Diagnostics probe failed."
    });
  }
}
