import express from "express";
import { config } from "../config.js";
import { getDailyGames, runDailySignalWorker } from "../services/signalWorker.js";

export const dailySignalsRouter = express.Router();

function requireWorkerSecret(req, res, next) {
  if (!config.signalWorker.secret) {
    return res.status(503).json({ ok: false, error: "SIGNAL_WORKER_SECRET is not configured" });
  }

  const provided = req.headers["x-bamsignal-secret"] || req.query.secret;
  if (provided !== config.signalWorker.secret) {
    return res.status(401).json({ ok: false, error: "Unauthorized daily signal worker request" });
  }

  return next();
}

dailySignalsRouter.get("/daily-games", async (_req, res, next) => {
  try {
    const games = await getDailyGames();
    res.json(games);
  } catch (error) {
    next(error);
  }
});

dailySignalsRouter.post("/worker/daily-signals/run", requireWorkerSecret, async (req, res, next) => {
  try {
    const result = await runDailySignalWorker({ broadcast: req.body?.broadcast !== false });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
