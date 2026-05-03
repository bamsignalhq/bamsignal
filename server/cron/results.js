import cron from "node-cron";
import axios from "axios";
import { config } from "../config.js";
import { ensureDailyGamesTable, query } from "../db.js";
import { postResultProof } from "../telegram.js";

function fixtureApiHeaders() {
  return {
    Authorization: `Bearer ${config.signalWorker.fixtureApiKey}`,
    "x-apisports-key": config.signalWorker.fixtureApiKey,
    "x-api-key": config.signalWorker.fixtureApiKey
  };
}

function getFixtureId(item) {
  const raw = item?.fixture_payload?.raw || item?.fixture_payload || {};
  return Number(raw.fixture?.id || raw.id || raw.fixture_id || 0);
}

async function fetchResult(tip) {
  const fixtureId = getFixtureId(tip);
  if (fixtureId && config.signalWorker.fixtureApiUrl && config.signalWorker.fixtureApiKey) {
    const response = await axios.get(`${config.signalWorker.fixtureApiUrl.replace(/\/$/, "")}/fixtures`, {
      headers: fixtureApiHeaders(),
      params: { id: fixtureId, timezone: config.signalWorker.timezone },
      timeout: 10000
    });
    const fixture = response.data?.response?.[0];
    if (fixture) return fixture;
  }

  if (!config.liveScore.apiUrl || !config.liveScore.apiKey) return null;

  const response = await axios.get(config.liveScore.apiUrl, {
    headers: { Authorization: `Bearer ${config.liveScore.apiKey}` },
    params: {
      match_name: tip.match_name,
      starts_at: tip.starts_at
    },
    timeout: 10000
  });

  return response.data;
}

function scoreFromResult(result) {
  const goals = result?.goals || {};
  const score = result?.score?.fulltime || result?.score || {};
  const home = score.home ?? goals.home;
  const away = score.away ?? goals.away;
  if (typeof home === "number" && typeof away === "number") return { home, away, label: `${home}-${away}` };
  return null;
}

function isFinished(result) {
  if (result?.finished) return true;
  return ["FT", "AET", "PEN"].includes(String(result?.fixture?.status?.short || result?.status || "").toUpperCase());
}

function evaluatePrediction(prediction, score, item) {
  const pick = String(prediction || "").toLowerCase();
  const raw = item?.fixture_payload?.raw || item?.fixture_payload || {};
  const homeName = String(raw.teams?.home?.name || item.match_name?.split(/\s+vs\s+/i)[0] || "home").toLowerCase();
  const awayName = String(raw.teams?.away?.name || item.match_name?.split(/\s+vs\s+/i)[1] || "away").toLowerCase();
  const total = score.home + score.away;
  const homeWon = score.home > score.away;
  const awayWon = score.away > score.home;
  const draw = score.home === score.away;

  if (/over\s*1\.5/.test(pick)) return total > 1.5;
  if (/under\s*1\.5/.test(pick)) return total < 1.5;
  if (/over\s*2\.5/.test(pick)) return total > 2.5;
  if (/under\s*2\.5/.test(pick)) return total < 2.5;
  if (/over\s*3\.5/.test(pick)) return total > 3.5;
  if (/under\s*3\.5/.test(pick)) return total < 3.5;
  if (pick.includes("btts") || pick.includes("both teams")) return score.home > 0 && score.away > 0;
  if (pick.includes("double chance 1x") || pick.includes("home or draw") || pick.includes("win or draw")) return homeWon || draw;
  if (pick.includes("double chance x2") || pick.includes("away or draw")) return awayWon || draw;
  if (pick.includes("double chance 12")) return !draw;
  if (pick.includes("home over 0.5") || pick.includes(`${homeName} over 0.5`)) return score.home > 0;
  if (pick.includes("away over 0.5") || pick.includes(`${awayName} over 0.5`)) return score.away > 0;
  if (pick.includes("home over 1.5") || pick.includes(`${homeName} over 1.5`)) return score.home > 1;
  if (pick.includes("away over 1.5") || pick.includes(`${awayName} over 1.5`)) return score.away > 1;
  if ((pick.includes("home win") || pick.includes(`${homeName} win`) || pick.includes(`${homeName} to win`)) && !pick.includes("draw")) return homeWon;
  if ((pick.includes("away win") || pick.includes(`${awayName} win`) || pick.includes(`${awayName} to win`)) && !pick.includes("draw")) return awayWon;
  return null;
}

function normalizeStatus(result, item) {
  if (!isFinished(result)) return null;
  const score = scoreFromResult(result);
  if (!score) return null;
  const won = typeof result.won === "boolean" ? result.won : evaluatePrediction(item.prediction, score, item);
  if (won === null) return null;
  return {
    status: won ? "won" : "lost",
    payload: {
      score: score.label,
      result,
      evaluated_at: new Date().toISOString()
    }
  };
}

export async function checkPendingResults() {
  const pending = await query(
    `select * from tips
     where status = 'pending'
       and starts_at is not null
       and starts_at < now()
     order by starts_at asc
     limit 25`
  );

  const updates = [];
  for (const tip of pending.rows) {
    const result = await fetchResult(tip);
    const settled = normalizeStatus(result, tip);
    if (!settled) continue;

    const updated = await query(
      `update tips
       set status = $1,
           result_payload = $2,
           settled_at = now()
       where id = $3
       returning *`,
      [settled.status, settled.payload, tip.id]
    );

    const settledTip = updated.rows[0];
    await postResultProof(settledTip);
    updates.push({ id: tip.id, status: settled.status, table: "tips" });
  }

  await ensureDailyGamesTable();
  const pendingDailyGames = await query(
    `select * from daily_games
     where status in ('pending', 'scheduled', 'NS', '1H', '2H', 'HT')
       and starts_at is not null
       and starts_at < now()
     order by starts_at asc
     limit 25`
  );

  for (const game of pendingDailyGames.rows) {
    const result = await fetchResult(game);
    const settled = normalizeStatus(result, game);
    if (!settled) continue;

    await query(
      `update daily_games
       set status = $1,
           result_payload = $2,
           updated_at = now()
       where id = $3
       returning *`,
      [settled.status, settled.payload, game.id]
    );

    updates.push({ id: game.id, status: settled.status, table: "daily_games" });
  }

  return updates;
}

export function startResultCron() {
  cron.schedule("*/15 * * * *", async () => {
    try {
      await checkPendingResults();
    } catch (error) {
      console.error("Result cron failed", error);
    }
  });
}
