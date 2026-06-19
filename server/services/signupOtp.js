import {
  assertSignupIdentityAvailable,
  checkSignupIdentityField,
  assertEmailNotDisposable,
  normalizeSignupEmail,
  normalizeSignupPhone,
  normalizeSignupUsername,
  SignupIdentityError
} from "./signupIdentity.js";
export { SignupIdentityError } from "./signupIdentity.js";
import {
  assertSignupMathChallengePassed,
  issueSignupMathChallenge
} from "./signupMathChallenge.js";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { findAppUserIdentity, isDatabaseReady, normalizeUserKey, query, upsertAppUserIdentity } from "../db.js";
import { findMemberProfileByUserKey, upsertMemberProfile } from "../cityHome.js";
import { supabaseServiceHeaders } from "../supabaseEnv.js";
import { loadEmailBranding, buildSignupVerificationEmailBody, wrapEmailLayoutAsync } from "./emailBranding.js";
import { verifyLoginPassword } from "./pinLogin.js";

dotenv.config();

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 8;
const DEFAULT_SIGNUP_CITY = "Lagos";
const DEFAULT_SIGNUP_STATE = "Lagos";
const SIGNUP_USER_MESSAGE = "We couldn't complete your signup. Please try again.";

/** @type {Map<string, { hash: string; expires: number; attempts: number; lastSent: number }>} */
const memoryStore = new Map();

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
  if (serviceKey.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${serviceKey}`;
  }
  return headers;
}

function authUserEmailMatches(user, email) {
  const normalized = normalizeSignupEmail(email);
  const userEmail = normalizeSignupEmail(user?.email || "");
  return Boolean(normalized && userEmail && userEmail === normalized);
}

async function findSupabaseUserByEmail(email) {
  const config = supabaseServiceHeaders();
  if (!config) return null;

  const normalized = normalizeSignupEmail(email);
  const headers = buildSupabaseAdminHeaders(config.serviceKey);
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
  const user = payload?.users?.[0];
  if (!user?.id || !authUserEmailMatches(user, normalized)) return null;
  return user;
}

async function updateSupabaseAuthUser(userId, { password, name, username, phone }) {
  const config = supabaseServiceHeaders();
  if (!config) {
    throw new SignupOtpError(503, SIGNUP_USER_MESSAGE, "service_role_missing");
  }

  const headers = buildSupabaseAdminHeaders(config.serviceKey);
  const response = await fetch(`${config.url}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      password: String(password),
      email_confirm: true,
      user_metadata: {
        name: String(name || "").trim(),
        username: normalizeSignupUsername(username),
        phone: normalizeSignupPhone(phone)
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    signupFlowLog("user_create_failed", {
      reason: "supabase_update_failed",
      status: response.status,
      detail: detail.slice(0, 240)
    });
    throw new SignupOtpError(502, SIGNUP_USER_MESSAGE, "session_failed");
  }

  return { id: userId, created: false };
}

async function ensureSupabaseAuthUser({ email, password, name, username, phone }) {
  const config = supabaseServiceHeaders();
  if (!config) {
    signupFlowLog("user_create_failed", { reason: "service_role_missing" });
    throw new SignupOtpError(503, SIGNUP_USER_MESSAGE, "service_role_missing");
  }

  const normalized = normalizeSignupEmail(email);
  const headers = buildSupabaseAdminHeaders(config.serviceKey);
  const userMetadata = {
    name: String(name || "").trim(),
    username: normalizeSignupUsername(username),
    phone: normalizeSignupPhone(phone)
  };

  const existing = await findSupabaseUserByEmail(normalized);
  if (existing?.id) {
    return updateSupabaseAuthUser(existing.id, { password, name, username, phone });
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
    const user = await response.json();
    return { id: user.id, created: true };
  }

  const detail = await response.text();
  if (/already registered|already exists|duplicate/i.test(detail)) {
    const raced = await findSupabaseUserByEmail(normalized);
    if (raced?.id) {
      signupFlowLog("duplicate_recover", { userId: raced.id });
      return updateSupabaseAuthUser(raced.id, { password, name, username, phone });
    }
    signupFlowLog("user_create_failed", { reason: "duplicate_user_unresolved", detail: detail.slice(0, 240) });
    throw new SignupOtpError(
      409,
      "An account with this email already exists. Try logging in instead.",
      "duplicate_user"
    );
  }

  signupFlowLog("user_create_failed", {
    reason: "supabase_create_failed",
    status: response.status,
    detail: detail.slice(0, 240)
  });
  throw new SignupOtpError(502, SIGNUP_USER_MESSAGE, "user_insert_failed");
}

