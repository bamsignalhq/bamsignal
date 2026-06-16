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

async function emailExistsInSupabaseAuth(email) {
  const config = supabaseServiceHeaders();
  if (!config) return false;

  const headers = buildSupabaseAdminHeaders(config.serviceKey);
  const list = await fetch(
    `${config.url}/auth/v1/admin/users?${new URLSearchParams({
      page: "1",
      per_page: "1",
      email
    })}`,
    { headers }
  );
  if (!list.ok) return false;
  const payload = await list.json().catch(() => null);
  return Boolean(payload?.users?.[0]?.id);
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
     where lower(coalesce(raw_user_meta_data->>'username', '')) = lower($1)
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
       and regexp_replace(phone, '\\D', '', 'g') = any($1::text[])
     limit 1`,
    [keys]
  );
  if (appUser.rows[0]) return true;

  await ensureMemberProfilesTable();
  const member = await query(
    `select id from app_member_profiles
     where phone is not null
       and regexp_replace(phone, '\\D', '', 'g') = any($1::text[])
     limit 1`,
    [keys]
  );
  if (member.rows[0]) return true;

  const authMeta = await query(
    `select id from auth.users
     where regexp_replace(coalesce(raw_user_meta_data->>'phone', ''), '\\D', '', 'g') = any($1::text[])
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

/** Block signup when email, phone, or username already belongs to an account. */
export async function assertSignupIdentityAvailable({ email, phone, username }) {
  const normalizedEmail = normalizeSignupEmail(email);
  const normalizedUsername = normalizeSignupUsername(username);
  const normalizedPhone = normalizeSignupPhone(phone);

  if (normalizedEmail) {
    const taken =
      (await emailExistsInDatabase(normalizedEmail)) ||
      (await emailExistsInSupabaseAuth(normalizedEmail));
    await throwIfTaken("email", taken);
  }

  if (normalizedUsername) {
    await throwIfTaken("username", await usernameExists(normalizedUsername));
  }

  if (normalizedPhone) {
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
