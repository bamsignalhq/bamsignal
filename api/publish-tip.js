import { config } from "../server/config.js";
import { deleteDailyGamesBySource, ensureDailyGamesTable, ensureTipsTable, insertTip, isPlatformAdminEmail, query, upsertDailyGames } from "../server/db.js";
import { sendTipPush } from "../server/firebase.js";
import { broadcastTip } from "../server/telegram.js";
import { enrichTipWithFixture } from "../server/services/signalWorker.js";
import { gameDateForTip, parseSignalsFromText } from "../server/services/signalIngest.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function todayInLagos() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: config.signalWorker.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

async function verifySupabaseAdmin(req) {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!bearer || !supabaseUrl || !supabaseAnonKey) return false;

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${bearer}`
    }
  });
  if (!response.ok) return false;
  const user = await response.json();
  const email = String(user.email || "").toLowerCase();
  return adminEmails.includes(email) || await isPlatformAdminEmail(email);
}

async function isAuthorized(req) {
  const allowedSecrets = [config.signalWorker.secret, config.cronSecret].filter(Boolean);
  const provided = req.headers["x-bamsignal-secret"] || req.query.secret;
  if (provided && allowedSecrets.includes(provided)) return { ok: true };
  if (await verifySupabaseAdmin(req)) return { ok: true };
  if (!allowedSecrets.length && !process.env.ADMIN_EMAILS) {
    return { ok: false, status: 503, error: "Admin authentication is not configured in Vercel yet." };
  }
  if (!provided) return { ok: false, status: 401, error: "Log in as an approved BamSignal admin account before publishing." };
  if (!allowedSecrets.includes(provided)) return { ok: false, status: 401, error: "Admin recovery credential is incorrect." };
  return { ok: true };
}

function splitMatchName(match = "") {
  const [home, ...rest] = String(match).split(/\s+vs\s+/i);
  return {
    home: String(home || "").trim(),
    away: String(rest.join(" vs ") || "").trim()
  };
}

function normalizeDirectSignal(signal = {}, payload = {}, index = 0) {
  const matchName = String(signal.match_name || signal.match || signal.fixture || "").trim();
  const prediction = String(signal.prediction || signal.pick || signal.market || "").trim();
  const oddsNumber = Number(String(signal.odds || signal.price || "").replace(/[^0-9.]/g, ""));
  if (!matchName || !prediction || !Number.isFinite(oddsNumber) || oddsNumber <= 0) return null;

  const confidenceNumber = Number(signal.confidence || signal.confidence_percent || signal.probability || "");
  const confidence = Number.isFinite(confidenceNumber)
    ? Math.max(1, Math.min(99, Math.round(confidenceNumber)))
    : oddsNumber >= 1.5 ? 76 : 82;
  const fixturePayload = signal.fixture_payload && typeof signal.fixture_payload === "object" ? signal.fixture_payload : {};
  const existingTeams = fixturePayload.teams || fixturePayload.raw?.teams || {};
  const existingLeague = fixturePayload.league || fixturePayload.raw?.league || {};
  const existingFixture = fixturePayload.fixture || fixturePayload.raw?.fixture || {};
  const teams = splitMatchName(matchName);
  const league = String(signal.league || existingLeague.name || payload.defaultLeague || "Manual board").trim();
  const startsAt = signal.starts_at || existingFixture.date || null;
  const bookingCodes = signal.booking_codes && typeof signal.booking_codes === "object" && !Array.isArray(signal.booking_codes)
    ? signal.booking_codes
    : {};

  return {
    ...signal,
    match_name: matchName,
    league,
    prediction,
    odds: oddsNumber.toFixed(2),
    confidence,
    is_vip: oddsNumber >= 1.5,
    booking_codes: bookingCodes,
    source: "admin-ingest",
    status: String(signal.status || "pending").trim().toLowerCase() || "pending",
    starts_at: startsAt,
    fixture_payload: {
      ...fixturePayload,
      provider: fixturePayload.provider || "admin-ingest",
      fixture: {
        ...existingFixture,
        id: existingFixture.id || signal.match_id || signal.id || `admin-${Date.now()}-${index}`,
        date: startsAt,
        status: existingFixture.status || { short: "NS", long: "Scheduled" }
      },
      league: {
        ...existingLeague,
        name: league,
        logo: existingLeague.logo || signal.league_logo || signal.league_logo_url || null
      },
      teams: {
        home: {
          ...(existingTeams.home || {}),
          name: existingTeams.home?.name || signal.home_team || teams.home,
          logo: existingTeams.home?.logo || signal.home_logo || signal.home_logo_url || null
        },
        away: {
          ...(existingTeams.away || {}),
          name: existingTeams.away?.name || signal.away_team || teams.away,
          logo: existingTeams.away?.logo || signal.away_logo || signal.away_logo_url || null
        }
      },
      metadata: {
        ...(fixturePayload.metadata || {}),
        source_name: payload.sourceName || payload.source_name || "Manual board",
        edited_preview: true
      }
    }
  };
}

function validateTip(payload) {
  const errors = [];
  if (!payload.match_name) errors.push("Game of the day is required.");
  if (!payload.prediction) errors.push("Prediction is required.");
  if (!payload.odds) errors.push("Odds is required.");
  if (typeof payload.is_vip !== "boolean") errors.push("Room must be freemium or VIP.");
  if (!payload.booking_codes || typeof payload.booking_codes !== "object" || Array.isArray(payload.booking_codes)) {
    errors.push("Booking codes must be entered like 1xBet: BAM218 / BetKing: BK944.");
  }
  return errors;
}

async function publishIngestedSignals(payload) {
  const parsed = (Array.isArray(payload.signals)
    ? payload.signals.map((signal, index) => normalizeDirectSignal(signal, payload, index)).filter(Boolean)
    : parseSignalsFromText(String(payload.text || payload.raw || payload.ingest_text || ""), {
        defaultSport: payload.defaultSport || "auto",
        defaultLeague: payload.defaultLeague || "auto",
        defaultTier: payload.defaultTier === "vip" ? "vip" : "freemium",
        sourceName: payload.sourceName || payload.source_name || "Manual board"
      })).slice(0, 60);

  if (!parsed.length) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "No valid signals found. Use CSV headers or lines like: Chelsea vs Arsenal | Over 1.5 goals | 1.42"
      }
    };
  }

  if (payload.mode !== "publish") {
    return { status: 200, body: { ok: true, mode: "preview", count: parsed.length, signals: parsed } };
  }

  const byDate = parsed.reduce((map, tip) => {
    const date = gameDateForTip(tip, config.signalWorker.timezone);
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(tip);
    return map;
  }, new Map());

  const savedDailyGames = [];
  for (const [date, tips] of byDate.entries()) {
    if (payload.replaceBoard) await deleteDailyGamesBySource(date, "admin-ingest");
    savedDailyGames.push(...await upsertDailyGames(date, tips));
  }

  const published = [];
  const delivery = [];
  for (const tip of parsed) {
    const savedTip = await insertTip(tip);
    published.push(savedTip);
    if (payload.notify) {
      const [telegram, firebase] = await Promise.allSettled([
        broadcastTip(savedTip),
        sendTipPush(savedTip)
      ]);
      delivery.push({
        telegram: telegram.status === "fulfilled" ? telegram.value : { ok: false, error: telegram.reason?.message },
        firebase: firebase.status === "fulfilled" ? firebase.value : { ok: false, error: firebase.reason?.message }
      });
    }
  }

  return {
    status: 201,
    body: {
      ok: true,
      mode: "publish",
      count: parsed.length,
      daily_games: savedDailyGames,
      published,
      delivery
    }
  };
}

async function settleManualSignal(payload) {
  const id = String(payload.id || "").trim();
  const matchName = String(payload.match_name || payload.match || "").trim();
  const prediction = String(payload.prediction || payload.pick || "").trim();
  const isVip = typeof payload.is_vip === "boolean" ? payload.is_vip : payload.tier === "vip";
  const status = String(payload.status || "").trim().toLowerCase();
  const allowedStatuses = new Set(["won", "lost", "void", "pending"]);
  if (!allowedStatuses.has(status)) {
    return { status: 400, body: { ok: false, error: "Outcome must be won, lost, void, or pending." } };
  }

  const resultPayload = {
    score: String(payload.score || payload.result || "").trim(),
    result: String(payload.result || payload.score || "").trim(),
    manual: true,
    settled_by: "admin",
    evaluated_at: new Date().toISOString()
  };

  await ensureDailyGamesTable();
  await ensureTipsTable();

  const params = [status, resultPayload];
  let where = "";
  if (id) {
    params.push(id);
    where = "id = $3::uuid";
  } else if (matchName && prediction) {
    params.push(matchName, prediction, isVip);
    where = "lower(match_name) = lower($3) and lower(prediction) = lower($4) and is_vip = $5";
  } else {
    return { status: 400, body: { ok: false, error: "Select a game or provide match plus prediction before saving an outcome." } };
  }

  const daily = await query(
    `update daily_games
     set status = $1,
         result_payload = $2,
         updated_at = now()
     where ${where}
     returning *`,
    params
  );
  const tips = await query(
    `update tips
     set status = $1,
         result_payload = $2,
         settled_at = case when $1 in ('won', 'lost', 'void') then now() else settled_at end,
         updated_at = now()
     where ${where}
     returning *`,
    params
  );

  return {
    status: 200,
    body: {
      ok: true,
      daily_games: daily.rows,
      tips: tips.rows,
      count: daily.rowCount + tips.rowCount
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const auth = await isAuthorized(req);
  if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });

  const payload = parseBody(req);
  if (payload.action === "settle") {
    const result = await settleManualSignal(payload);
    return res.status(result.status).json(result.body);
  }

  if (payload.action === "ingest" || payload.ingest_text || payload.raw) {
    const result = await publishIngestedSignals(payload);
    return res.status(result.status).json(result.body);
  }

  const errors = validateTip(payload);
  if (errors.length) return res.status(400).json({ ok: false, errors });

  try {
    const tip = await enrichTipWithFixture({
      match_name: String(payload.match_name),
      league: payload.league ? String(payload.league) : "Football",
      prediction: String(payload.prediction),
      odds: String(payload.odds),
      confidence: payload.confidence ? Number(payload.confidence) : null,
      is_vip: Boolean(payload.is_vip),
      booking_codes: payload.booking_codes,
      source: "admin",
      starts_at: payload.starts_at || null
    });

    const [savedTip] = await Promise.all([
      insertTip(tip),
      upsertDailyGames(todayInLagos(), [tip])
    ]);

    const delivery = {};
    if (payload.channels?.telegram || payload.channels?.vipTelegram) {
      const telegram = await broadcastTip(savedTip).catch((error) => ({ ok: false, error: error.message }));
      delivery.telegram = telegram;
    }
    if (payload.channels?.app) {
      const firebase = await sendTipPush(savedTip).catch((error) => ({ ok: false, error: error.message }));
      delivery.firebase = firebase;
    }

    return res.status(201).json({ ok: true, tip: savedTip, delivery });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Publish failed" });
  }
}
