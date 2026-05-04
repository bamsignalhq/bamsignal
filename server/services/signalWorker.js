import axios from "axios";
import { config } from "../config.js";
import { deleteDailyGamesBySource, ensureDailyGamesTable, ensureTipsTable, insertTip, query, upsertDailyGames } from "../db.js";
import { sendTipPush } from "../firebase.js";
import { broadcastTip } from "../telegram.js";

const defaultFixtures = [];
const maxDailyPublishedTips = 20;
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
const relativeFootballCountries = new Set([
  "belgium",
  "austria",
  "switzerland",
  "denmark",
  "norway",
  "sweden",
  "greece",
  "brazil",
  "argentina",
  "usa",
  "mexico",
  "saudi-arabia",
  "japan",
  "south-korea",
  "australia",
  "nigeria"
]);
const relativeFootballLeagueNames = [
  "pro league",
  "bundesliga",
  "super league",
  "superliga",
  "allsvenskan",
  "eliteserien",
  "jupiler",
  "brasileiro",
  "serie a",
  "primera division",
  "major league soccer",
  "mls",
  "liga mx",
  "saudi pro league",
  "j1 league",
  "k league",
  "a-league",
  "caf",
  "africa cup",
  "npfl"
];

function todayInLagos() {
  return dateInSignalTimezone(new Date());
}

function dateInSignalTimezone(dateValue) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: config.signalWorker.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(dateValue);
}

function addDaysInSignalTimezone(offset) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return dateInSignalTimezone(date);
}

function signalDateFromStartsAt(startsAt) {
  const date = startsAt ? new Date(startsAt) : new Date();
  if (Number.isNaN(date.getTime())) return todayInLagos();
  return dateInSignalTimezone(date);
}

function boardDates() {
  return [addDaysInSignalTimezone(-1), addDaysInSignalTimezone(0), addDaysInSignalTimezone(1)];
}

function normalizeFixture(raw) {
  const home = raw.home || raw.home_team || raw.homeTeam?.name || raw.teams?.home?.name;
  const away = raw.away || raw.away_team || raw.awayTeam?.name || raw.teams?.away?.name;
  const league = raw.league?.name || raw.competition?.name || raw.league || raw.competition || "Football";
  const leagueId = Number(raw.league?.id || raw.competition?.id || raw.league_id || 0);
  const fixtureId = Number(raw.fixture?.id || raw.id || raw.fixture_id || 0);
  const country = raw.league?.country || raw.country || raw.competition?.country || "";
  const startsAt = raw.starts_at || raw.start_time || raw.fixture?.date || raw.date || new Date().toISOString();
  const markets = raw.markets || raw.predictions || raw.odds || [];
  const status = raw.status || raw.fixture?.status?.short || "NS";

  return {
    home: String(home || "Home Team"),
    away: String(away || "Away Team"),
    league: String(league),
    league_id: leagueId,
    fixture_id: fixtureId,
    country: String(country),
    starts_at: startsAt,
    status: String(status),
    markets: Array.isArray(markets) ? markets : [],
    raw
  };
}

function sportsDbStatus(event) {
  const status = String(event.strStatus || "").toLowerCase();
  if (status.includes("finished")) return "FT";
  if (status.includes("live") || status.includes("progress")) return "LIVE";
  if (status.includes("postponed")) return "PST";
  if (status.includes("cancel")) return "CANC";
  const startsAt = event.strTimestamp ? new Date(`${event.strTimestamp.endsWith("Z") ? event.strTimestamp : `${event.strTimestamp}Z`}`) : null;
  if (startsAt && !Number.isNaN(startsAt.getTime())) {
    const diff = Date.now() - startsAt.getTime();
    if (diff >= 0 && diff <= 2.5 * 60 * 60 * 1000 && event.intHomeScore === null && event.intAwayScore === null) return "LIVE";
  }
  return "NS";
}

function normalizeSportsDbEvent(event) {
  const fixtureId = Number(event.idAPIfootball || event.idEvent || 0);
  const homeScore = event.intHomeScore === null || event.intHomeScore === undefined ? null : Number(event.intHomeScore);
  const awayScore = event.intAwayScore === null || event.intAwayScore === undefined ? null : Number(event.intAwayScore);
  const startsAt = event.strTimestamp
    ? `${String(event.strTimestamp).replace(/Z$/, "")}Z`
    : `${event.dateEvent || todayInLagos()}T${event.strTime || "12:00:00"}Z`;

  return normalizeFixture({
    fixture: {
      id: fixtureId,
      date: startsAt,
      status: {
        short: sportsDbStatus(event),
        long: event.strStatus || "Scheduled"
      },
      venue: {
        name: event.strVenue || null,
        city: event.strCity || null
      }
    },
    league: {
      id: Number(event.idLeague || 0),
      name: event.strLeague || "Football",
      country: event.strCountry || "",
      logo: event.strLeagueBadge || null,
      season: event.strSeason || null
    },
    teams: {
      home: {
        id: Number(event.idHomeTeam || 0),
        name: event.strHomeTeam || "Home Team",
        logo: event.strHomeTeamBadge || null
      },
      away: {
        id: Number(event.idAwayTeam || 0),
        name: event.strAwayTeam || "Away Team",
        logo: event.strAwayTeamBadge || null
      }
    },
    goals: {
      home: Number.isFinite(homeScore) ? homeScore : null,
      away: Number.isFinite(awayScore) ? awayScore : null
    },
    score: {
      fulltime: {
        home: Number.isFinite(homeScore) ? homeScore : null,
        away: Number.isFinite(awayScore) ? awayScore : null
      }
    },
    source_provider: "thesportsdb",
    raw_sportsdb: event
  });
}

