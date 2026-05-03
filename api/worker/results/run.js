import { config } from "../../../server/config.js";
import { checkPendingResults } from "../../../server/cron/results.js";

function hasValidSecret(req) {
  const expected = config.cronSecret || config.signalWorker.secret;
  if (!expected) return false;
  const bearer = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  return req.headers["x-bamsignal-secret"] === expected || req.query.secret === expected || bearer === expected;
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!hasValidSecret(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized result worker request" });
  }

  try {
    const updates = await checkPendingResults();
    return res.status(200).json({ ok: true, updated: updates.length, updates });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Result worker failed" });
  }
}
