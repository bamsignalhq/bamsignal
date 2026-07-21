import { ensureAppUsersTable, isDatabaseReady, query } from "../db.js";
import { ensureMemberProfilesTable } from "./memberProfileSchema.js";
import { supabaseServiceHeaders } from "../supabaseEnv.js";
import { isDisposableEmail } from "../../shared/blockedEmailDomains.mjs";

export const DISPOSABLE_EMAIL_MESSAGE = "Please use a real email address to continue.";

export const SIGNUP_CONFLICT_CODES = {
  email: "email_exists",
  phone: "phone_exists",
  username: "username_exists"
};

export const SIGNUP_CONFLICT_MESSAGES = {
  email: "This email is already registered.",
  phone: "This phone number is already registered.",
  username: "This username is already taken."
};

export class SignupIdentityError extends Error {
  constructor(status, field, message, options = {}) {
    super(message);
    this.name = "SignupIdentityError";
    this.status = status;
    this.field = field;
    this.code = options.code || (field ? SIGNUP_CONFLICT_CODES[field] : null);
    this.conflicts = Array.isArray(options.conflicts) ? options.conflicts : null;
    this.suggestions = Array.isArray(options.suggestions) ? options.suggestions : null;
  }
}

export function normalizeSignupEmail(email = "") {
  return String(email).trim().toLowerCase();
}

export function normalizeSignupUsername(username = "") {
  return String(username).trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function normalizeSignupPhone(phone = "") {
  let digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) digits = `0${digits.slice(3)}`;
  if (digits.length === 10 && /^[789]/.test(digits)) digits = `0${digits}`;
  return digits;
}

