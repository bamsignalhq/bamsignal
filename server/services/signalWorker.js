import axios from "axios";
import { config } from "../config.js";
import { ensureDailyGamesTable, insertTip, query, upsertDailyGames } from "../db.js";
import { sendTipPush } from "../firebase.js";
import { broadcastTip } from "../telegram.js";

const defaultFixtures = [
  {
    home: "Arsenal",
    away: "Brighton",
    league: "Premier League",
    starts_at: new Date().toISOString(),
    markets: [
      { prediction: "Over 1.5 goals", odds: 1.34, confidence: 84 },
      { prediction: "Arsenal win + over 1.5", odds: 2.05, confidence: 78 }
    ]
  },
  {
    home: "Barcelona",
    away: "Villarreal",
    league: "La Liga",
    starts_at: new Date().toISOString(),
    markets: [
      { prediction: "Barcelona team over 0.5", odds: 1.28, confidence: 82 },
      { prediction: "Barcelona team over 1.5", odds: 1.92, confidence: 76 }
    ]
  },
  {
    home: "Inter Milan",
    away: "Fiorentina",
    league: "Serie A",
    starts_at: new Date().toISOString(),
    markets: [
      { prediction: "Inter double chance + over 1.5", odds: 1.47, confidence: 80 },
      { prediction: "Inter win and BTTS", odds: 2.38, confidence: 73 }
    ]
  },
  {
    home: "Bayer Leverkusen",
    away: "Mainz",
    league: "Bundesliga",
    starts_at: new Date().toISOString(),
    markets: [
      { prediction: "Home over 0.5 goals", odds: 1.22, confidence: 86 },
      { prediction: "Home win and BTTS", odds: 2.42, confidence: 75 }
    ]
  }
];

function todayInLagos() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: config.signalWorker.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function normalizeFixture(raw) {
  const home = raw.home || raw.home_team || raw.homeTeam?.name || raw.teams?.home?.name;
  const away = raw.away || raw.away_team || raw.awayTeam?.name || raw.teams?.away?.name;
  const league = raw.league || raw.competition || raw.league?.name || raw.competition?.name || "Football";
  const startsAt = raw.starts_at || raw.start_time || raw.fixture?.date || raw.date || new Date().toISOString();
  const markets = raw.markets || raw.predictions || raw.odds || [];

  return {
    home: String(home || "Home Team"),
    away: String(away || "Away Team"),
    league: String(league),
    starts_at: startsAt,
    markets: Array.isArray(markets) ? markets : [],
    raw
  };
}

function normalizeMarket(market, fallbackIndex = 0) {
  return {
    prediction: String(market.prediction || market.pick || market.name || market.market || "Over 1.5 goals"),
    odds: Number(market.odds || market.price || market.value || (fallbackIndex === 0 ? 1.35 : 2.05)),
    confidence: Number(market.confidence || market.probability || market.percent || (fallbackIndex === 0 ? 82 : 74))
  };
}

async function fetchCandidateFixtures() {
  if (!config.signalWorker.fixtureApiUrl || !config.signalWorker.fixtureApiKey) {
    return defaultFixtures;
  }

  const fixtureUrl = config.signalWorker.fixtureApiUrl.endsWith("/fixtures")
    ? config.signalWorker.fixtureApiUrl
    : `${config.signalWorker.fixtureApiUrl.replace(/\/$/, "")}/fixtures`;

  const response = await axios.get(fixtureUrl, {
    headers: {
      Authorization: `Bearer ${config.signalWorker.fixtureApiKey}`,
      "x-apisports-key": config.signalWorker.fixtureApiKey,
      "x-api-key": config.signalWorker.fixtureApiKey
    },
    params: {
      date: todayInLagos(),
      timezone: config.signalWorker.timezone
    },
    timeout: 15000
  });

  const payload = response.data?.fixtures || response.data?.data || response.data?.response || response.data;
  return Array.isArray(payload) ? payload.map(normalizeFixture) : defaultFixtures;
}

