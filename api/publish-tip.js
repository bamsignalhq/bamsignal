import { config } from "../server/config.js";
import { deleteDailyGamesBySource, ensureDailyGamesTable, ensureTipsTable, insertTip, query, upsertDailyGames } from "../server/db.js";
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
  if (!adminEmails.length) return false;

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
  return adminEmails.includes(String(user.email || "").toLowerCase());
}

async function isAuthorized(req) {
  const allowedSecrets = [config.signalWorker.secret, config.cronSecret].filter(Boolean);
  const provided = req.headers["x-bamsignal-secret"] || req.query.secret;
  if (provided && allowedSecrets.includes(provided)) return { ok: true };
  if (await verifySupabaseAdmin(req)) return { ok: true };
  if (!allowedSecrets.length && !process.env.ADMIN_EMAILS) {
    return { ok: false, status: 503, error: "Admin authentication is not configured in Vercel yet." };
  }
  if (!provided) return { ok: false, status: 401, error: "Log in as an admin account or enter the publish secret before publishing." };
  if (!allowedSecrets.includes(provided)) return { ok: false, status: 401, error: "Admin publish secret is incorrect." };
  return { ok: true };
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
  const parsed = parseSignalsFromText(String(payload.text || payload.raw || payload.ingest_text || ""), {
    defaultSport: payload.defaultSport || "auto",
    defaultLeague: payload.defaultLeague || "auto",
    defaultTier: payload.defaultTier === "vip" ? "vip" : "freemium",
    sourceName: payload.sourceName || payload.source_name || "Manual board"
  }).slice(0, 60);

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
