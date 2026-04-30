import { config } from "../../../server/config.js";
import { runDailySignalWorker } from "../../../server/services/signalWorker.js";

function isAuthorized(req) {
  const allowedSecrets = [config.signalWorker.secret, config.cronSecret].filter(Boolean);
  if (!allowedSecrets.length) return false;
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return allowedSecrets.includes(req.headers["x-bamsignal-secret"])
    || allowedSecrets.includes(req.query.secret)
    || allowedSecrets.includes(bearer);
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized daily signal worker request" });
  }

  try {
    const result = await runDailySignalWorker({ broadcast: req.body?.broadcast !== false });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Daily signal worker failed" });
  }
}
