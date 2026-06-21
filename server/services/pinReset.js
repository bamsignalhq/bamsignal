import crypto from "node:crypto";
import { findAppUserIdentity, isDatabaseReady, query } from "../db.js";
import { ensureMemberProfilesTable, findMemberProfileByUserKey } from "../cityHome.js";
import {
  loadEmailBranding,
  wrapEmailLayoutAsync,
  buildPinResetEmailBody
} from "./emailBranding.js";
import { normalizeSignupEmail, normalizeSignupUsername } from "./signupIdentity.js";
import { repairUserPin } from "./pinLogin.js";
import {
  createBoundedMemoryStore,
  isOtpMemoryEntryExpired
} from "./boundedMemoryStore.js";
import { logObservabilityEvent } from "./observability.js";
import { assertSchemaTable } from "./schemaVerification.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 8;

const memoryStore = createBoundedMemoryStore("pin_reset_otp", {
  isExpired: isOtpMemoryEntryExpired
});

export class PinResetError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.name = "PinResetError";
    this.status = status;
    this.code = code;
  }
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

async function ensurePinResetTable() {
  await assertSchemaTable("pin_reset_codes");
}

async function readStored(email) {
  const normalized = normalizeSignupEmail(email);
  const { rows } = await query(
    `select code_hash, attempts, extract(epoch from expires_at) * 1000 as expires,
            extract(epoch from last_sent_at) * 1000 as last_sent
     from pin_reset_codes where email = $1`,
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
  const normalized = normalizeSignupEmail(email);
  memoryStore.set(normalized, payload);
  await query(
    `insert into pin_reset_codes (email, code_hash, attempts, last_sent_at, expires_at)
     values ($1, $2, 0, to_timestamp($3 / 1000.0), to_timestamp($4 / 1000.0))
     on conflict (email) do update set
       code_hash = excluded.code_hash,
       attempts = 0,
       last_sent_at = excluded.last_sent_at,
       expires_at = excluded.expires_at`,
    [normalized, payload.hash, payload.lastSent, payload.expires]
  );
}

async function bumpAttempts(email) {
  const normalized = normalizeSignupEmail(email);
  const current = (await readStored(normalized)) || { hash: "", attempts: 0, expires: 0, lastSent: 0 };
  const next = { ...current, attempts: (current.attempts || 0) + 1 };
  memoryStore.set(normalized, next);
  await query(`update pin_reset_codes set attempts = attempts + 1 where email = $1`, [normalized]);
  return next.attempts;
}

async function clearStored(email) {
  const normalized = normalizeSignupEmail(email);
  memoryStore.delete(normalized);
  await query(`delete from pin_reset_codes where email = $1`, [normalized]);
}

async function sendResendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new PinResetError(503, "Email delivery is not configured. Try again shortly.", "resend_not_configured");
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
    logObservabilityEvent(
      "pin_reset_email_failed",
      { status: response.status, reason: "provider_error" },
      "error"
    );
    throw new PinResetError(
      502,
      "We couldn't send the code right now. Wait a minute and try again, or check your spam folder.",
      "pin_reset_send_failed"
    );
  }
}

async function resolveAccountByEmail(rawEmail = "") {
  const email = normalizeSignupEmail(rawEmail);
  if (!email.includes("@") || !isDatabaseReady()) return null;

  await ensureMemberProfilesTable();

  const memberResult = await query(
    `select id, email, name, username, profile, phone
     from app_member_profiles
     where lower(coalesce(nullif(email, ''), '')) = lower($1)
     limit 1`,
    [email]
  );
  let member = memberResult.rows[0] || null;

  if (!member) {
    member = await findMemberProfileByUserKey(email, null);
  }

  if (member?.id) {
    const profile =
      member.profile && typeof member.profile === "object" ? member.profile : {};
    const username = normalizeSignupUsername(member.username || profile.username || "");
    if (username) {
      return {
        username,
        name: String(member.name || profile.name || "").trim(),
        email
      };
    }
  }

  const authResult = await query(
    `select email, raw_user_meta_data
     from auth.users
     where lower(email) = lower($1)
     limit 1`,
    [email]
  );
  const authUser = authResult.rows[0];
  if (authUser) {
    const meta = authUser.raw_user_meta_data && typeof authUser.raw_user_meta_data === "object"
      ? authUser.raw_user_meta_data
      : {};
    const username = normalizeSignupUsername(meta.username || "");
    if (username) {
      return {
        username,
        name: String(meta.name || "").trim(),
        email
      };
    }
  }

  const appUser = await findAppUserIdentity({ email, phone: null });
  if (appUser?.phone) {
    const linkedMember = await findMemberProfileByUserKey(email, appUser.phone);
    if (linkedMember) {
      const profile =
        linkedMember.profile && typeof linkedMember.profile === "object" ? linkedMember.profile : {};
      const username = normalizeSignupUsername(linkedMember.username || profile.username || "");
      if (username) {
        return {
          username,
          name: String(linkedMember.name || profile.name || appUser.name || "").trim(),
          email
        };
      }
    }
  }

  return null;
}

