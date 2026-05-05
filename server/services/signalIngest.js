const defaultTimezone = "Africa/Lagos";

function clean(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function autoValue(value = "") {
  const normalized = clean(value).toLowerCase();
  return !normalized || normalized === "auto" || normalized.includes("detect");
}

function toBool(value, fallback = false) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "yes", "y", "1", "vip", "premium"].includes(normalized)) return true;
  if (["false", "no", "n", "0", "free", "freemium"].includes(normalized)) return false;
  return fallback;
}

function toNumber(value, fallback = null) {
  const number = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function tierFromOdds(odds) {
  return Number(odds) >= 1.5;
}

function sourceLabel(options = {}) {
  return clean(options.sourceName || options.source || "admin-ingest");
}

function inferSport(text = "", fallback = "Football") {
  const raw = clean(text).toLowerCase();
  if (/\b(nba|wnba|basketball|nbl|euroleague|points|rebounds|assists)\b/.test(raw)) return "Basketball";
  if (/\b(mlb|baseball|innings?|runs?|pitcher)\b/.test(raw)) return "Baseball";
  if (/\b(nfl|american football|touchdown|yards?|quarterback)\b/.test(raw)) return "American Football";
  if (/\b(nhl|ice hockey|hockey|puck)\b/.test(raw)) return "Ice Hockey";
  if (/\b(tennis|atp|wta|sets?|games handicap)\b/.test(raw)) return "Tennis";
  if (/\b(football|soccer|premier league|la liga|serie a|bundesliga|ligue 1|champions league|europa league|goals?|corners?|btts)\b/.test(raw)) return "Football";
  return autoValue(fallback) ? "Football" : clean(fallback || "Football");
}

function inferLeague(text = "", sport = "Football", fallback = "") {
  if (!autoValue(fallback)) return clean(fallback);
  const raw = clean(text).toLowerCase();
  const leagues = [
    ["Champions League", /\b(champions league|ucl)\b/],
    ["Europa League", /\b(europa league|uel)\b/],
    ["Premier League", /\b(premier league|epl|english premier)\b/],
    ["La Liga", /\b(la liga|laliga|spanish league)\b/],
    ["Serie A", /\b(serie a|italian league)\b/],
    ["Bundesliga", /\b(bundesliga|german league)\b/],
    ["Ligue 1", /\b(ligue 1|french league)\b/],
    ["NBA", /\b(nba)\b/],
    ["WNBA", /\b(wnba)\b/],
    ["MLB", /\b(mlb)\b/],
    ["NFL", /\b(nfl)\b/],
    ["NHL", /\b(nhl)\b/],
    ["ATP", /\b(atp)\b/],
    ["WTA", /\b(wta)\b/]
  ];
  const found = leagues.find(([, pattern]) => pattern.test(raw));
  if (found) return found[0];

  if (/\b(arsenal|chelsea|liverpool|manchester united|man united|man city|manchester city|tottenham|newcastle|aston villa|west ham|brighton|everton)\b/.test(raw)) return "Premier League";
  if (/\b(real madrid|barcelona|atletico|sevilla|villarreal|valencia|real sociedad|athletic bilbao)\b/.test(raw)) return "La Liga";
  if (/\b(inter|ac milan|milan|juventus|napoli|roma|lazio|atalanta|fiorentina)\b/.test(raw)) return "Serie A";
  if (/\b(bayern|dortmund|leverkusen|rb leipzig|stuttgart|frankfurt|wolfsburg)\b/.test(raw)) return "Bundesliga";
  if (/\b(psg|paris saint germain|marseille|lyon|monaco|lille|rennes)\b/.test(raw)) return "Ligue 1";
  if (/\b(lakers|warriors|celtics|knicks|heat|bulls|mavericks|bucks|nuggets|suns|clippers)\b/.test(raw)) return "NBA";
  if (/\b(yankees|dodgers|mets|red sox|cubs|braves|astros|giants|padres)\b/.test(raw)) return "MLB";
  if (/\b(chiefs|cowboys|eagles|patriots|packers|steelers|ravens|49ers|bills)\b/.test(raw)) return "NFL";
  if (/\b(maple leafs|rangers|bruins|oilers|canadiens|avalanche|panthers)\b/.test(raw)) return "NHL";
  return sport;
}

function todayInTimezone(timezone = defaultTimezone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(header = "") {
  return clean(header)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function hasStructuredHeader(headers) {
  const set = new Set(headers.map(normalizeHeader));
  return set.has("home_team") || set.has("home") || set.has("match") || set.has("fixture") || set.has("prediction");
}

function rowValue(row, names, fallback = "") {
  for (const name of names) {
    const key = normalizeHeader(name);
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") return row[key];
  }
  return fallback;
}

function splitMatch(match = "") {
  const parts = clean(match).split(/\s+(?:vs|v|@|-)\s+/i);
  return {
    home: clean(parts[0] || ""),
    away: clean(parts.slice(1).join(" ") || "")
  };
}

function parseTime(value, dateHint = "") {
  const raw = clean(value);
  if (!raw) return null;
  const dateTimeMatch = raw.match(/\b(\d{4}-\d{2}-\d{2})[ T]([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (dateTimeMatch) {
    return new Date(`${dateTimeMatch[1]}T${dateTimeMatch[2].padStart(2, "0")}:${dateTimeMatch[3]}:00+01:00`).toISOString();
  }
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();

  const timeMatch = raw.match(/\b([01]?\d|2[0-3]):([0-5]\d)\s*(am|pm)?\b/i);
  if (!timeMatch) return null;
  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const suffix = String(timeMatch[3] || "").toLowerCase();
  if (suffix === "pm" && hour < 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;
  const date = dateHint || todayInTimezone();
  return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+01:00`).toISOString();
}

function logoFromRow(row, type) {
  return clean(rowValue(row, [
    `${type}_logo_url`,
    `${type}_logo`,
    `${type}Logo`,
    type === "league" ? "league_badge" : ""
  ]));
}

function tipFromStructuredRow(row, options = {}, index = 0) {
  const rawText = Object.values(row || {}).join(" ");
  const sport = inferSport(rawText, rowValue(row, ["sport"], options.defaultSport || "auto"));
  const match = clean(rowValue(row, ["match", "fixture", "game"]));
  const split = splitMatch(match);
  const home = clean(rowValue(row, ["home_team", "home", "team_a"], split.home));
  const away = clean(rowValue(row, ["away_team", "away", "team_b"], split.away));
  const prediction = clean(rowValue(row, ["prediction", "pick", "market", "signal"]));
  const odds = toNumber(rowValue(row, ["odds", "price"], ""), null);
  if (!home || !away || !prediction || !odds) return null;

  const isVip = tierFromOdds(odds);
  const confidence = toNumber(rowValue(row, ["confidence", "confidence_percent", "probability", "percent"], ""), isVip ? 76 : 82);
  const matchTime = parseTime(rowValue(row, ["match_time", "starts_at", "kickoff", "time", "date"], ""), rowValue(row, ["date"], ""));
  const bookmaker = clean(rowValue(row, ["bookmaker", "bookie"], ""));
  const bookingCode = clean(rowValue(row, ["booking_code", "code"], ""));
  const bookingCodes = {};
  if (bookmaker && bookingCode) bookingCodes[bookmaker] = bookingCode;
  const league = clean(rowValue(row, ["league", "competition"], inferLeague(rawText, sport, options.defaultLeague || "auto")));

  return {
    match_name: `${home} vs ${away}`,
    league,
    prediction,
    odds: odds.toFixed(2),
    confidence: Math.max(1, Math.min(99, Math.round(confidence || 70))),
    is_vip: isVip,
    booking_codes: bookingCodes,
    source: "admin-ingest",
    status: clean(rowValue(row, ["status"], "pending")).toLowerCase() || "pending",
    starts_at: matchTime,
    fixture_payload: {
      provider: "admin-ingest",
      sport,
      ingest_index: index,
      fixture: {
        id: clean(rowValue(row, ["match_id", "fixture_id", "external_id"], "")) || `admin-${Date.now()}-${index}`,
        date: matchTime,
        status: { short: "NS", long: "Scheduled" }
      },
      league: {
        name: league,
        logo: logoFromRow(row, "league") || null,
        country: clean(rowValue(row, ["country"], ""))
      },
      teams: {
        home: { name: home, logo: logoFromRow(row, "home") || null },
        away: { name: away, logo: logoFromRow(row, "away") || null }
      },
      metadata: {
        source_name: sourceLabel(options),
        raw: row
      }
    }
  };
}

function parseStructuredText(text, options) {
  const rows = parseCsvRows(text);
  if (rows.length < 2 || !hasStructuredHeader(rows[0])) return [];
  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1)
    .map((values, index) => {
      const row = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] || ""]));
      return tipFromStructuredRow(row, options, index);
    })
    .filter(Boolean);
}

function parseFreeformLine(line, options = {}, index = 0) {
  const normalized = clean(line);
  if (!normalized || normalized.length < 8) return null;
  const match = normalized.match(/(.+?)\s+(?:vs|v|@)\s+(.+)/i);
  if (!match) return null;
  const home = clean(match[1]);
  const afterAway = clean(match[2]);
  const chunks = afterAway.split(/\s*(?:\||—| - )\s*/).map(clean).filter(Boolean);
  let away = chunks.shift() || "";
  let tail = chunks.join(" | ");

  if (!tail) {
    const fallback = away.match(/^(.+?)\s+(over|under|btts|both teams|home|away|draw|double chance|win|first half|correct score).+$/i);
    if (!fallback) return null;
    away = clean(fallback[1]);
    tail = clean(away.slice(fallback[1].length));
  }

  const oddMatches = [...tail.matchAll(/\b([1-9]\d*\.\d{1,2})\b/g)];
  const oddsMatch = oddMatches[oddMatches.length - 1];
  const odds = toNumber(oddsMatch?.[1], null);
  if (!odds) return null;
  tail = clean(tail.replace(oddsMatch[0], ""));

  const timeMatch = tail.match(/\b(?:today|tomorrow|mon|tue|wed|thu|fri|sat|sun)?\s*\d{1,2}:\d{2}\s*(?:am|pm|wat|gmt)?\b/i);
  const startsAt = timeMatch ? parseTime(timeMatch[0]) : null;
  if (timeMatch) tail = clean(tail.replace(timeMatch[0], ""));

  const leagueMatch = tail.match(/\b(?:league|competition)[:\-]\s*([^|]+)$/i);
  const sport = inferSport(line, options.defaultSport || "auto");
  const league = leagueMatch ? clean(leagueMatch[1]) : inferLeague(line, sport, options.defaultLeague || "auto");
  if (leagueMatch) tail = clean(tail.replace(leagueMatch[0], ""));

  away = away.replace(/\s+(?:prediction|pick|odds?)\b.*$/i, "").trim();
  const prediction = tail
    .replace(/\b(?:prediction|pick|market)[:\-]\s*/i, "")
    .replace(/[|\-—]+$/g, "")
    .trim() || "Over 1.5 goals";
  const isVip = tierFromOdds(odds);

  return {
    match_name: `${home} vs ${away}`,
    league,
    prediction,
    odds: odds.toFixed(2),
    confidence: isVip ? 76 : 82,
    is_vip: isVip,
    booking_codes: {},
    source: "admin-ingest",
    status: "pending",
    starts_at: startsAt,
    fixture_payload: {
      provider: "admin-ingest",
      sport,
      ingest_index: index,
      fixture: {
        id: `admin-${Date.now()}-${index}`,
        date: startsAt,
        status: { short: "NS", long: "Scheduled" }
      },
      league: { name: league, logo: null, country: "" },
      teams: {
        home: { name: home, logo: null },
        away: { name: away, logo: null }
      },
      metadata: { source_name: sourceLabel(options), raw_line: line }
    }
  };
}

function parseFreeformText(text, options) {
  return text
    .split(/\n+/)
    .map((line, index) => parseFreeformLine(line, options, index))
    .filter(Boolean);
}

export function parseSignalsFromText(text, options = {}) {
  const source = String(text || "").trim();
  if (!source) return [];

  let jsonSignals = [];
  try {
    const parsed = JSON.parse(source);
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.signals) ? parsed.signals : [];
    jsonSignals = list.map((row, index) => tipFromStructuredRow(row, options, index)).filter(Boolean);
  } catch {
    jsonSignals = [];
  }
  if (jsonSignals.length) return jsonSignals;

  const structured = parseStructuredText(source, options);
  if (structured.length) return structured;

  return parseFreeformText(source, options);
}

export function gameDateForTip(tip, timezone = defaultTimezone) {
  const date = tip.starts_at ? new Date(tip.starts_at) : new Date();
  if (Number.isNaN(date.getTime())) return todayInTimezone(timezone);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}
