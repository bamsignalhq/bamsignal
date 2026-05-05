import express from "express";
import { config } from "../config.js";
import {
  filterDailyGamesPayload,
  getDailyGames,
  getEvidenceGames,
  getMatchDetails,
  runDailySignalWorker
} from "../services/signalWorker.js";

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

dailySignalsRouter.get("/daily-games", async (req, res, next) => {
  try {
    const games = await getDailyGames();
    res.json(filterDailyGamesPayload(games, req.query.filter));
  } catch (error) {
    next(error);
  }
});

dailySignalsRouter.get("/evidence-games", async (req, res, next) => {
  try {
    const games = await getEvidenceGames(Number(req.query.limit || 30));
    res.json(games);
  } catch (error) {
    next(error);
  }
});

dailySignalsRouter.get("/match-details/:id", async (req, res, next) => {
  try {
    const details = await getMatchDetails(req.params.id);
    if (!details) return res.status(404).json({ ok: false, error: "Match not found" });
    return res.json(details);
  } catch (error) {
    return next(error);
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