function normalizeText(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return normalized
    .replace(/\bman city\b/g, "manchester city")
    .replace(/\bman utd\b/g, "manchester united")
    .replace(/\bman united\b/g, "manchester united")
    .replace(/\bpsg\b/g, "paris saint germain")
    .replace(/\bspurs\b/g, "tottenham")
    .replace(/\binter\b/g, "inter milan");
}

function parseMatchTeams(matchName) {
  const [home, away] = String(matchName || "").split(/\s+vs\s+/i);
  return {
    home: normalizeText(home),
    away: normalizeText(away)
  };
}

function fixtureMatchScore(fixture, tip) {
  const teams = parseMatchTeams(tip.match_name);
  const fixtureHome = normalizeText(fixture.home);
  const fixtureAway = normalizeText(fixture.away);
  const league = normalizeText(tip.league);
  let score = 0;

  if (teams.home && (fixtureHome.includes(teams.home) || teams.home.includes(fixtureHome))) score += 45;
  if (teams.away && (fixtureAway.includes(teams.away) || teams.away.includes(fixtureAway))) score += 45;
  if (teams.home && (fixtureAway.includes(teams.home) || teams.home.includes(fixtureAway))) score += 20;
  if (teams.away && (fixtureHome.includes(teams.away) || teams.away.includes(fixtureHome))) score += 20;
  if (league && normalizeText(fixture.league).includes(league)) score += 10;

  return score;
}

async function findFixtureForTip(tip) {
  if (!config.signalWorker.fixtureApiUrl || !config.signalWorker.fixtureApiKey) return null;
  const fixtures = (await fetchCandidateFixtures()).map(normalizeFixture);
  const ranked = fixtures
    .map((fixture) => ({ fixture, score: fixtureMatchScore(fixture, tip) }))
    .filter((item) => item.score >= 70)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return fixturePriority(right.fixture) - fixturePriority(left.fixture);
    });
  return ranked[0]?.fixture || null;
}

export async function enrichTipWithFixture(tip) {
  if (tip.fixture_payload) return tip;
  const fixture = await findFixtureForTip(tip);
  if (!fixture) return tip;

  const oddsByFixtureId = await fetchOddsByFixtureIds(fixture.fixture_id ? [fixture.fixture_id] : []);
  const markets = oddsByFixtureId.get(fixture.fixture_id) || [];
  const closestMarket = markets.find((market) => normalizeText(market.prediction) === normalizeText(tip.prediction)) || markets[0];

  return {
    ...tip,
    league: fixture.league || tip.league,
    odds: tip.odds || closestMarket?.odds?.toFixed?.(2) || closestMarket?.odds || "1.00",
    confidence: tip.confidence || closestMarket?.confidence || null,
    starts_at: fixture.starts_at || tip.starts_at || null,
    fixture_payload: fixture.raw || fixture,
    source: tip.source || "admin-enriched"
  };
}

function normalizeMarket(market, fallbackIndex = 0) {
  return {
    prediction: String(market.prediction || market.pick || market.name || market.market || "Over 1.5 goals"),
    odds: Number(market.odds || market.price || market.value || (fallbackIndex === 0 ? 1.35 : 2.05)),
    confidence: Number(market.confidence || market.probability || market.percent || (fallbackIndex === 0 ? 82 : 74))
  };
}

const preferredBetNames = [
  "double chance",
  "goals over/under",
  "match winner",
  "both teams score",
  "home/away",
  "total goals"
];

function normalizeOddValue(value) {
  const rawOdd = value.odd ?? value.odds ?? value.price;
  const odd = Number(rawOdd);
  if (!Number.isFinite(odd) || odd < 1.05 || odd > 15) return null;
  return {
    value: String(value.value || value.name || value.label || "Selection"),
    odd
  };
}

function readablePredictionFromOdds(betName, valueName) {
  const bet = betName.toLowerCase();
  const value = String(valueName).replace(/\s+/g, " ").trim();

  if (bet.includes("goals over/under")) return value.replace(/^Over\s+/i, "Over ").replace(/^Under\s+/i, "Under ");
  if (bet.includes("double chance")) return `Double chance ${value}`;
  if (bet.includes("both teams")) return `BTTS ${value}`;
  if (bet.includes("match winner") || bet.includes("home/away")) return `${value} to win`;
  return `${betName}: ${value}`;
}

