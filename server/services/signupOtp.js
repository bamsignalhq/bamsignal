import crypto from "node:crypto";
import dotenv from "dotenv";
import { query } from "../db.js";
import { supabaseServiceHeaders } from "../supabaseEnv.js";
import { escapeHtml, loadEmailBranding, wrapEmailLayoutAsync } from "./emailBranding.js";

dotenv.config();

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 8;

/** @type {Map<string, { hash: string; expires: number; attempts: number; lastSent: number }>} */
const memoryStore = new Map();

export class SignupOtpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "SignupOtpError";
    this.status = status;
  }
}

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

async function ensureEmailVerificationTable() {
  await query(`
    create table if not exists email_verification_codes (
      email text primary key,
      code_hash text not null,
      attempts int not null default 0,
      last_sent_at timestamptz not null default now(),
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )
  `);
}

async function readStored(email) {
  const normalized = normalizeEmail(email);
  const { rows } = await query(
    `select code_hash, attempts, extract(epoch from expires_at) * 1000 as expires,
            extract(epoch from last_sent_at) * 1000 as last_sent
     from email_verification_codes where email = $1`,
    [normalized]
  );
  if (rows[0]) {
    return {
      hash: rows[0].code_hash,
      attempts: Number(rows[0].attempts) || 0,
      expires: Number(rows[0].expires) || 0,
      lastSent: Number(rows[0].last_sent) || 0
    };
  }
  return memoryStore.get(normalized) || null;
}

async function writeStored(email, payload) {
  const normalized = normalizeEmail(email);
  memoryStore.set(normalized, payload);
  await query(
    `insert into email_verification_codes (email, code_hash, attempts, last_sent_at, expires_at)
     values ($1, $2, $3, to_timestamp($4 / 1000.0), to_timestamp($5 / 1000.0))
     on conflict (email) do update set
       code_hash = excluded.code_hash,
       attempts = 0,
       last_sent_at = excluded.last_sent_at,
       expires_at = excluded.expires_at`,
    [normalized, payload.hash, 0, payload.lastSent, payload.expires]
  );
}

async function bumpAttempts(email) {
  const normalized = normalizeEmail(email);
  const current = (await readStored(normalized)) || { hash: "", attempts: 0, expires: 0, lastSent: 0 };
  const next = { ...current, attempts: (current.attempts || 0) + 1 };
  memoryStore.set(normalized, next);
  await query(`update email_verification_codes set attempts = attempts + 1 where email = $1`, [normalized]);
  return next.attempts;
}

async function clearStored(email) {
  const normalized = normalizeEmail(email);
  memoryStore.delete(normalized);
  await query(`delete from email_verification_codes where email = $1`, [normalized]);
}

async function sendResendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new SignupOtpError(503, "Email delivery is not configured. Try again shortly.");
  }

  const from =
    process.env.SIGNUP_EMAIL_FROM?.trim() ||
    process.env.SUPPORT_EMAIL_FROM?.trim() ||
    "BamSignal <support@bamsignal.com>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to, subject, html, text })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[bamsignal] Signup OTP email failed:", detail);
    throw new SignupOtpError(
      502,
      "We couldn't send the code right now. Wait a minute and try again, or check your spam folder."
    );
  }
}

export async function sendSignupOtp(email, name = "") {
  await ensureEmailVerificationTable();

  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) {
    throw new SignupOtpError(400, "Enter a valid email.");
  }

  const existing = await readStored(normalized);
  const now = Date.now();
  if (existing?.lastSent && now - existing.lastSent < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSent)) / 1000);
    throw new SignupOtpError(429, `Wait ${waitSec}s before requesting another code.`);
  }

  const code = generateCode();
  const payload = {
    hash: hashCode(code),
    attempts: 0,
    expires: now + OTP_TTL_MS,
    lastSent: now
  };
  await writeStored(normalized, payload);

  const safeName = String(name || "there").trim() || "there";
  const branding = await loadEmailBranding();
  const bodyHtml = `
    <p style="margin:0 0 8px;color:#b7c3d9;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">Verify your email</p>
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15;color:#f8fafc;font-weight:700">Your BamSignal code</h1>
    <p style="margin:0 0 20px;color:#dbe5f4;line-height:1.7">Hi ${escapeHtml(safeName)}, enter this code in the app to finish signing up. It expires in 10 minutes.</p>
    <div style="display:inline-block;padding:16px 28px;border-radius:16px;background:#18243b;border:1px solid #253553;font-size:32px;font-weight:800;letter-spacing:0.35em;color:#f8fafc">${code}</div>
    <p style="margin:20px 0 0;color:#9db0cf;line-height:1.6;font-size:14px">If you didn't request this, you can ignore this email.</p>
  `;
  const html = await wrapEmailLayoutAsync({
    branding,
    preheader: `Your BamSignal verification code is ${code}`,
    bodyHtml
  });

  await sendResendEmail({
    to: normalized,
    subject: `${code} is your BamSignal verification code`,
    html,
    text: `Your BamSignal verification code is ${code}. It expires in 10 minutes.`
  });

  return { ok: true, email: normalized };
}