function buildTipCandidates(fixtures) {
  const tips = [];

  for (const fixture of fixtures.map(normalizeFixture)) {
    const markets = fixture.markets.length ? fixture.markets.map(normalizeMarket) : [
      normalizeMarket({}, 0),
      normalizeMarket({ prediction: "Home win + over 1.5", odds: 2.05, confidence: 74 }, 1)
    ];

    for (const market of markets) {
      tips.push({
        match_name: `${fixture.home} vs ${fixture.away}`,
        league: fixture.league,
        prediction: market.prediction,
        odds: market.odds.toFixed(2),
        confidence: market.confidence,
        is_vip: market.odds >= config.signalWorker.freeOddsMax,
        booking_codes: config.signalWorker.defaultBookingCodes,
        source: config.signalWorker.fixtureApiUrl ? "fixture-api" : "fallback",
        starts_at: fixture.starts_at,
        fixture_payload: fixture.raw || fixture
      });
    }
  }

  const freemium = tips
    .filter((tip) => !tip.is_vip && Number(tip.odds) < config.signalWorker.freeOddsMax)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, config.signalWorker.freeLimit);

  const vip = tips
    .filter((tip) => tip.is_vip)
    .sort((a, b) => b.confidence - a.confidence);

  return [...freemium, ...vip];
}

async function alreadyPublishedToday(tip) {
  const result = await query(
    `select * from tips
     where match_name = $1
       and prediction = $2
       and is_vip = $3
       and created_at >= (date_trunc('day', now() at time zone $4) at time zone $4)
     limit 1`,
    [tip.match_name, tip.prediction, tip.is_vip, config.signalWorker.timezone]
  );
  return result.rows[0] || null;
}

async function publishDailyTip(tip, { broadcast = true } = {}) {
  const existing = await alreadyPublishedToday(tip);
  if (existing) return { tip: existing, created: false, delivery: { skipped: true, reason: "already_published_today" } };

  const saved = await insertTip(tip);
  if (!broadcast) return { tip: saved, created: true, delivery: { skipped: true, reason: "broadcast_disabled" } };

  const [telegram, firebase] = await Promise.allSettled([
    broadcastTip(saved),
    sendTipPush(saved)
  ]);

  return {
    tip: saved,
    created: true,
    delivery: {
      telegram: telegram.status === "fulfilled" ? telegram.value : { ok: false, error: telegram.reason?.message },
      firebase: firebase.status === "fulfilled" ? firebase.value : { ok: false, error: firebase.reason?.message }
    }
  };
}

export async function runDailySignalWorker(options = {}) {
  const fixtures = await fetchCandidateFixtures();
  const candidates = buildTipCandidates(fixtures);
  const savedDailyGames = await upsertDailyGames(todayInLagos(), candidates);
  const results = [];

  for (const candidate of candidates) {
    results.push(await publishDailyTip(candidate, { broadcast: options.broadcast !== false }));
  }

  return {
    ok: true,
    date: todayInLagos(),
    timezone: config.signalWorker.timezone,
    stored: savedDailyGames.length,
    freemium: results.filter((item) => !item.tip.is_vip).length,
    vip: results.filter((item) => item.tip.is_vip).length,
    results
  };
}

export async function getDailyGames() {
  await ensureDailyGamesTable();

  const dailyResult = await query(
    `select *
     from daily_games
     where game_date = $1::date
     order by is_vip asc, confidence desc nulls last, starts_at asc nulls last, created_at desc`,
    [todayInLagos()]
  );

  if (dailyResult.rows.length) {
    return {
      ok: true,
      date: todayInLagos(),
      source: "daily_games",
      freemium: dailyResult.rows.filter((tip) => !tip.is_vip),
      vip: dailyResult.rows.filter((tip) => tip.is_vip)
    };
  }

  const result = await query(
    `select *
     from tips
     where created_at >= (date_trunc('day', now() at time zone $1) at time zone $1)
     order by is_vip asc, created_at desc`,
    [config.signalWorker.timezone]
  );

  if (!result.rows.length) {
    const dryTips = buildTipCandidates(defaultFixtures);
    return {
      ok: true,
      date: todayInLagos(),
      source: "fallback",
      freemium: dryTips.filter((tip) => !tip.is_vip),
      vip: dryTips.filter((tip) => tip.is_vip)
    };
  }

  return {
    ok: true,
    date: todayInLagos(),
    source: "database",
    freemium: result.rows.filter((tip) => !tip.is_vip),
    vip: result.rows.filter((tip) => tip.is_vip)
  };
}