function oddsPriority(betName, valueName, odd) {
  const bet = betName.toLowerCase();
  const value = String(valueName).toLowerCase();
  let score = 0;

  if (preferredBetNames.some((name) => bet.includes(name))) score += 20;
  if (bet.includes("goals over/under") && /over 1\.5|over 2\.5|under 3\.5/.test(value)) score += 18;
  if (bet.includes("double chance")) score += 14;
  if (bet.includes("match winner")) score += 10;
  if (odd >= 1.2 && odd < config.signalWorker.freeOddsMax) score += 15;
  if (odd >= config.signalWorker.freeOddsMax && odd <= 3.5) score += 12;
  if (odd > 4) score -= 8;

  return score;
}

function marketsFromBookmakerOdds(oddsEntry) {
  const markets = [];
  for (const bookmaker of oddsEntry?.bookmakers || []) {
    for (const bet of bookmaker.bets || []) {
      const betName = String(bet.name || bet.label || "Market");
      for (const rawValue of bet.values || []) {
        const value = normalizeOddValue(rawValue);
        if (!value) continue;
        markets.push({
          prediction: readablePredictionFromOdds(betName, value.value),
          odds: value.odd,
          confidence: Math.max(56, Math.min(88, Math.round(96 - value.odd * 10))),
          bookmaker: bookmaker.name,
          priority: oddsPriority(betName, value.value, value.odd)
        });
      }
    }
  }

  return markets
    .sort((left, right) => right.priority - left.priority || left.odds - right.odds)
    .slice(0, 4);
}

function fallbackMarketsForFixture(fixture) {
  const seed = `${fixture.fixture_id || ""}${fixture.home}${fixture.away}`.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  const freeOdd = 1.25 + (seed % 21) / 100;
  const vipOdd = 1.65 + (seed % 86) / 100;
  const favorite = fixturePriority(fixture) >= 90 ? fixture.home : "Either side";

  return [
    {
      prediction: "Over 1.5 goals",
      odds: Number(freeOdd.toFixed(2)),
      confidence: 78 + (seed % 9)
    },
    {
      prediction: favorite === "Either side" ? "Double chance 1X" : `${favorite} win or draw + over 1.5`,
      odds: Number(vipOdd.toFixed(2)),
      confidence: 68 + (seed % 10)
    }
  ];
}

function tipMatchKey(tip) {
  return `${normalizeText(tip.match_name)}|${tip.starts_at || ""}|${normalizeText(tip.league)}`;
}

function uniqueBestTipsByMatch(tips) {
  const byMatch = new Map();
  for (const tip of tips) {
    const key = tipMatchKey(tip);
    const existing = byMatch.get(key);
    if (!existing || Number(tip.confidence || 0) > Number(existing.confidence || 0) || (
      Number(tip.confidence || 0) === Number(existing.confidence || 0) && Number(tip.odds || 0) > Number(existing.odds || 0)
    )) {
      byMatch.set(key, tip);
    }
  }
  return Array.from(byMatch.values());
}

async function fetchOddsByFixtureIds(fixtureIds) {
  if (!config.signalWorker.fixtureApiUrl || !config.signalWorker.fixtureApiKey || !fixtureIds.length) {
    return new Map();
  }

  const oddsUrl = `${config.signalWorker.fixtureApiUrl.replace(/\/$/, "")}/odds`;
  const oddsByFixtureId = new Map();
  const pagesToFetch = [1, 2, 3];

  try {
    for (const page of pagesToFetch) {
      const response = await axios.get(oddsUrl, {
        headers: {
          Authorization: `Bearer ${config.signalWorker.fixtureApiKey}`,
          "x-apisports-key": config.signalWorker.fixtureApiKey,
          "x-api-key": config.signalWorker.fixtureApiKey
        },
        params: {
          date: todayInLagos(),
          timezone: config.signalWorker.timezone,
          page
        },
        timeout: 15000
      });

      const payload = response.data?.odds || response.data?.data || response.data?.response || [];
      if (!Array.isArray(payload) || !payload.length) break;

      for (const entry of payload) {
        const fixtureId = Number(entry.fixture?.id || entry.fixture_id || entry.id || 0);
        if (fixtureIds.includes(fixtureId)) {
          const markets = marketsFromBookmakerOdds(entry);
          if (markets.length) oddsByFixtureId.set(fixtureId, markets);
        }
      }

      const paging = response.data?.paging;
      if (!paging?.total || page >= Number(paging.total)) break;
    }

    const missingFixtureIds = fixtureIds.filter((fixtureId) => !oddsByFixtureId.has(fixtureId));
    for (const fixtureId of missingFixtureIds) {
      const response = await axios.get(oddsUrl, {
        headers: {
          Authorization: `Bearer ${config.signalWorker.fixtureApiKey}`,
          "x-apisports-key": config.signalWorker.fixtureApiKey,
          "x-api-key": config.signalWorker.fixtureApiKey
        },
        params: {
          fixture: fixtureId,
          timezone: config.signalWorker.timezone
        },
        timeout: 15000
      });

      const payload = response.data?.odds || response.data?.data || response.data?.response || [];
      const entries = Array.isArray(payload) ? payload : [];
      for (const entry of entries) {
        const markets = marketsFromBookmakerOdds(entry);
        if (markets.length) {
          oddsByFixtureId.set(fixtureId, markets);
          break;
        }
      }
    }
  } catch (error) {
    console.warn("Fixture odds API unavailable; using varied estimate odds", {
      code: error.code,
      message: error.message
    });
  }

  return oddsByFixtureId;
}

