import crypto from "node:crypto";
import { commandCenterPin } from "./consoleEnv.js";
import { getPlatformSetting, setPlatformSetting } from "./db.js";
import { requireAdmin, verifySupabaseAdmin } from "./adminAuth.js";
import {
  ADMIN_ACTION_PIN_LOCKED_MESSAGE,
  ADMIN_SECURITY_UNAVAILABLE_MESSAGE,
  checkAdminActionPinThrottle,
  INVALID_ADMIN_ACTION_PIN_MESSAGE,
  recordAdminActionPinFailure,
  recordAdminActionPinSuccess
} from "./services/adminActionPinThrottle.js";

const CONSENT_TTL_MS = 15 * 60 * 1000;
const PIN_SETTING_KEY = "admin_action_pin_hash";

function consentSecret() {
  return process.env.ADMIN_CONSENT_SECRET || process.env.CRON_SECRET || process.env.PAYSTACK_SECRET_KEY || "";
}

function hashPin(pin) {
  return crypto.createHash("sha256").update(`${consentSecret()}:admin-pin:${String(pin)}`).digest("hex");
}

async function configuredPinHash() {
  const fromDb = await getPlatformSetting(PIN_SETTING_KEY, null);
  if (typeof fromDb === "string" && fromDb.length >= 32) return fromDb;
  const fromEnv = commandCenterPin();
  if (!fromEnv) return null;
  return hashPin(fromEnv);
}

export async function isAdminActionPinConfigured() {
  return Boolean(await configuredPinHash());
}

export async function verifyAdminActionPin(pin) {
  const expected = await configuredPinHash();
  if (!expected) {
    return { ok: false, error: "Admin action PIN is not configured on the server." };
  }
  const candidate = hashPin(String(pin || ""));
  if (candidate.length !== expected.length) {
    return { ok: false, error: INVALID_ADMIN_ACTION_PIN_MESSAGE };
  }
  const valid = crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
  return valid ? { ok: true } : { ok: false, error: INVALID_ADMIN_ACTION_PIN_MESSAGE };
}

export async function attemptAdminActionPin(req, pin) {
  if (!(await verifySupabaseAdmin(req))) {
    return { ok: false, status: 401, error: "Admin login required." };
  }

  const email = await getAdminEmailFromRequest(req);
  if (!email) {
    return { ok: false, status: 401, error: "Admin login required." };
  }

  const throttle = await checkAdminActionPinThrottle(req, email);
  if (throttle.failClosed) {
    return { ok: false, status: 503, error: throttle.error || ADMIN_SECURITY_UNAVAILABLE_MESSAGE };
  }
  if (!throttle.ok || throttle.locked) {
    console.info("admin_action_pin_locked", {
      email,
      lockedUntil: throttle.lockedUntil || null
    });
    return { ok: false, status: 429, error: ADMIN_ACTION_PIN_LOCKED_MESSAGE };
  }

  const verify = await verifyAdminActionPin(pin);
  if (!verify.ok) {
    const record = await recordAdminActionPinFailure(req, email);
    if (record.failClosed) {
      return { ok: false, status: 503, error: record.error || ADMIN_SECURITY_UNAVAILABLE_MESSAGE };
    }
    console.info("admin_action_pin_failed", {
      email,
      attempts: record.attempts,
      locked: record.locked,
      lockedUntil: record.lockedUntil || null
    });
    if (record.locked) {
      console.info("admin_action_pin_locked", {
        email,
        lockedUntil: record.lockedUntil || null
      });
      return { ok: false, status: 429, error: ADMIN_ACTION_PIN_LOCKED_MESSAGE };
    }
    return { ok: false, status: 403, error: INVALID_ADMIN_ACTION_PIN_MESSAGE };
  }

  await recordAdminActionPinSuccess(email);
  console.info("admin_action_pin_success", { email });
  return { ok: true, email };
}

export function issueAdminConsentToken(email) {
  const secret = consentSecret();
  if (!secret || !email) return null;
  const exp = Date.now() + CONSENT_TTL_MS;
  const payload = `${String(email).toLowerCase()}:${exp}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${sig}`;
}

export function verifyAdminConsentToken(token, email) {
  const secret = consentSecret();
  if (!secret || !token || !email) return false;
  const parts = String(token).split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  let payload = "";
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return false;
  }
  const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (sig.length !== expectedSig.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return false;
  const [tokenEmail, expStr] = payload.split(":");
  if (tokenEmail !== String(email).toLowerCase()) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return true;
}

export async function getAdminEmailFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!bearer || !process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) return null;

  const response = await fetch(`${process.env.VITE_SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: process.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${bearer}`
    }
  });
  if (!response.ok) return null;
  const user = await response.json();
  return String(user.email || "").toLowerCase() || null;
}

export async function requireAdminConsent(req, res) {
  if (!(await requireAdmin(req, res))) return false;

  const pinConfigured = await isAdminActionPinConfigured();
  if (!pinConfigured) {
    if (process.env.NODE_ENV !== "production") return true;
    res.status(503).json({
      ok: false,
      error: "Set COMMAND_CENTER_PIN in server environment before making console changes.",
      code: "pin_not_configured"
    });
    return false;
  }

  const email = await getAdminEmailFromRequest(req);
  const consent = String(req.headers["x-admin-consent"] || "").trim();
  if (email && verifyAdminConsentToken(consent, email)) return true;

  res.status(403).json({
    ok: false,
    error: "Enter your admin PIN to confirm this action.",
    code: "consent_required"
  });
  return false;
}

export async function rotateAdminActionPin(req, currentPin, nextPin) {
  const attempt = await attemptAdminActionPin(req, currentPin);
  if (!attempt.ok) {
    return { ok: false, error: attempt.error, status: attempt.status };
  }

  const normalized = String(nextPin || "").trim();
  if (!/^\d{4,8}$/.test(normalized)) {
    return { ok: false, error: "PIN must be 4–8 digits." };
  }

  await setPlatformSetting(PIN_SETTING_KEY, hashPin(normalized));
  return { ok: true };
}

export async function setInitialAdminActionPin(pin) {
  const existing = await configuredPinHash();
  if (existing) {
    return { ok: false, error: "Admin PIN already configured. Use rotate with your current PIN." };
  }
  const normalized = String(pin || "").trim();
  if (!/^\d{4,8}$/.test(normalized)) {
    return { ok: false, error: "PIN must be 4–8 digits." };
  }
  await setPlatformSetting(PIN_SETTING_KEY, hashPin(normalized));
  return { ok: true };
}

export async function createConsentFromPin(req, pin) {
  const attempt = await attemptAdminActionPin(req, pin);
  if (!attempt.ok) {
    return { ok: false, status: attempt.status, error: attempt.error };
  }
  const email = attempt.email;
  const token = issueAdminConsentToken(email);
  return {
    ok: true,
    consentToken: token,
    expiresAt: Date.now() + CONSENT_TTL_MS
  };
}
