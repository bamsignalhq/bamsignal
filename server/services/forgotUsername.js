import crypto from "node:crypto";
import { ensureAppUsersTable, isDatabaseReady, query } from "../db.js";
import { ensureMemberProfilesTable } from "./memberProfileSchema.js";
import {
  normalizeSignupEmail,
  normalizeSignupPhone,
  normalizeSignupUsername,
  phoneDigitKeys
} from "./signupIdentity.js";
import {
  loadEmailBranding,
  wrapEmailLayoutAsync,
  buildPinResetEmailBody
} from "./emailBranding.js";
import {
  createBoundedMemoryStore,
  isOtpMemoryEntryExpired
} from "./boundedMemoryStore.js";
import { logObservabilityEvent } from "./observability.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 8;

const memoryStore = createBoundedMemoryStore("forgot_username_otp", {
  isExpired: isOtpMemoryEntryExpired
});

export class ForgotUsernameError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.name = "ForgotUsernameError";
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

function storeKeyFromEmail(email) {
  return `email:${normalizeSignupEmail(email)}`;
}

async function lookupAccountByEmail(email) {
  const normalized = normalizeSignupEmail(email);
  if (!normalized.includes("@") || !isDatabaseReady()) return null;

  await ensureMemberProfilesTable();
  const member = await query(
    `select username, email from app_member_profiles
     where lower(email) = lower($1) and coalesce(username, '') <> ''
     limit 1`,
    [normalized]
  );
  if (member.rows[0]?.username) {
    return {
      username: normalizeSignupUsername(member.rows[0].username),
      email: normalized,
      name: ""
    };
  }

  await ensureAppUsersTable();
  const appUser = await query(
    `select username, email from app_users
     where lower(email) = lower($1) and coalesce(username, '') <> ''
     limit 1`,
    [normalized]
  );
  if (appUser.rows[0]?.username) {
    return {
      username: normalizeSignupUsername(appUser.rows[0].username),
      email: normalized,
      name: ""
    };
  }

  const authMeta = await query(
    `select email, raw_user_meta_data->>'username' as username, raw_user_meta_data->>'name' as name
     from auth.users
     where lower(email) = lower($1)
       and coalesce(raw_user_meta_data->>'username', '') <> ''
     limit 1`,
    [normalized]
  );
  if (authMeta.rows[0]?.username) {
    return {
      username: normalizeSignupUsername(authMeta.rows[0].username),
      email: normalized,
      name: String(authMeta.rows[0].name || "").trim()
    };
  }

  return null;
}

async function lookupAccountByPhone(phone) {
  const keys = phoneDigitKeys(phone);
  if (!keys.length || !isDatabaseReady()) return null;

  await ensureMemberProfilesTable();
  const member = await query(
    `select username, email, name from app_member_profiles
     where phone is not null and phone <> ''
       and regexp_replace(phone, '\\D', '', 'g') = any($1::text[])
       and coalesce(username, '') <> ''
       and coalesce(email, '') <> ''
     limit 1`,
    [keys]
  );
  if (member.rows[0]?.username && member.rows[0]?.email) {
    return {
      username: normalizeSignupUsername(member.rows[0].username),
      email: normalizeSignupEmail(member.rows[0].email),
      name: String(member.rows[0].name || "").trim()
    };
  }

  await ensureAppUsersTable();
  const appUser = await query(
    `select username, email, name from app_users
     where phone is not null and phone <> ''
       and regexp_replace(phone, '\\D', '', 'g') = any($1::text[])
       and coalesce(username, '') <> ''
       and coalesce(email, '') <> ''
     limit 1`,
    [keys]
  );
  if (appUser.rows[0]?.username && appUser.rows[0]?.email) {
    return {
      username: normalizeSignupUsername(appUser.rows[0].username),
      email: normalizeSignupEmail(appUser.rows[0].email),
      name: String(appUser.rows[0].name || "").trim()
    };
  }

  return null;
}

