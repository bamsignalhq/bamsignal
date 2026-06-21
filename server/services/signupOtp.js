import {
  assertSignupIdentityAvailable,
  checkSignupIdentityField,
  assertEmailNotDisposable,
  normalizeSignupEmail,
  SignupIdentityError
} from "./signupIdentity.js";
export { SignupIdentityError } from "./signupIdentity.js";
import {
  assertSignupMathChallengePassed,
  issueSignupMathChallenge
} from "./signupMathChallenge.js";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { loadEmailBranding, buildSignupVerificationEmailBody, wrapEmailLayoutAsync } from "./emailBranding.js";
import {
  createBoundedMemoryStore,
  isOtpMemoryEntryExpired
} from "./boundedMemoryStore.js";
import {
  beginProvisioning,
  canResumeProvisioningAttempt,
  ensureSupabaseAuthUser,
  hashSignupCode,
  readSignupProvisioningAttempt,
  resumeProvisioning,
  runSignupProvisioning,
  SignupProvisioningError
} from "./signupProvisioning.js";
import { query } from "../db.js";
import { assertSchemaTable } from "./schemaVerification.js";

dotenv.config();

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 8;

const memoryStore = createBoundedMemoryStore("signup_otp", {
  isExpired: isOtpMemoryEntryExpired
});

export class SignupOtpError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.name = "SignupOtpError";
    this.status = status;
    this.code = code;
  }
}

function signupFlowLog(event, detail = undefined) {
  if (detail !== undefined) {
    console.info(`[bamsignal:signup-flow] ${event}`, detail);
  } else {
    console.info(`[bamsignal:signup-flow] ${event}`);
  }
}

function normalizeEmail(email = "") {
  return normalizeSignupEmail(email);
}

function hashCode(code) {
  return hashSignupCode(code);
}

function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

function mapProvisioningError(error) {
  if (error?.name === "SignupProvisioningError") {
    throw new SignupOtpError(error.status, error.message, error.code);
  }
  throw error;
}

async function ensureEmailVerificationTable() {
  await assertSchemaTable("email_verification_codes");
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

async function assertSignupOtpCode(email, code) {
  const normalized = normalizeEmail(email);
  assertEmailNotDisposable(normalized);

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

  const codeHash = hashCode(cleaned);
  if (codeHash !== stored.hash) {
    await bumpAttempts(normalized);
    throw new SignupOtpError(400, "That code doesn't match. Check your email and try again.");
  }

  return {
    email: normalized,
    codeHash,
    expiresAt: Number(stored.expires) || Date.now() + OTP_TTL_MS
  };
}

async function sendResendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new SignupOtpError(503, "Email delivery is not configured. Try again shortly.", "resend_not_configured");
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
      "We couldn't send the code right now. Wait a minute and try again, or check your spam folder.",
      "otp_send_failed"
    );
  }
}

export async function sendSignupOtp(email, name = "", identity = {}, options = {}) {
  await ensureEmailVerificationTable();

  const normalized = normalizeSignupEmail(email);
  if (!normalized.includes("@")) {
    throw new SignupOtpError(400, "Enter a valid email.");
  }

  assertEmailNotDisposable(normalized);

  if (!options.resend) {
    if (!options.legalAccepted) {
      throw new SignupOtpError(400, "Please accept the terms to continue.", "legal_required");
    }

    try {
      assertSignupMathChallengePassed(options.mathToken, options.mathAnswer);
    } catch (error) {
      if (error?.name === "SignupMathError") {
        throw new SignupOtpError(error.status || 400, error.message, error.code || "math_failed");
      }
      throw error;
    }
  }

  await assertSignupIdentityAvailable({
    email: normalized,
    phone: identity.phone || "",
    username: identity.username || ""
  });

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
  const bodyHtml = buildSignupVerificationEmailBody({ name: safeName, code });
  const html = await wrapEmailLayoutAsync({
    branding,
    preheader: `Your verification code is ${code}`,
    bodyHtml
  });

  await sendResendEmail({
    to: normalized,
    subject: `${code} is your BamSignal verification code`,
    html,
    text: `Your verification code is ${code}. It expires in 10 minutes.`
  });

  return { ok: true, email: normalized };
}

export async function verifySignupOtp(email, code) {
  await ensureEmailVerificationTable();

  const verified = await assertSignupOtpCode(email, code);
  await clearStored(verified.email);
  return { ok: true, email: verified.email };
}

async function verifySignupOtpForProvisioning(body = {}) {
  await ensureEmailVerificationTable();

  const normalized = normalizeEmail(body.email);
  const cleaned = String(body.code || "").replace(/\D/g, "");
  if (cleaned.length !== 6) {
    throw new SignupOtpError(400, "Enter the 6-digit code from your email.");
  }

  const codeHash = hashCode(cleaned);
  const existingAttempt = await readSignupProvisioningAttempt(normalized);
  if (canResumeProvisioningAttempt(existingAttempt, codeHash)) {
    const attempt = await resumeProvisioning(normalized, existingAttempt);
    return { ok: true, email: normalized, resumed: true, attempt };
  }

  const verified = await assertSignupOtpCode(normalized, cleaned);
  let attempt;
  try {
    attempt = await beginProvisioning(body, verified, { otpTtlMs: OTP_TTL_MS });
  } catch (error) {
    mapProvisioningError(error);
  }
  await clearStored(verified.email);
  return { ok: true, email: verified.email, resumed: false, attempt };
}

/** @deprecated use ensureSupabaseAuthUser */
export async function createConfirmedSupabaseUser(input) {
  const result = await ensureSupabaseAuthUser(input);
  return { id: result.id };
}

async function completeSignupAfterOtp(body = {}) {
  signupFlowLog("otp_verify_start");
  let provisioning;
  try {
    provisioning = await verifySignupOtpForProvisioning(body);
  } catch (error) {
    if (error?.name === "SignupProvisioningError") {
      mapProvisioningError(error);
    }
    throw error;
  }

  try {
    return await runSignupProvisioning(body, provisioning);
  } catch (error) {
    if (error?.name === "SignupProvisioningError") {
      mapProvisioningError(error);
    }
    throw error;
  }
}

export async function handleSignupEmailCodeRequest(body = {}) {
  const action = String(body.action || "send").toLowerCase();

  if (action === "math-challenge") {
    return issueSignupMathChallenge();
  }

  if (action === "check") {
    const field = String(body.field || "").toLowerCase();
    if (field === "email" || field === "phone" || field === "username") {
      return checkSignupIdentityField(field, body[field] ?? body.email ?? body.phone ?? body.username);
    }
    await assertSignupIdentityAvailable({
      email: body.email,
      phone: body.phone,
      username: body.username
    });
    return { ok: true };
  }

  if (action === "send") {
    const isResend = Boolean(body.resend);
    return sendSignupOtp(body.email, body.name, {
      phone: body.phone || "",
      username: body.username || ""
    }, {
      resend: isResend,
      legalAccepted: isResend || Boolean(body.legalAccepted),
      mathToken: body.mathToken,
      mathAnswer: body.mathAnswer
    });
  }

  if (action === "verify") {
    return completeSignupAfterOtp(body);
  }

  throw new SignupOtpError(400, "Invalid action.");
}
