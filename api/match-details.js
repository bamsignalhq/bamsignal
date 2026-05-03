import { getMatchDetails } from "../server/services/signalWorker.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const details = await getMatchDetails(req.query.id);
    if (!details) return res.status(404).json({ ok: false, error: "Match not found" });
    return res.status(200).json(details);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Could not load match details" });
  }
}