async function sendRecoveryEmail({ to, name, code }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new ForgotUsernameError(
      503,
      "Email delivery is not configured. Try again shortly.",
      "resend_not_configured"
    );
  }

  const branding = await loadEmailBranding();
  const bodyHtml = buildPinResetEmailBody({ name: name || "there", code });
  const html = await wrapEmailLayoutAsync({
    bodyHtml,
    branding,
    preheader: "Recover your BamSignal username"
  });
  const text = `Your BamSignal username recovery code is ${code}. It expires in 10 minutes.`;
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
    body: JSON.stringify({
      from,
      to,
      subject: "Recover your BamSignal username",
      html,
      text
    })
  });

  if (!response.ok) {
    logObservabilityEvent(
      "forgot_username_email_failed",
      { status: response.status, reason: "provider_error" },
      "error"
    );
    throw new ForgotUsernameError(
      502,
      "We couldn't send the recovery code right now.",
      "email_send_failed"
    );
  }
}

const GENERIC_SENT =
  "If an account matches, we sent a recovery code to the email on file.";

/**
 * Start forgot-username recovery. Never reveals whether the account exists.
 * Accepts registered email OR phone (phone resolves to account email for delivery).
 */
export async function sendForgotUsernameCode({ email = "", phone = "" } = {}) {
  const normalizedEmail = normalizeSignupEmail(email);
  const normalizedPhone = normalizeSignupPhone(phone);

  if (!normalizedEmail.includes("@") && normalizedPhone.length !== 11) {
    throw new ForgotUsernameError(
      400,
      "Enter the registered email or phone number on your account.",
      "invalid_lookup"
    );
  }

  const match = normalizedEmail.includes("@")
    ? await lookupAccountByEmail(normalizedEmail)
    : await lookupAccountByPhone(normalizedPhone);

  if (!match?.username || !match.email) {
    return { ok: true, sent: true, message: GENERIC_SENT };
  }

  const key = storeKeyFromEmail(match.email);
  const existing = memoryStore.get(key);
  const now = Date.now();
  if (existing?.lastSent && now - existing.lastSent < RESEND_COOLDOWN_MS) {
    throw new ForgotUsernameError(
      429,
      "Please wait a minute before requesting another code.",
      "rate_limited"
    );
  }

  const code = generateCode();
  await sendRecoveryEmail({ to: match.email, name: match.name, code });

  memoryStore.set(key, {
    hash: hashCode(code),
    attempts: 0,
    expires: now + OTP_TTL_MS,
    lastSent: now,
    username: match.username
  });

  return {
    ok: true,
    sent: true,
    message: GENERIC_SENT,
    email: match.email
  };
}

/**
 * Complete forgot-username after OTP. Reveals username only after verification.
 */
export async function completeForgotUsername({ email = "", phone = "", code = "" } = {}) {
  const normalizedEmail = normalizeSignupEmail(email);
  const normalizedPhone = normalizeSignupPhone(phone);
  const trimmedCode = String(code || "").replace(/\D/g, "");

  if (trimmedCode.length !== 6) {
    throw new ForgotUsernameError(400, "Enter the 6-digit recovery code.", "invalid_code");
  }

  let deliveryEmail = normalizedEmail.includes("@") ? normalizedEmail : "";
  if (!deliveryEmail && normalizedPhone.length === 11) {
    const match = await lookupAccountByPhone(normalizedPhone);
    deliveryEmail = match?.email || "";
  }

  if (!deliveryEmail.includes("@")) {
    throw new ForgotUsernameError(400, "Invalid recovery code. Try again.", "invalid_code");
  }

  const key = storeKeyFromEmail(deliveryEmail);
  const stored = memoryStore.get(key);
  if (!stored) {
    throw new ForgotUsernameError(400, "Invalid recovery code. Try again.", "invalid_code");
  }

  const now = Date.now();
  if (!stored.expires || now > stored.expires) {
    memoryStore.delete(key);
    throw new ForgotUsernameError(400, "This recovery code expired. Request a new one.", "code_expired");
  }
  if ((stored.attempts || 0) >= MAX_VERIFY_ATTEMPTS) {
    memoryStore.delete(key);
    throw new ForgotUsernameError(429, "Too many attempts. Request a new code.", "too_many_attempts");
  }

  if (hashCode(trimmedCode) !== stored.hash) {
    memoryStore.set(key, { ...stored, attempts: (stored.attempts || 0) + 1 });
    throw new ForgotUsernameError(400, "Invalid recovery code. Try again.", "invalid_code");
  }

  const username = normalizeSignupUsername(stored.username || "");
  memoryStore.delete(key);
  if (!username) {
    throw new ForgotUsernameError(404, "We couldn't find a username for this account.", "not_found");
  }

  return {
    ok: true,
    username,
    message: `Your username is ${username}.`
  };
}