function fixtureApiHeaders() {
  return {
    Authorization: `Bearer ${config.signalWorker.fixtureApiKey}`,
    "x-apisports-key": config.signalWorker.fixtureApiKey,
    "x-api-key": config.signalWorker.fixtureApiKey
  };
}

async function fetchFixtureApi(path, params = {}) {
  if (!config.signalWorker.fixtureApiUrl || !config.signalWorker.fixtureApiKey) return [];

  const url = `${config.signalWorker.fixtureApiUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  try {
    const response = await axios.get(url, {
      headers: fixtureApiHeaders(),
      params,
      timeout: 15000
    });
    const errors = response.data?.errors;
    if (errors && Object.keys(errors).length) {
      throw new Error(`API-Football error: ${Object.values(errors).join("; ")}`);
    }
    const payload = response.data?.response || response.data?.data || response.data?.fixtures || response.data?.odds || [];
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.warn(`API-Football ${path} unavailable`, {
      code: error.code,
      message: error.message
    });
    return [];
  }
}

function normalizeStats(statistics) {
  const [homeStats, awayStats] = Array.isArray(statistics) ? statistics : [];
  const homeMap = new Map((homeStats?.statistics || []).map((item) => [item.type, item.value]));
  const awayMap = new Map((awayStats?.statistics || []).map((item) => [item.type, item.value]));
  const wanted = [
    "Shots on Goal",
    "Shots off Goal",
    "Total Shots",
    "Blocked Shots",
    "Shots insidebox",
    "Shots outsidebox",
    "Fouls",
    "Corner Kicks",
    "Offsides",
    "Ball Possession",
    "Yellow Cards",
    "Red Cards",
    "Goalkeeper Saves",
    "Total passes",
    "Passes accurate",
    "Passes %"
  ];

  return wanted
    .filter((label) => homeMap.has(label) || awayMap.has(label))
    .map((label) => ({
      label,
      home: homeMap.get(label) ?? "0",
      away: awayMap.get(label) ?? "0"
    }));
}

function normalizeLeagueTable(standings) {
  const table = standings?.[0]?.league?.standings?.[0] || standings?.league?.standings?.[0] || [];
  return Array.isArray(table)
    ? table.slice(0, 24).map((row) => ({
        rank: row.rank,
        name: row.team?.name,
        logo: row.team?.logo,
        points: row.points,
        played: row.all?.played,
        won: row.all?.win,
        drawn: row.all?.draw,
        lost: row.all?.lose,
        goalsDiff: row.goalsDiff
      }))
    : [];
}

async function fetchLeagueStandings(leagueId, season) {
  if (!leagueId || !season) return [];
  const seasons = [season, season - 1, season + 1].filter((value, index, list) => value && list.indexOf(value) === index);
  for (const seasonValue of seasons) {
    const response = await fetchFixtureApi("standings", { league: leagueId, season: seasonValue });
    if (normalizeLeagueTable(response).length) return response;
  }
  return [];
}

function normalizeLeagueTeams(teams) {
  return (Array.isArray(teams) ? teams : []).map((row, index) => ({
    rank: index + 1,
    name: row.team?.name || row.name,
    logo: row.team?.logo || row.logo,
    points: null,
    played: null,
    won: null,
    drawn: null,
    lost: null,
    goalsDiff: null
  })).filter((row) => row.name);
}

function footballSeasonFromDate(dateValue) {
  const date = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().getUTCFullYear();
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return month <= 7 ? year - 1 : year;
}

function normalizeH2h(matches, homeTeamId, awayTeamId) {
  return (Array.isArray(matches) ? matches : []).slice(0, 6).map((match) => ({
    id: match.fixture?.id,
    date: match.fixture?.date,
    league: match.league?.name,
    leagueLogo: match.league?.logo,
    home: match.teams?.home?.name,
    away: match.teams?.away?.name,
    homeLogo: match.teams?.home?.logo,
    awayLogo: match.teams?.away?.logo,
    score: `${match.goals?.home ?? "-"}-${match.goals?.away ?? "-"}`,
    homeIsCurrent: Number(match.teams?.home?.id) === Number(homeTeamId),
    awayIsCurrent: Number(match.teams?.away?.id) === Number(awayTeamId)
  }));
}

function teamRecordFromPrediction(team, index) {
  const fixtures = team?.league?.fixtures;
  const wins = Number(fixtures?.wins?.total ?? 0);
  const draws = Number(fixtures?.draws?.total ?? 0);
  const lost = Number(fixtures?.loses?.total ?? 0);
  const played = Number(fixtures?.played?.total ?? wins + draws + lost);
  if (!team?.name || !played) return null;
  return {
    rank: index + 1,
    name: team.name,
    logo: team.logo,
    points: wins * 3 + draws,
    played,
    won: wins,
    drawn: draws,
    lost,
    goalsDiff: Number(team.league?.goals?.for?.total?.total ?? 0) - Number(team.league?.goals?.against?.total?.total ?? 0),
    source: "team-record"
  };
}

function normalizePredictionTeamRecords(prediction) {
  return [prediction?.teams?.home, prediction?.teams?.away]
    .map((team, index) => teamRecordFromPrediction(team, index))
    .filter(Boolean);
}

function normalizeEvents(events) {
  return (Array.isArray(events) ? events : []).map((event) => ({
    time: event.time?.elapsed,
    extra: event.time?.extra,
    team: event.team?.name,
    teamLogo: event.team?.logo,
    player: event.player?.name,
    assist: event.assist?.name,
    type: event.type,
    detail: event.detail,
    comments: event.comments
  }));
}

function normalizeBookmakers(odds) {
  const entry = Array.isArray(odds) ? odds[0] : odds;
  return (entry?.bookmakers || []).slice(0, 4).map((bookmaker) => ({
    id: bookmaker.id,
    name: bookmaker.name,
    markets: (bookmaker.bets || []).slice(0, 6).map((bet) => ({
      name: bet.name,
      values: (bet.values || []).slice(0, 8).map((value) => ({
        value: value.value,
        odd: value.odd
      }))
    }))
  }));
}

function getFixtureIdsFromRow(row) {
  const raw = row?.fixture_payload?.raw || row?.fixture_payload || {};
  return {
    fixtureId: Number(raw.fixture?.id || raw.id || raw.fixture_id || 0),
    leagueId: Number(raw.league?.id || raw.league_id || 0),
    season: Number(raw.league?.season || footballSeasonFromDate(raw.fixture?.date || row?.starts_at)),
    homeTeamId: Number(raw.teams?.home?.id || raw.homeTeam?.id || raw.home_id || 0),
    awayTeamId: Number(raw.teams?.away?.id || raw.awayTeam?.id || raw.away_id || 0)
  };
}

function isNigerianFavoriteEuropeanFixture(fixture) {
  const leagueName = fixture.league.toLowerCase();
  const country = fixture.country.toLowerCase();
  const isCountryCorrectLeagueName = nigerianFavoriteLeagueNames.some((name) => {
    if (!leagueName.includes(name)) return false;
    if (name === "premier league") return country === "england";
    if (name === "championship") return country === "england";
    if (name === "fa cup" || name === "league cup" || name === "efl cup") return country === "england";
    if (name === "la liga") return country === "spain";
    if (name === "serie a") return country === "italy";
    if (name === "bundesliga") return country === "germany";
    if (name === "ligue 1") return country === "france";
    if (name === "eredivisie") return country === "netherlands";
    if (name === "primeira liga") return country === "portugal";
    if (name === "super lig") return country === "turkey";
    if (name === "scottish premiership") return country === "scotland";
    return country === "europe";
  });
  const isFavoriteLeague = nigerianFavoriteLeagueIds.has(fixture.league_id) || isCountryCorrectLeagueName;
  const isFavoriteCountry = nigerianFavoriteCountries.has(country);
  const isYouthOrWomen = /\b(u17|u18|u19|u20|u21|women|w\b|reserve|reserves|ii\b|iii\b|regional|oberliga|landesliga)\b/i.test(
    `${fixture.league} ${fixture.home} ${fixture.away}`
  );

  return isFavoriteLeague && isFavoriteCountry && !isYouthOrWomen;
}

function isCleanSeniorFixture(fixture) {
  return !/\b(u17|u18|u19|u20|u21|women|w\b|reserve|reserves|ii\b|iii\b|regional|oberliga|landesliga|youth|amateur|friendly women)\b/i.test(
    `${fixture.league} ${fixture.home} ${fixture.away}`
  );
}

function isRelativeFootballFixture(fixture) {
  const leagueName = fixture.league.toLowerCase();
  const country = fixture.country.toLowerCase();
  const isKnownRelativeLeague = relativeFootballLeagueNames.some((name) => leagueName.includes(name));
  const hasRecognizableClub = /\b(celtic|ajax|psv|feyenoord|benfica|porto|sporting|galatasaray|fenerbahce|besiktas|al hilal|al nassr|inter miami|flamengo|palmeiras|river plate|boca juniors|kaizer|orlando pirates|sundowns|al ahly|zamalek|enyimba)\b/i.test(
    `${fixture.home} ${fixture.away}`
  );

  return isCleanSeniorFixture(fixture) && (isKnownRelativeLeague || hasRecognizableClub || country === "nigeria");
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
  if (leagueName.includes("major league soccer") || leagueName.includes("mls")) score += 50;
  if (leagueName.includes("brasileiro") || leagueName.includes("primera division")) score += 48;
  if (leagueName.includes("saudi pro league")) score += 45;
  if (leagueName.includes("caf") || leagueName.includes("africa cup") || country === "nigeria") score += 44;
  if (country === "europe") score += 20;
  if (["england", "spain", "italy", "germany", "france"].includes(country)) score += 12;
  if (relativeFootballCountries.has(country)) score += 6;
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
  const dates = boardDates();
  if (!config.signalWorker.fixtureApiUrl || !config.signalWorker.fixtureApiKey) {
    return fetchSportsDbFixtures(dates);
  }

  const fixtureUrl = config.signalWorker.fixtureApiUrl.endsWith("/fixtures")
    ? config.signalWorker.fixtureApiUrl
    : `${config.signalWorker.fixtureApiUrl.replace(/\/$/, "")}/fixtures`;

  try {
    const fixtures = [];

    for (const date of dates) {
      const response = await axios.get(fixtureUrl, {
        headers: {
          Authorization: `Bearer ${config.signalWorker.fixtureApiKey}`,
          "x-apisports-key": config.signalWorker.fixtureApiKey,
          "x-api-key": config.signalWorker.fixtureApiKey
        },
        params: {
          date,
          timezone: config.signalWorker.timezone
        },
        timeout: 15000
      });

      const errors = response.data?.errors;
      if (errors && Object.keys(errors).length) {
        throw new Error(`API-Football error: ${Object.values(errors).join("; ")}`);
      }

      const payload = response.data?.fixtures || response.data?.data || response.data?.response || response.data;
      if (Array.isArray(payload)) fixtures.push(...payload.map(normalizeFixture));
    }

    return fixtures.length ? fixtures : fetchSportsDbFixtures(dates);
  } catch (error) {
    console.warn("Fixture API unavailable; falling back to TheSportsDB", {
      code: error.code,
      message: error.message
    });
    return fetchSportsDbFixtures(dates);
  }
}

async function fetchSportsDbFixtures(dates = boardDates()) {
  if (!config.signalWorker.sportsDbApiKey) return defaultFixtures;
  const fixtures = [];

  for (const date of dates) {
    try {
      const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/${config.signalWorker.sportsDbApiKey}/eventsday.php`, {
        params: { d: date, s: "Soccer" },
        timeout: 15000
      });
      const events = Array.isArray(response.data?.events) ? response.data.events : [];
      fixtures.push(...events.map(normalizeSportsDbEvent));
    } catch (error) {
      console.warn("TheSportsDB fixture fallback unavailable", {
        code: error.code,
        message: error.message
      });
    }
  }

  return fixtures.length ? fixtures : defaultFixtures;
}