export async function verifySignupOtp(email, code) {
  await ensureEmailVerificationTable();

  const normalized = normalizeEmail(email);
  const cleaned = String(code || "").replace(/\D/g, "");
  if (cleaned.length !== 6) {
    throw new SignupOtpError(400, "Enter the 6-digit code from your email.");
  }

  const stored = await readStored(normalized);
  if (!stored || !stored.hash) {
    throw new SignupOtpError(400, "Request a new code and try again.");
  }

  if (Date.now() > stored.expires) {
    await clearStored(normalized);
    throw new SignupOtpError(400, "That code expired. Request a fresh one.");
  }

  if (stored.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new SignupOtpError(429, "Too many attempts. Request a new code.");
  }

  if (hashCode(cleaned) !== stored.hash) {
    await bumpAttempts(normalized);
    throw new SignupOtpError(400, "That code doesn't match. Check your email and try again.");
  }

  await clearStored(normalized);
  return { ok: true, email: normalized };
}

function buildSupabaseAdminHeaders(serviceKey) {
  const headers = {
    apikey: serviceKey,
    "Content-Type": "application/json"
  };
  // Legacy JWT service_role keys work in Authorization. New sb_secret_* keys must not.
  if (serviceKey.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${serviceKey}`;
  }
  return headers;
}

export async function createConfirmedSupabaseUser({ email, password, name, username, phone }) {
  const config = supabaseServiceHeaders();
  if (!config) {
    throw new SignupOtpError(
      503,
      "Account setup is not fully configured. Contact support@bamsignal.com."
    );
  }

  const normalized = normalizeEmail(email);
  const headers = buildSupabaseAdminHeaders(config.serviceKey);
  const userMetadata = {
    name: String(name || "").trim(),
    username: String(username || "").trim(),
    phone: String(phone || "").trim()
  };

  async function findExistingUserId() {
    const list = await fetch(
      `${config.url}/auth/v1/admin/users?${new URLSearchParams({
        page: "1",
        per_page: "1",
        email: normalized
      })}`,
      { headers }
    );
    if (!list.ok) return null;
    const payload = await list.json();
    return payload?.users?.[0]?.id || null;
  }

  async function updateExistingUser(userId) {
    const update = await fetch(`${config.url}/auth/v1/admin/users/${userId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        password: String(password),
        email_confirm: true,
        user_metadata: userMetadata
      })
    });
    if (!update.ok) {
      const detail = await update.text();
      console.error("[bamsignal] Supabase admin update user failed:", detail);
      throw new SignupOtpError(502, "We couldn't finish creating your account. Try again shortly.");
    }
    return { id: userId };
  }

  const response = await fetch(`${config.url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: normalized,
      password: String(password),
      email_confirm: true,
      user_metadata: userMetadata
    })
  });

  if (response.ok) {
    return response.json();
  }

  const detail = await response.text();
  if (/already registered|already exists|duplicate/i.test(detail)) {
    const userId = await findExistingUserId();
    if (!userId) {
      throw new SignupOtpError(409, "An account with this email already exists. Try logging in instead.");
    }

    await fetch(`${config.url}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers
    });

    const retry = await fetch(`${config.url}/auth/v1/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: normalized,
        password: String(password),
        email_confirm: true,
        user_metadata: userMetadata
      })
    });

    if (retry.ok) {
      return retry.json();
    }

    const retryDetail = await retry.text();
    if (/already registered|already exists|duplicate/i.test(retryDetail)) {
      return updateExistingUser(userId);
    }

    console.error("[bamsignal] Supabase admin recreate user failed:", retryDetail);
    throw new SignupOtpError(502, "We couldn't finish creating your account. Try again shortly.");
  }

  console.error("[bamsignal] Supabase admin create user failed:", detail);
  throw new SignupOtpError(502, "We couldn't finish creating your account. Try again shortly.");
}

export async function handleSignupEmailCodeRequest(body = {}) {
  const action = String(body.action || "send").toLowerCase();

  if (action === "send") {
    return sendSignupOtp(body.email, body.name);
  }

  if (action === "verify") {
    await verifySignupOtp(body.email, body.code);
    await createConfirmedSupabaseUser({
      email: body.email,
      password: body.password,
      name: body.name,
      username: body.username,
      phone: body.phone
    });
    return { ok: true, email: normalizeEmail(body.email) };
  }

  throw new SignupOtpError(400, "Invalid action.");
}