export function phoneDigitKeys(phone = "") {
  const local = normalizeSignupPhone(phone);
  if (!local) return [];
  const bare = local.startsWith("0") ? local.slice(1) : local;
  const intl = `234${bare}`;
  return [...new Set([local, bare, intl])];
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

/**
 * Fallback when Postgres auth.users is unavailable.
 * Must verify exact email — list users without a working filter returns arbitrary users.
 */
async function emailExistsInSupabaseAuth(email) {
  const normalized = normalizeSignupEmail(email);
  if (!normalized.includes("@")) return false;

  const config = supabaseServiceHeaders();
  if (!config) return false;

  const headers = buildSupabaseAdminHeaders(config.serviceKey);

  const filterAttempt = await fetch(
    `${config.url}/auth/v1/admin/users?${new URLSearchParams({
      page: "1",
      per_page: "50",
      filter: normalized
    })}`,
    { headers }
  );
  if (filterAttempt.ok) {
    const payload = await filterAttempt.json().catch(() => null);
    const users = Array.isArray(payload?.users) ? payload.users : [];
    if (users.some((user) => authUserEmailMatches(user, normalized))) return true;
  }

  const list = await fetch(
    `${config.url}/auth/v1/admin/users?${new URLSearchParams({
      page: "1",
      per_page: "1",
      email: normalized
    })}`,
    { headers }
  );
  if (!list.ok) return false;
  const payload = await list.json().catch(() => null);
  const user = payload?.users?.[0];
  return authUserEmailMatches(user, normalized);
}

async function emailExistsInDatabase(email) {
  if (!isDatabaseReady()) return false;

  const authRow = await query(
    `select id from auth.users where lower(email) = lower($1) limit 1`,
    [email]
  );
  if (authRow.rows[0]) return true;

  await ensureAppUsersTable();
  const appUser = await query(
    `select id from app_users where lower(email) = lower($1) limit 1`,
    [email]
  );
  if (appUser.rows[0]) return true;

  await ensureMemberProfilesTable();
  const member = await query(
    `select id from app_member_profiles where lower(email) = lower($1) limit 1`,
    [email]
  );
  return Boolean(member.rows[0]);
}

async function emailExists(email) {
  const normalized = normalizeSignupEmail(email);
  if (!normalized.includes("@")) return false;

  if (isDatabaseReady()) {
    return emailExistsInDatabase(normalized);
  }
  return emailExistsInSupabaseAuth(normalized);
}

async function usernameExists(username) {
  if (!username || !isDatabaseReady()) return false;

  await ensureMemberProfilesTable();
  const member = await query(
    `select id from app_member_profiles where lower(username) = lower($1) limit 1`,
    [username]
  );
  if (member.rows[0]) return true;

  const authMeta = await query(
    `select id from auth.users
     where raw_user_meta_data->>'username' is not null
       and raw_user_meta_data->>'username' <> ''
       and lower(raw_user_meta_data->>'username') = lower($1)
     limit 1`,
    [username]
  );
  return Boolean(authMeta.rows[0]);
}

async function phoneExists(phone) {
  const keys = phoneDigitKeys(phone);
  if (!keys.length || !isDatabaseReady()) return false;

  await ensureAppUsersTable();
  const appUser = await query(
    `select id from app_users
     where phone is not null
       and phone <> ''
       and regexp_replace(phone, '\\D', '', 'g') = any($1::text[])
     limit 1`,
    [keys]
  );
  if (appUser.rows[0]) return true;

  await ensureMemberProfilesTable();
  const member = await query(
    `select id from app_member_profiles
     where phone is not null
       and phone <> ''
       and regexp_replace(phone, '\\D', '', 'g') = any($1::text[])
     limit 1`,
    [keys]
  );
  if (member.rows[0]) return true;

  const authMeta = await query(
    `select id from auth.users
     where coalesce(raw_user_meta_data->>'phone', '') <> ''
       and regexp_replace(coalesce(raw_user_meta_data->>'phone', ''), '\\D', '', 'g') = any($1::text[])
     limit 1`,
    [keys]
  );
  return Boolean(authMeta.rows[0]);
}

function conflictEntry(field) {
  return {
    field,
    code: SIGNUP_CONFLICT_CODES[field],
    message: SIGNUP_CONFLICT_MESSAGES[field]
  };
}

/**
 * Username suggestions from a taken base (does not hit DB for every suffix —
 * caller should re-check chosen suggestion via checkSignupIdentityField).
 */
export function buildUsernameSuggestions(rawUsername = "") {
  const base = normalizeSignupUsername(rawUsername).replace(/_+$/g, "").slice(0, 16) || "member";
  const stem = base.replace(/\d+$/g, "") || base;
  const candidates = [
    stem,
    `${stem}_01`,
    `${stem}_ng`,
    `official_${stem}`.slice(0, 24),
    `${stem}${Math.floor(Math.random() * 90 + 10)}`
  ];
  const seen = new Set();
  const out = [];
  for (const candidate of candidates) {
    const normalized = normalizeSignupUsername(candidate).slice(0, 24);
    if (normalized.length < 4 || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out.slice(0, 4);
}

export async function suggestAvailableUsernames(rawUsername = "", limit = 4) {
  const seeds = buildUsernameSuggestions(rawUsername);
  const available = [];
  for (const candidate of seeds) {
    if (available.length >= limit) break;
    if (!(await usernameExists(candidate))) {
      available.push(candidate);
    }
  }
  // Fill with numbered variants if needed
  const base = normalizeSignupUsername(rawUsername).replace(/\d+$/g, "").slice(0, 12) || "member";
  let n = 1;
  while (available.length < limit && n < 40) {
    const candidate = normalizeSignupUsername(`${base}_${String(n).padStart(2, "0")}`);
    n += 1;
    if (candidate.length < 4) continue;
    if (await usernameExists(candidate)) continue;
    if (available.includes(candidate)) continue;
    available.push(candidate);
  }
  return available;
}

export function assertEmailNotDisposable(email) {
  const normalized = normalizeSignupEmail(email);
  if (normalized && isDisposableEmail(normalized)) {
    throw new SignupIdentityError(400, "email", DISPOSABLE_EMAIL_MESSAGE, {
      code: "disposable_email"
    });
  }
}

/** Check a single signup field as the user types. */
export async function checkSignupIdentityField(field, value) {
  if (field === "email") {
    const normalized = normalizeSignupEmail(value);
    if (!normalized.includes("@")) {
      return { ok: true, available: true, field, status: "incomplete" };
    }
    assertEmailNotDisposable(normalized);
    if (await emailExists(normalized)) {
      throw new SignupIdentityError(409, "email", SIGNUP_CONFLICT_MESSAGES.email, {
        code: SIGNUP_CONFLICT_CODES.email,
        conflicts: [conflictEntry("email")]
      });
    }
    return { ok: true, available: true, field, email: normalized, status: "available" };
  }

  if (field === "username") {
    const normalized = normalizeSignupUsername(value);
    if (normalized.length < 4) {
      return { ok: true, available: true, field, status: "incomplete" };
    }
    if (await usernameExists(normalized)) {
      const suggestions = await suggestAvailableUsernames(normalized);
      throw new SignupIdentityError(409, "username", SIGNUP_CONFLICT_MESSAGES.username, {
        code: SIGNUP_CONFLICT_CODES.username,
        conflicts: [conflictEntry("username")],
        suggestions
      });
    }
    return { ok: true, available: true, field, username: normalized, status: "available" };
  }

  if (field === "phone") {
    const normalized = normalizeSignupPhone(value);
    if (normalized.length !== 11) {
      return { ok: true, available: true, field, status: "incomplete" };
    }
    if (await phoneExists(normalized)) {
      throw new SignupIdentityError(409, "phone", SIGNUP_CONFLICT_MESSAGES.phone, {
        code: SIGNUP_CONFLICT_CODES.phone,
        conflicts: [conflictEntry("phone")]
      });
    }
    return { ok: true, available: true, field, phone: normalized, status: "available" };
  }

  throw new SignupIdentityError(400, null, "Invalid field.");
}

/**
 * Collect every conflicting identity field at once (email + username + phone).
 */
export async function collectSignupIdentityConflicts({ email, phone, username }) {
  const normalizedEmail = normalizeSignupEmail(email);
  const normalizedUsername = normalizeSignupUsername(username);
  const normalizedPhone = normalizeSignupPhone(phone);
  const conflicts = [];

  if (normalizedEmail && normalizedEmail.includes("@")) {
    assertEmailNotDisposable(normalizedEmail);
    if (await emailExists(normalizedEmail)) {
      conflicts.push(conflictEntry("email"));
    }
  }

  let suggestions = null;
  if (normalizedUsername && normalizedUsername.length >= 4) {
    if (await usernameExists(normalizedUsername)) {
      conflicts.push(conflictEntry("username"));
      suggestions = await suggestAvailableUsernames(normalizedUsername);
    }
  }

  if (normalizedPhone && normalizedPhone.length === 11) {
    if (await phoneExists(normalizedPhone)) {
      conflicts.push(conflictEntry("phone"));
    }
  }

  return {
    email: normalizedEmail,
    username: normalizedUsername,
    phone: normalizedPhone,
    conflicts,
    suggestions
  };
}

/** Block signup when email, phone, or username already belongs to an account. */
export async function assertSignupIdentityAvailable({ email, phone, username }) {
  const result = await collectSignupIdentityConflicts({ email, phone, username });

  if (result.conflicts.length > 0) {
    const primary = result.conflicts[0];
    throw new SignupIdentityError(409, primary.field, primary.message, {
      code: primary.code,
      conflicts: result.conflicts,
      suggestions: result.suggestions
    });
  }

  return {
    ok: true,
    email: result.email,
    username: result.username,
    phone: result.phone
  };
}

export async function assertSignupEmailAvailable(email) {
  return assertSignupIdentityAvailable({ email, phone: "", username: "" });
}