/** @deprecated use ensureSupabaseAuthUser */
export async function createConfirmedSupabaseUser(input) {
  const result = await ensureSupabaseAuthUser(input);
  return { id: result.id };
}

async function usernameTakenByOther(username, userKey) {
  const normalized = normalizeSignupUsername(username);
  if (!normalized || normalized.length < 7 || !isDatabaseReady()) return false;

  const result = await query(
    `select id from app_member_profiles
     where lower(username) = lower($1)
       and user_key <> $2
     limit 1`,
    [normalized, userKey]
  );
  return Boolean(result.rows[0]);
}

async function phoneTakenByOther(phone, userKey) {
  const normalized = normalizeSignupPhone(phone);
  if (!normalized || normalized.length !== 11 || !isDatabaseReady()) return false;

  const keys = [normalized, normalized.slice(1), `234${normalized.slice(1)}`];
  const result = await query(
    `select id from app_member_profiles
     where phone is not null
       and phone <> ''
       and regexp_replace(phone, '\\D', '', 'g') = any($1::text[])
       and user_key <> $2
     limit 1`,
    [keys, userKey]
  );
  return Boolean(result.rows[0]);
}

async function resolveSignupProvisioningMode({ email, phone }) {
  const normalizedEmail = normalizeSignupEmail(email);
  const normalizedPhone = normalizeSignupPhone(phone);
  const userKey = normalizeUserKey({ email: normalizedEmail, phone: normalizedPhone });

  const member = await findMemberProfileByUserKey(normalizedEmail, normalizedPhone);
  if (member?.onboarding_complete) {
    return { mode: "complete", member, userKey };
  }

  const authUser = await findSupabaseUserByEmail(normalizedEmail);
  const appUser = isDatabaseReady()
    ? await findAppUserIdentity({ email: normalizedEmail, phone: normalizedPhone })
    : null;

  if (authUser || appUser || member) {
    return { mode: "repair", member, userKey, authUser, appUser };
  }

  return { mode: "fresh", member: null, userKey };
}

async function assertRepairIdentityAvailable({ email, phone, username, userKey, member }) {
  const normalizedUsername = normalizeSignupUsername(username);
  const normalizedPhone = normalizeSignupPhone(phone);

  if (normalizedUsername.length >= 7) {
    const taken = await usernameTakenByOther(normalizedUsername, userKey || member?.user_key || "");
    if (taken) {
      throw new SignupIdentityError(409, "username", "This username is already taken. Choose another or log in.");
    }
  }

  if (normalizedPhone.length === 11) {
    const taken = await phoneTakenByOther(normalizedPhone, userKey || member?.user_key || "");
    if (taken) {
      throw new SignupIdentityError(
        409,
        "phone",
        "This phone number is already linked to an account. Try logging in instead."
      );
    }
  }

  return { email: normalizeSignupEmail(email), phone: normalizedPhone, username: normalizedUsername };
}

async function ensureAppUserRecord({ email, phone, name }) {
  if (!isDatabaseReady()) {
    signupFlowLog("user_insert_failed", { reason: "database_disconnected" });
    throw new SignupOtpError(503, SIGNUP_USER_MESSAGE, "database_disconnected");
  }

  const user = await upsertAppUserIdentity({
    email: normalizeSignupEmail(email),
    phone: normalizeSignupPhone(phone),
    name: String(name || "").trim()
  });

  if (!user?.id) {
    signupFlowLog("user_insert_failed", { reason: "app_users_upsert_null" });
    throw new SignupOtpError(502, SIGNUP_USER_MESSAGE, "user_insert_failed");
  }

  return user;
}

