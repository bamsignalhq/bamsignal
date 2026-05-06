import { config } from "../config.js";

function timezoneDateParts(date = new Date(), timezone = config.signalWorker.timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  }).formatToParts(date);
  const read = (type) => parts.find((part) => part.type === type)?.value || "";
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    weekday: read("weekday").toLowerCase()
  };
}

function nextDateForWeekday(weekdayLabel, timezone = config.signalWorker.timezone) {
  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const now = new Date();
  const today = timezoneDateParts(now, timezone);
  const currentIndex = weekdays.indexOf(today.weekday.slice(0, 3));
  const targetIndex = weekdays.indexOf(String(weekdayLabel || "").slice(0, 3).toLowerCase());
  if (currentIndex === -1 || targetIndex === -1) return `${today.year}-${today.month}-${today.day}`;
  const diff = (targetIndex - currentIndex + 7) % 7;
  const target = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
  const parts = timezoneDateParts(target, timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function normalizeStartsAtInput(value, timezone = config.signalWorker.timezone) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const isoDateTime = raw.match(/\b(\d{4}-\d{2}-\d{2})[ T]([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (isoDateTime) {
    return new Date(`${isoDateTime[1]}T${isoDateTime[2].padStart(2, "0")}:${isoDateTime[3]}:00+01:00`).toISOString();
  }

  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();

  const weekdayMatch = raw.match(/\b(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\b/i);
  const explicitDate = raw.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  const timeMatch = raw
    .replace(/\b(?:wat|west|gmt[+-]?\d*|utc[+-]?\d*)\b/gi, " ")
    .match(/\b([01]?\d|2[0-3]):([0-5]\d)\s*(am|pm)?\b/i);
  if (!timeMatch) return null;

  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const suffix = String(timeMatch[3] || "").toLowerCase();
  if (suffix && hour <= 12) {
    if (suffix === "pm" && hour < 12) hour += 12;
    if (suffix === "am" && hour === 12) hour = 0;
  }

  let datePart = "";
  if (explicitDate) {
    const [, day, month, year] = explicitDate;
    const normalizedYear = year ? (year.length === 2 ? `20${year}` : year) : timezoneDateParts(new Date(), timezone).year;
    datePart = `${normalizedYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  } else if (weekdayMatch) {
    datePart = nextDateForWeekday(weekdayMatch[1], timezone);
  } else {
    const today = timezoneDateParts(new Date(), timezone);
    datePart = `${today.year}-${today.month}-${today.day}`;
  }

  return new Date(`${datePart}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+01:00`).toISOString();
}

function splitMatchName(match = "") {
  const [home, ...rest] = String(match).split(/\s+vs\s+/i);
  return {
    home: String(home || "").trim(),
    away: String(rest.join(" vs ") || "").trim()
  };
}

function possessiveName(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "The side's";
  return /s$/i.test(trimmed) ? `${trimmed}'` : `${trimmed}'s`;
}

export function generatedPredictionReason(match = "", prediction = "") {
  const teams = splitMatchName(match);
  const home = teams.home || "The home side";
  const away = teams.away || "the away side";
  const normalizedPick = String(prediction || "").trim().toLowerCase();

  if (normalizedPick.includes("home win") && normalizedPick.includes("over 1.5")) {
    return `${possessiveName(home)} home control and the expected tempo support a win with goals.`;
  }
  if (normalizedPick.includes("away win") && normalizedPick.includes("over 1.5")) {
    return `${possessiveName(away)} stronger attacking profile and match tempo support the away win with goals.`;
  }
  if (normalizedPick.includes("double chance 1x")) {
    return `${possessiveName(home)} home edge makes the safer double-chance angle attractive.`;
  }
  if (normalizedPick.includes("double chance x2")) {
    return `${possessiveName(away)} resilience and matchup stability support the safer away-side double chance.`;
  }
  if (normalizedPick.includes("over 1.5")) {
    return "Recent scoring patterns and open-match potential point toward at least two goals.";
  }
  if (normalizedPick.includes("over 2.5")) {
    return "Both sides carry enough attacking intent to support a higher-scoring game.";
  }
  if (normalizedPick.includes("under 3.5")) {
    return "Game control and recent scoring trends keep the total in a safer range.";
  }
  if (normalizedPick.includes("btts") || normalizedPick.includes("both teams to score")) {
    return "Both teams create enough threat to find the net in this matchup.";
  }
  if (normalizedPick.includes("corners")) {
    return "Wide play, pressure, and crossing volume all support the corner angle.";
  }
  if (normalizedPick.includes("draw")) {
    return "The matchup looks balanced enough for a tighter result than the market suggests.";
  }
  if (normalizedPick.includes(home.toLowerCase()) && normalizedPick.includes("win")) {
    return `${possessiveName(home)} home dominance and attacking depth make them the better side here.`;
  }
  if (normalizedPick.includes(away.toLowerCase()) && normalizedPick.includes("win")) {
    return `${possessiveName(away)} recent form and sharper attacking quality make them the stronger side here.`;
  }
  if (normalizedPick.includes("to win")) {
    const target = normalizedPick.includes(home.toLowerCase()) ? home : normalizedPick.includes(away.toLowerCase()) ? away : home;
    return `${possessiveName(target)} stronger form and attacking depth make this the better win angle.`;
  }
  return "Form, venue, and market shape all point toward this angle.";
}

export function applyPredictionReason(tip, explicitReason = "") {
  const fixturePayload = tip?.fixture_payload && typeof tip.fixture_payload === "object" ? tip.fixture_payload : {};
  const metadata = fixturePayload.metadata && typeof fixturePayload.metadata === "object" ? fixturePayload.metadata : {};
  const reason = String(
    explicitReason
    || tip?.prediction_reason
    || metadata.public_reason
    || metadata.prediction_reason
    || metadata.rationale
    || ""
  ).trim() || generatedPredictionReason(tip?.match_name || "", tip?.prediction || "");

  return {
    ...tip,
    prediction_reason: reason,
    fixture_payload: {
      ...fixturePayload,
      metadata: {
        ...metadata,
        public_reason: reason,
        prediction_reason: reason
      }
    }
  };
}