export async function sendPinResetCode(rawEmail = "") {
  if (!isDatabaseReady()) {
    throw new PinResetError(503, "PIN reset is temporarily unavailable.", "database_disconnected");
  }

  await ensurePinResetTable();

  const email = normalizeSignupEmail(rawEmail);
  if (!email.includes("@")) {
    throw new PinResetError(400, "Enter a valid email.");
  }

  const account = await resolveAccountByEmail(email);
  if (!account) {
    return { ok: true, sent: false };
  }

  const existing = await readStored(email);
  const now = Date.now();
  if (existing?.lastSent && now - existing.lastSent < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSent)) / 1000);
    throw new PinResetError(429, `Wait ${waitSec}s before requesting another code.`);
  }

  const code = generateCode();
  const payload = {
    hash: hashCode(code),
    attempts: 0,
    expires: now + OTP_TTL_MS,
    lastSent: now
  };
  await writeStored(email, payload);

  const safeName = account.name || "there";
  const branding = await loadEmailBranding();
  const bodyHtml = buildPinResetEmailBody({ name: safeName, code });
  const html = await wrapEmailLayoutAsync({
    branding,
    preheader: `Your PIN reset code is ${code}`,
    bodyHtml
  });

  await sendResendEmail({
    to: email,
    subject: `${code} is your BamSignal PIN reset code`,
    html,
    text: `Your PIN reset code is ${code}. It expires in 10 minutes.`
  });

  return { ok: true, sent: true, email };
}

export async function completePinReset({ email: rawEmail, code, newPin }) {
  if (!isDatabaseReady()) {
    throw new PinResetError(503, "PIN reset is temporarily unavailable.", "database_disconnected");
  }

  const email = normalizeSignupEmail(rawEmail);
  const pin = String(newPin || "");
  const submittedCode = String(code || "").trim();

  if (!email.includes("@")) {
    throw new PinResetError(400, "Enter a valid email.");
  }
  if (!/^\d{6}$/.test(submittedCode)) {
    throw new PinResetError(400, "Enter the 6-digit code from your email.");
  }
  if (!/^\d{6}$/.test(pin)) {
    throw new PinResetError(400, "PIN must be exactly 6 digits.");
  }

  const stored = await readStored(email);
  if (!stored?.hash) {
    throw new PinResetError(400, "Request a new code and try again.");
  }
  if (Date.now() > stored.expires) {
    await clearStored(email);
    throw new PinResetError(400, "That code expired. Request a fresh one.");
  }
  if ((stored.attempts || 0) >= MAX_VERIFY_ATTEMPTS) {
    await clearStored(email);
    throw new PinResetError(429, "Too many attempts. Request a new code.");
  }

  if (stored.hash !== hashCode(submittedCode)) {
    const attempts = await bumpAttempts(email);
    if (attempts >= MAX_VERIFY_ATTEMPTS) {
      await clearStored(email);
      throw new PinResetError(429, "Too many attempts. Request a new code.");
    }
    throw new PinResetError(400, "That code doesn't match. Check your email and try again.");
  }

  const account = await resolveAccountByEmail(email);
  if (!account?.username) {
    throw new PinResetError(404, "We couldn't find an account for this email.");
  }

  await repairUserPin({ username: account.username, newPin: pin });
  await clearStored(email);

  return { ok: true, username: account.username, email };
}