async function buildTipCandidates(fixtures) {
  const tips = [];
  const freeLimit = Math.min(config.signalWorker.freeLimit, maxDailyPublishedTips);
  const vipLimit = Math.min(config.signalWorker.vipLimit, Math.max(maxDailyPublishedTips - freeLimit, 0));
  const playableStatuses = new Set(["NS", "TBD", "1H", "HT", "2H", "ET", "P", "BT", "LIVE"]);
  const now = Date.now();
  const normalizedFixtures = fixtures
    .map(normalizeFixture)
    .filter((fixture) => {
      const startsAtTime = new Date(fixture.starts_at).getTime();
      const isFutureOrLive = Number.isNaN(startsAtTime) || startsAtTime >= now - 60 * 60 * 1000;
      return playableStatuses.has(fixture.status.toUpperCase())
        && isFutureOrLive
        && isCleanSeniorFixture(fixture);
    });
  const targetCount = Math.max(freeLimit + vipLimit, 1);
  const primaryFixtures = normalizedFixtures.filter(isNigerianFavoriteEuropeanFixture);
  const primaryKeys = new Set(primaryFixtures.map((fixture) => `${fixture.fixture_id || ""}|${fixture.home}|${fixture.away}|${fixture.starts_at}`));
  const relativeFixtures = normalizedFixtures
    .filter((fixture) => !primaryKeys.has(`${fixture.fixture_id || ""}|${fixture.home}|${fixture.away}|${fixture.starts_at}`))
    .filter(isRelativeFootballFixture);
  const preferredKeys = new Set([...primaryFixtures, ...relativeFixtures].map((fixture) => `${fixture.fixture_id || ""}|${fixture.home}|${fixture.away}|${fixture.starts_at}`));
  const fallbackFixtures = normalizedFixtures
    .filter((fixture) => !preferredKeys.has(`${fixture.fixture_id || ""}|${fixture.home}|${fixture.away}|${fixture.starts_at}`))
    .filter(isCleanSeniorFixture);
  const selectedFixtures = [...primaryFixtures, ...relativeFixtures, ...fallbackFixtures]
    .sort((left, right) => {
      const priorityDiff = fixturePriority(right) - fixturePriority(left);
      if (priorityDiff) return priorityDiff;
      return new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime();
    })
    .slice(0, targetCount);

  const selectedFixtureIds = selectedFixtures.map((fixture) => fixture.fixture_id).filter(Boolean);
  const oddsByFixtureId = await fetchOddsByFixtureIds(selectedFixtureIds);

  for (const fixture of selectedFixtures) {
    const markets = oddsByFixtureId.get(fixture.fixture_id)
      || (fixture.markets.length ? fixture.markets.map(normalizeMarket) : fallbackMarketsForFixture(fixture));

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

  const freemium = uniqueBestTipsByMatch(tips
    .filter((tip) => !tip.is_vip && Number(tip.odds) < config.signalWorker.freeOddsMax)
    .sort((a, b) => b.confidence - a.confidence))
    .slice(0, freeLimit);
  const freeMatchKeys = new Set(freemium.map(tipMatchKey));

  const vip = uniqueBestTipsByMatch(tips
    .filter((tip) => tip.is_vip && !freeMatchKeys.has(tipMatchKey(tip)))
    .sort((a, b) => b.confidence - a.confidence))
    .slice(0, vipLimit);

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
  const candidates = await buildTipCandidates(fixtures);
  const dates = boardDates();
  await Promise.all(dates.map((date) => deleteDailyGamesBySource(date, "fixture-api")));

  const candidatesByDate = candidates.reduce((groups, candidate) => {
    const date = signalDateFromStartsAt(candidate.starts_at);
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date).push(candidate);
    return groups;
  }, new Map());
  const savedDailyGames = [];
  for (const [gameDate, dateCandidates] of candidatesByDate.entries()) {
    savedDailyGames.push(...await upsertDailyGames(gameDate, dateCandidates));
  }
  const results = [];

  for (const candidate of candidates) {
    results.push(await publishDailyTip(candidate, { broadcast: options.broadcast !== false }));
  }

  return {
    ok: true,
    date: todayInLagos(),
    dates,
    timezone: config.signalWorker.timezone,
    stored: savedDailyGames.length,
    freemium: results.filter((item) => !item.tip.is_vip).length,
    vip: results.filter((item) => item.tip.is_vip).length,
    results
  };
}

