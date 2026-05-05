import cron from "node-cron";
import axios from "axios";
import { config } from "../config.js";
import { ensureDailyGamesTable, query } from "../db.js";
import { postDailyGameResultProof, postResultProof } from "../telegram.js";

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

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\bman city\b/g, "manchester city")
    .replace(/\bman utd\b/g, "manchester united")
    .replace(/\bman united\b/g, "manchester united")
    .replace(/\bpsg\b/g, "paris saint germain")
    .replace(/\bspurs\b/g, "tottenham");
}

function splitMatchName(matchName = "") {
  const [home, away] = String(matchName).split(/\s+vs\s+/i);
  return {
    home: normalizeText(home),
    away: normalizeText(away)
  };
}

function dateInTimezone(dateValue, timezone = config.signalWorker.timezone) {
  const date = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function addDays(dateValue, days) {
  const date = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function sportsDbSportName(item) {
  const raw = item?.fixture_payload?.raw || item?.fixture_payload || {};
  const sport = normalizeText(raw.sport || raw.strSport || item.sport || "football");
  if (sport.includes("basket")) return "Basketball";
  if (sport.includes("tennis")) return "Tennis";
  if (sport.includes("baseball") || sport.includes("mlb")) return "Baseball";
  if (sport.includes("hockey")) return "Ice Hockey";
  if (sport.includes("american")) return "American Football";
  return "Soccer";
}

function sportsDbEventScore(event) {
  const home = event?.intHomeScore === null || event?.intHomeScore === undefined ? null : Number(event.intHomeScore);
  const away = event?.intAwayScore === null || event?.intAwayScore === undefined ? null : Number(event.intAwayScore);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  return { home, away, label: `${home}-${away}` };
}

function sportsDbEventFinished(event) {
  const status = String(event?.strStatus || "").toLowerCase();
  return status.includes("finished") || Boolean(sportsDbEventScore(event));
}

function sportsDbMatchScore(event, item) {
  const teams = splitMatchName(item.match_name);
  const eventHome = normalizeText(event?.strHomeTeam);
  const eventAway = normalizeText(event?.strAwayTeam);
  let score = 0;
  if (teams.home && (eventHome.includes(teams.home) || teams.home.includes(eventHome))) score += 45;
  if (teams.away && (eventAway.includes(teams.away) || teams.away.includes(eventAway))) score += 45;
  if (teams.home && (eventAway.includes(teams.home) || teams.home.includes(eventAway))) score += 15;
  if (teams.away && (eventHome.includes(teams.away) || teams.away.includes(eventHome))) score += 15;
  if (item.league && normalizeText(event?.strLeague).includes(normalizeText(item.league))) score += 10;
  return score;
}

async function fetchSportsDbResult(item) {
  if (!config.signalWorker.sportsDbApiKey) return null;
  const baseDate = item.starts_at ? new Date(item.starts_at) : new Date();
  const dates = [-1, 0, 1]
    .map((offset) => dateInTimezone(addDays(baseDate, offset)))
    .filter((date, index, list) => date && list.indexOf(date) === index);
  const sport = sportsDbSportName(item);

  let best = null;
  for (const date of dates) {
    try {
      const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/${config.signalWorker.sportsDbApiKey}/eventsday.php`, {
        params: { d: date, s: sport },
        timeout: 10000
      });
      const events = Array.isArray(response.data?.events) ? response.data.events : [];
      for (const event of events) {
        const score = sportsDbMatchScore(event, item);
        if (score >= 75 && (!best || score > best.score)) best = { event, score };
      }
    } catch (error) {
      console.warn("TheSportsDB result lookup failed", {
        code: error.code,
        message: error.message
      });
    }
  }

  if (!best || !sportsDbEventFinished(best.event)) return null;
  const score = sportsDbEventScore(best.event);
  if (!score) return null;

  return {
    finished: true,
    fixture: {
      id: best.event.idAPIfootball || best.event.idEvent,
      date: best.event.strTimestamp || best.event.dateEvent,
      status: { short: "FT", long: best.event.strStatus || "Match Finished" }
    },
    league: {
      name: best.event.strLeague,
      logo: best.event.strLeagueBadge
    },
    teams: {
      home: { name: best.event.strHomeTeam, logo: best.event.strHomeTeamBadge },
      away: { name: best.event.strAwayTeam, logo: best.event.strAwayTeamBadge }
    },
    goals: {
      home: score.home,
      away: score.away
    },
    score: {
      fulltime: {
        home: score.home,
        away: score.away
      }
    },
    source_provider: "thesportsdb",
    raw_sportsdb: best.event
  };
}

async function fetchResult(tip) {
  const fixtureId = getFixtureId(tip);
  if (fixtureId && config.signalWorker.fixtureApiUrl && config.signalWorker.fixtureApiKey) {
    try {
      const response = await axios.get(`${config.signalWorker.fixtureApiUrl.replace(/\/$/, "")}/fixtures`, {
        headers: fixtureApiHeaders(),
        params: { id: fixtureId, timezone: config.signalWorker.timezone },
        timeout: 10000
      });
      const errors = response.data?.errors;
      if (errors && Object.keys(errors).length) {
        throw new Error(`API-Football error: ${Object.values(errors).join("; ")}`);
      }
      const fixture = response.data?.response?.[0];
      if (fixture) return fixture;
    } catch (error) {
      console.warn("API-Football result lookup failed; trying fallback", {
        code: error.code,
        message: error.message
      });
    }
  }

  const sportsDbResult = await fetchSportsDbResult(tip);
  if (sportsDbResult) return sportsDbResult;

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
       and starts_at < now() - interval '90 minutes'
       and starts_at > now() - interval '14 days'
     order by starts_at asc
     limit 80`
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
     where status in ('pending', 'scheduled', 'NS', 'TBD', '1H', '2H', 'HT', 'ET', 'P', 'BT', 'INT', 'LIVE')
       and starts_at is not null
       and starts_at < now() - interval '90 minutes'
       and starts_at > now() - interval '14 days'
     order by starts_at asc
     limit 80`
  );

  for (const game of pendingDailyGames.rows) {
    const result = await fetchResult(game);
    const settled = normalizeStatus(result, game);
    if (!settled) continue;

    const updated = await query(
      `update daily_games
       set status = $1,
           result_payload = $2,
           updated_at = now()
       where id = $3
       returning *`,
      [settled.status, settled.payload, game.id]
    );

    const settledGame = updated.rows[0];
    await postDailyGameResultProof(settledGame);
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
