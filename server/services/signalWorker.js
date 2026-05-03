import axios from "axios";
import { config } from "../config.js";
import { deleteDailyGamesBySource, ensureDailyGamesTable, ensureTipsTable, insertTip, query, upsertDailyGames } from "../db.js";
import { sendTipPush } from "../firebase.js";
import { broadcastTip } from "../telegram.js";

const defaultFixtures = [];
const nigerianFavoriteLeagueIds = new Set([
  2, 3, 848,
  39, 40, 45, 48,
  78, 81,
  61, 66,
  88,
  94,
  135, 137,
  140, 143,
  179,
  203
]);
const nigerianFavoriteLeagueNames = [
  "premier league",
  "championship",
  "fa cup",
  "league cup",
  "efl cup",
  "la liga",
  "serie a",
  "bundesliga",
  "ligue 1",
  "champions league",
  "europa league",
  "conference league",
  "eredivisie",
  "primeira liga",
  "super lig",
  "scottish premiership"
];
const nigerianFavoriteCountries = new Set([
  "england",
  "spain",
  "italy",
  "germany",
  "france",
  "europe",
  "netherlands",
  "portugal",
  "scotland",
  "turkey"
]);

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
  const league = raw.league?.name || raw.competition?.name || raw.league || raw.competition || "Football";
  const leagueId = Number(raw.league?.id || raw.competition?.id || raw.league_id || 0);
  const country = raw.league?.country || raw.country || raw.competition?.country || "";
  const startsAt = raw.starts_at || raw.start_time || raw.fixture?.date || raw.date || new Date().toISOString();
  const markets = raw.markets || raw.predictions || raw.odds || [];
  const status = raw.status || raw.fixture?.status?.short || "NS";

  return {
    home: String(home || "Home Team"),
    away: String(away || "Away Team"),
    league: String(league),
    league_id: leagueId,
    country: String(country),
    starts_at: startsAt,
    status: String(status),
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

function isNigerianFavoriteEuropeanFixture(fixture) {
  const leagueName = fixture.league.toLowerCase();
  const country = fixture.country.toLowerCase();
  const isFavoriteLeague = nigerianFavoriteLeagueIds.has(fixture.league_id)
    || nigerianFavoriteLeagueNames.some((name) => leagueName.includes(name));
  const isFavoriteCountry = nigerianFavoriteCountries.has(country);
  const isYouthOrWomen = /\b(u17|u18|u19|u20|u21|women|w\b|reserve|reserves|ii\b|iii\b|regional|oberliga|landesliga)\b/i.test(
    `${fixture.league} ${fixture.home} ${fixture.away}`
  );

  return isFavoriteLeague && isFavoriteCountry && !isYouthOrWomen;
}

function fixturePriority(fixture) {
  const leagueName = fixture.league.toLowerCase();
  const country = fixture.country.toLowerCase();
  let score = 0;

  if (leagueName.includes("champions league")) score += 120;
  if (leagueName.includes("europa league")) score += 110;
  if (leagueName.includes("premier league")) score += 105;
  if (leagueName.includes("la liga")) score += 92;
  if (leagueName.includes("serie a")) score += 90;
  if (leagueName.includes("bundesliga")) score += 88;
  if (leagueName.includes("ligue 1")) score += 76;
  if (leagueName.includes("championship")) score += 68;
  if (leagueName.includes("eredivisie")) score += 62;
  if (leagueName.includes("primeira liga")) score += 60;
  if (leagueName.includes("super lig")) score += 56;
  if (country === "europe") score += 20;
  if (["england", "spain", "italy", "germany", "france"].includes(country)) score += 12;
  if (/\b(man|arsenal|chelsea|liverpool|tottenham|barcelona|real madrid|atletico|inter|milan|juventus|napoli|bayern|dortmund|leverkusen|psg|marseille)\b/i.test(`${fixture.home} ${fixture.away}`)) {
    score += 24;
  }

  const startsAtTime = new Date(fixture.starts_at).getTime();
  if (!Number.isNaN(startsAtTime)) {
    const eveningInNigeria = new Date(startsAtTime).getUTCHours() >= 14;
    if (eveningInNigeria) score += 8;
  }

  return score;
}

async function fetchCandidateFixtures() {
  if (!config.signalWorker.fixtureApiUrl || !config.signalWorker.fixtureApiKey) {
    return defaultFixtures;
  }

  const fixtureUrl = config.signalWorker.fixtureApiUrl.endsWith("/fixtures")
    ? config.signalWorker.fixtureApiUrl
    : `${config.signalWorker.fixtureApiUrl.replace(/\/$/, "")}/fixtures`;

  try {
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
  } catch (error) {
    console.warn("Fixture API unavailable; no stale fallback board will be published", {
      code: error.code,
      message: error.message
    });
    return defaultFixtures;
  }
}

function buildTipCandidates(fixtures) {
  const tips = [];
  const playableStatuses = new Set(["NS", "TBD", "1H", "HT", "2H", "ET", "P", "BT", "LIVE"]);
  const now = Date.now();
  const selectedFixtures = fixtures
    .map(normalizeFixture)
    .filter((fixture) => {
      const startsAtTime = new Date(fixture.starts_at).getTime();
      const isFutureOrLive = Number.isNaN(startsAtTime) || startsAtTime >= now - 60 * 60 * 1000;
      return playableStatuses.has(fixture.status.toUpperCase())
        && isFutureOrLive
        && isNigerianFavoriteEuropeanFixture(fixture);
    })
    .sort((left, right) => {
      const priorityDiff = fixturePriority(right) - fixturePriority(left);
      if (priorityDiff) return priorityDiff;
      return new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime();
    })
    .slice(0, Math.max(config.signalWorker.freeLimit + config.signalWorker.vipLimit, 1));

  for (const fixture of selectedFixtures) {
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
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, config.signalWorker.vipLimit);

  return [...freemium, ...vip];
}

async function alreadyPublishedToday(tip) {
  await ensureTipsTable();

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
  await deleteDailyGamesBySource(todayInLagos(), "fixture-api");
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

  await ensureTipsTable();

  const result = await query(
    `select *
     from tips
     where created_at >= (date_trunc('day', now() at time zone $1) at time zone $1)
     order by is_vip asc, created_at desc`,
    [config.signalWorker.timezone]
  );

  if (!result.rows.length) {
    return {
      ok: true,
      date: todayInLagos(),
      source: "empty",
      freemium: [],
      vip: []
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
