import { config } from "../server/config.js";
import { insertTip, upsertDailyGames } from "../server/db.js";
import { sendTipPush } from "../server/firebase.js";
import { broadcastTip } from "../server/telegram.js";

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
    return { ok: false, status: 503, error: "Set ADMIN_EMAILS or SIGNAL_WORKER_SECRET in Vercel before backend publishing." };
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const auth = await isAuthorized(req);
  if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });

  const payload = parseBody(req);
  const errors = validateTip(payload);
  if (errors.length) return res.status(400).json({ ok: false, errors });

  try {
    const tip = {
      match_name: String(payload.match_name),
      league: payload.league ? String(payload.league) : "Football",
      prediction: String(payload.prediction),
      odds: String(payload.odds),
      confidence: payload.confidence ? Number(payload.confidence) : null,
      is_vip: Boolean(payload.is_vip),
      booking_codes: payload.booking_codes,
      source: "admin",
      starts_at: payload.starts_at || null
    };

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