const liveRefreshStatuses = new Set(["NS", "TBD", "1H", "HT", "2H", "ET", "P", "BT", "INT", "LIVE"]);
const finishedStatuses = new Set(["FT", "AET", "PEN"]);
let lastStatusRefreshAt = 0;

function fixtureIdFromPayload(payload) {
  const raw = payload?.raw || payload || {};
  return Number(raw.fixture?.id || raw.id || raw.fixture_id || 0);
}

function fixtureResultPayload(fixture) {
  const home = fixture?.goals?.home ?? fixture?.score?.fulltime?.home;
  const away = fixture?.goals?.away ?? fixture?.score?.fulltime?.away;
  return {
    score: typeof home === "number" && typeof away === "number" ? `${home}-${away}` : null,
    result: fixture,
    refreshed_at: new Date().toISOString()
  };
}

export async function refreshDailyGameStatuses({ force = false } = {}) {
  await ensureDailyGamesTable();
  if (!config.signalWorker.fixtureApiUrl || !config.signalWorker.fixtureApiKey) {
    return { ok: false, skipped: true, reason: "Fixture API is not configured" };
  }
  const now = Date.now();
  if (!force && now - lastStatusRefreshAt < 2 * 60 * 1000) {
    return { ok: true, skipped: true, reason: "recently_refreshed" };
  }
  lastStatusRefreshAt = now;

  const dates = boardDates();
  const storedResult = await query(
    `select id, game_date, status, starts_at, fixture_payload
     from daily_games
     where game_date = any($1::date[])
       and status not in ('won', 'lost', 'void')
     order by starts_at asc nulls last
     limit 60`,
    [dates]
  );

  if (!storedResult.rows.length) return { ok: true, dates, updated: 0 };

  const snapshots = new Map();
  for (const date of dates) {
    const fixtures = await fetchFixtureApi("fixtures", { date, timezone: config.signalWorker.timezone });
    for (const fixture of fixtures) {
      const fixtureId = Number(fixture?.fixture?.id || fixture?.id || fixture?.fixture_id || 0);
      if (fixtureId) snapshots.set(fixtureId, fixture);
    }
  }

  let updated = 0;
  for (const row of storedResult.rows) {
    const fixtureId = fixtureIdFromPayload(row.fixture_payload);
    const fixture = snapshots.get(fixtureId);
    if (!fixture) continue;

    const status = String(fixture?.fixture?.status?.short || fixture?.status || row.status || "NS").toUpperCase();
    if (!liveRefreshStatuses.has(status) && !finishedStatuses.has(status)) continue;

    if (finishedStatuses.has(status)) {
      await query(
        `update daily_games
         set fixture_payload = $1,
             result_payload = $2,
             updated_at = now()
         where id = $3`,
        [fixture, fixtureResultPayload(fixture), row.id]
      );
    } else {
      await query(
        `update daily_games
         set status = $1,
             starts_at = coalesce($2, starts_at),
             fixture_payload = $3,
             result_payload = $4,
             updated_at = now()
         where id = $5`,
        [status, fixture?.fixture?.date || null, fixture, fixtureResultPayload(fixture), row.id]
      );
    }
    updated += 1;
  }

  return { ok: true, dates, updated };
}