async function ensureMemberProfileStub({ email, phone, name, username, existingMember }) {
  if (!isDatabaseReady()) {
    signupFlowLog("profile_insert_failed", { reason: "database_disconnected" });
    throw new SignupOtpError(503, SIGNUP_USER_MESSAGE, "profile_insert_failed");
  }

  if (existingMember?.onboarding_complete) {
    return existingMember;
  }

  const existingProfile =
    existingMember?.profile && typeof existingMember.profile === "object" ? existingMember.profile : {};

  const row = await upsertMemberProfile({
    email: normalizeSignupEmail(email),
    phone: normalizeSignupPhone(phone),
    name: String(name || "").trim(),
    username: normalizeSignupUsername(username),
    city: existingMember?.city || DEFAULT_SIGNUP_CITY,
    state: existingMember?.state || DEFAULT_SIGNUP_STATE,
    profile: {
      ...existingProfile,
      name: String(name || "").trim(),
      username: normalizeSignupUsername(username),
      onboardingComplete: false,
      photos: Array.isArray(existingProfile.photos) ? existingProfile.photos : []
    },
    discoverable: false,
    onboardingComplete: false,
    cityHomeHidden: true
  });

  if (!row?.id) {
    signupFlowLog("profile_insert_failed", { reason: "member_profile_upsert_null" });
    throw new SignupOtpError(502, SIGNUP_USER_MESSAGE, "profile_insert_failed");
  }

  return row;
}

async function mintSignupSession(email, password) {
  const normalizedEmail = normalizeSignupEmail(email);
  const secret = String(password || "");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const login = await verifyLoginPassword(normalizedEmail, secret);
    if (login.ok && login.session) {
      signupFlowLog("session_create_success", { attempt: attempt + 1 });
      return login.session;
    }
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 120 * (attempt + 1)));
    }
  }
  signupFlowLog("session_create_failed", { reason: "token_grant_failed" });
  throw new SignupOtpError(502, SIGNUP_USER_MESSAGE, "session_failed");
}

async function completeSignupAfterOtp(body = {}) {
  signupFlowLog("otp_verify_start");
  await verifySignupOtp(body.email, body.code);
  signupFlowLog("otp_verified");

  const { mode, member, userKey } = await resolveSignupProvisioningMode(body);

  if (mode === "fresh") {
    await assertSignupIdentityAvailable({
      email: body.email,
      phone: body.phone,
      username: body.username
    });
  } else if (mode === "complete") {
    signupFlowLog("duplicate_recover", { mode });
    await assertRepairIdentityAvailable({
      email: body.email,
      phone: body.phone,
      username: body.username,
      userKey,
      member
    });
  } else {
    signupFlowLog("profile_repair", { mode });
    await assertRepairIdentityAvailable({
      email: body.email,
      phone: body.phone,
      username: body.username,
      userKey,
      member
    });
  }

  signupFlowLog("user_create_start", { mode });
  const authUser = await ensureSupabaseAuthUser({
    email: body.email,
    password: body.password,
    name: body.name,
    username: body.username,
    phone: body.phone
  });
  signupFlowLog("user_create_success", { userId: authUser.id, created: authUser.created, mode });

  signupFlowLog("profile_create_start");
  const [, profileRow] = await Promise.all([
    ensureAppUserRecord({
      email: body.email,
      phone: body.phone,
      name: body.name
    }),
    ensureMemberProfileStub({
      email: body.email,
      phone: body.phone,
      name: body.name,
      username: body.username,
      existingMember: member
    })
  ]);
  signupFlowLog("profile_create_success", { profileId: profileRow.id, onboardingComplete: profileRow.onboarding_complete });

  signupFlowLog("session_create_start");
  const session = await mintSignupSession(body.email, body.password);

  return {
    ok: true,
    email: normalizeSignupEmail(body.email),
    memberProfileId: profileRow.id,
    onboardingComplete: Boolean(profileRow.onboarding_complete),
    recovered: mode !== "fresh",
    session
  };
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
