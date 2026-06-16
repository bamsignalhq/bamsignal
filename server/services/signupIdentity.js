import { ensureAppUsersTable, isDatabaseReady, query } from "../db.js";
import { ensureMemberProfilesTable } from "../cityHome.js";
import { supabaseServiceHeaders } from "../supabaseEnv.js";

export class SignupIdentityError extends Error {
  constructor(status, field, message) {
    super(message);
    this.name = "SignupIdentityError";
    this.status = status;
    this.field = field;
  }
}

const MESSAGES = {
  email: "An account with this email already exists. Try logging in instead.",
  phone: "This phone number is already linked to an account. Try logging in instead.",
  username: "This username is already taken. Choose another or log in."
};

export function normalizeSignupEmail(email = "") {
  return String(email).trim().toLowerCase();
}

export function normalizeSignupUsername(username = "") {
  return String(username).trim().toLowerCase().replace(/[^a-z]/g, "");
}

/** Nigerian local format: 0XXXXXXXXXX */
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

  // Legacy query param — only trust an exact email match on the returned row.
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

async function throwIfTaken(field, exists) {
  if (exists) {
    throw new SignupIdentityError(409, field, MESSAGES[field]);
  }
}

/** Check a single signup field as the user types. */
export async function checkSignupIdentityField(field, value) {
  if (field === "email") {
    const normalized = normalizeSignupEmail(value);
    if (!normalized.includes("@")) return { ok: true, field };
    await throwIfTaken("email", await emailExists(normalized));
    return { ok: true, field, email: normalized };
  }

  if (field === "username") {
    const normalized = normalizeSignupUsername(value);
    if (normalized.length < 7) return { ok: true, field };
    await throwIfTaken("username", await usernameExists(normalized));
    return { ok: true, field, username: normalized };
  }

  if (field === "phone") {
    const normalized = normalizeSignupPhone(value);
    if (normalized.length !== 11) return { ok: true, field };
    await throwIfTaken("phone", await phoneExists(normalized));
    return { ok: true, field, phone: normalized };
  }

  throw new SignupIdentityError(400, null, "Invalid field.");
}

/** Block signup when email, phone, or username already belongs to an account. */
export async function assertSignupIdentityAvailable({ email, phone, username }) {
  const normalizedEmail = normalizeSignupEmail(email);
  const normalizedUsername = normalizeSignupUsername(username);
  const normalizedPhone = normalizeSignupPhone(phone);

  if (normalizedEmail && normalizedEmail.includes("@")) {
    await throwIfTaken("email", await emailExists(normalizedEmail));
  }

  if (normalizedUsername && normalizedUsername.length >= 7) {
    await throwIfTaken("username", await usernameExists(normalizedUsername));
  }

  if (normalizedPhone && normalizedPhone.length === 11) {
    await throwIfTaken("phone", await phoneExists(normalizedPhone));
  }

  return {
    ok: true,
    email: normalizedEmail,
    username: normalizedUsername,
    phone: normalizedPhone
  };
}

export async function assertSignupEmailAvailable(email) {
  return assertSignupIdentityAvailable({ email, phone: "", username: "" });
}