async function seedDailyBoardIfEmpty() {
  const dates = boardDates();
  const existing = await query(
    `select count(*)::int as count
     from daily_games
     where game_date = any($1::date[])`,
    [dates]
  );
  if (Number(existing.rows[0]?.count || 0) > 0) return { seeded: false };

  const fixtures = await fetchCandidateFixtures();
  const candidates = await buildTipCandidates(fixtures);
  const groups = candidates.reduce((map, candidate) => {
    const date = signalDateFromStartsAt(candidate.starts_at);
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(candidate);
    return map;
  }, new Map());
  let stored = 0;
  for (const [date, tips] of groups.entries()) {
    stored += (await upsertDailyGames(date, tips)).length;
  }
  return { seeded: true, stored };
}

export async function getDailyGames() {
  await ensureDailyGamesTable();
  await seedDailyBoardIfEmpty();
  await refreshDailyGameStatuses().catch((error) => {
    console.warn("Daily game status refresh failed", {
      code: error.code,
      message: error.message
    });
  });

  const dates = boardDates();

  const dailyResult = await query(
    `select *
     from daily_games
     where game_date = any($1::date[])
     order by is_vip asc, confidence desc nulls last, starts_at asc nulls last, created_at desc`,
    [dates]
  );

  if (dailyResult.rows.length) {
    return {
      ok: true,
      date: todayInLagos(),
      dates,
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
      dates,
      source: "empty",
      freemium: [],
      vip: []
    };
  }

  return {
    ok: true,
    date: todayInLagos(),
    dates,
    source: "database",
    freemium: result.rows.filter((tip) => !tip.is_vip),
    vip: result.rows.filter((tip) => tip.is_vip)
  };
}

