import { getDailyGames } from "../server/services/signalWorker.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const games = await getDailyGames();
    return res.status(200).json(games);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Could not load daily games" });
  }
}