export async function getEvidenceGames(limit = 30) {
  await ensureDailyGamesTable();
  await ensureTipsTable();

  const safeLimit = Math.max(1, Math.min(Number(limit) || 30, 50));
  const result = await query(
    `select *
     from (
       select
         id::text,
         match_name,
         league,
         prediction,
         odds,
         confidence,
         is_vip,
         booking_codes,
         source,
         status,
         starts_at,
         fixture_payload,
         result_payload,
         updated_at,
         created_at,
         'daily_games' as evidence_source
       from daily_games
       where status in ('won', 'lost', 'void', 'finished', 'FT', 'AET', 'PEN')
          or result_payload is not null
       union all
       select
         id::text,
         match_name,
         league,
         prediction,
         odds,
         confidence,
         is_vip,
         booking_codes,
         source,
         status,
         starts_at,
         fixture_payload,
         result_payload,
         updated_at,
         created_at,
         'tips' as evidence_source
       from tips
       where status in ('won', 'lost', 'void', 'finished', 'FT', 'AET', 'PEN')
          or result_payload is not null
     ) as settled
     order by coalesce(starts_at, updated_at, created_at) desc
     limit $1`,
    [safeLimit]
  );

  const seen = new Set();
  const games = [];
  for (const row of result.rows) {
    const key = `${normalizeText(row.match_name)}|${normalizeText(row.prediction)}|${row.starts_at || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    games.push(row);
  }

  return {
    ok: true,
    limit: safeLimit,
    games
  };
}

export async function getMatchDetails(id) {
  await ensureDailyGamesTable();

  const dailyResult = await query(
    `select *
     from daily_games
     where id::text = $1
     limit 1`,
    [String(id)]
  );
  const row = dailyResult.rows[0];
  if (!row) return null;

  const raw = row.fixture_payload?.raw || row.fixture_payload || {};
  const ids = getFixtureIdsFromRow(row);
  const h2hKey = ids.homeTeamId && ids.awayTeamId ? `${ids.homeTeamId}-${ids.awayTeamId}` : "";

  const [predictions, statistics, events, h2h, standings, leagueTeams, odds] = await Promise.all([
    ids.fixtureId ? fetchFixtureApi("predictions", { fixture: ids.fixtureId }) : [],
    ids.fixtureId ? fetchFixtureApi("fixtures/statistics", { fixture: ids.fixtureId }) : [],
    ids.fixtureId ? fetchFixtureApi("fixtures/events", { fixture: ids.fixtureId }) : [],
    h2hKey ? fetchFixtureApi("fixtures/headtohead", { h2h: h2hKey, last: 8 }) : [],
    ids.leagueId ? fetchLeagueStandings(ids.leagueId, ids.season) : [],
    ids.leagueId ? fetchFixtureApi("teams", { league: ids.leagueId, season: ids.season }) : [],
    ids.fixtureId ? fetchFixtureApi("odds", { fixture: ids.fixtureId, timezone: config.signalWorker.timezone }) : []
  ]);
  const prediction = predictions[0] || null;
  const leagueTable = normalizeLeagueTable(standings);
  const leagueClubList = normalizeLeagueTeams(leagueTeams);
  const directH2h = normalizeH2h(h2h, ids.homeTeamId, ids.awayTeamId);

  return {
    ok: true,
    game: row,
    fixture: raw,
    predictions: prediction,
    statistics: normalizeStats(statistics),
    events: normalizeEvents(events),
    h2h: directH2h.length ? directH2h : normalizeH2h(prediction?.h2h, ids.homeTeamId, ids.awayTeamId),
    standings: leagueTable.length ? leagueTable : leagueClubList.length ? leagueClubList : normalizePredictionTeamRecords(prediction),
    bookmakers: normalizeBookmakers(odds),
    refreshed_at: new Date().toISOString()
  };
}
