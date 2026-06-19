import crypto from "node:crypto";
import { findMemberProfileByUserKey } from "../cityHome.js";
import { isDatabaseReady, query } from "../db.js";
import { normalizeSignupPhone } from "./signupIdentity.js";
import { resolveLoginAccount } from "./loginResolve.js";
import { resolveSupabaseUrl } from "../supabaseEnv.js";
import { supabaseServiceHeaders } from "../supabaseEnv.js";

export const INVALID_LOGIN_MESSAGE = "Invalid username or PIN.";

function loginDebug(key, value) {
  console.info(`[login-debug] ${key}`, value);
}

function resolveAnonKey() {
  return String(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
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

function pickString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function extractLegacyAuthFields(profileJson = {}) {
  const profile = profileJson && typeof profileJson === "object" ? profileJson : {};
  return {
    passwordHash: pickString(profile.passwordHash, profile.password_hash),
    pinHash: pickString(profile.pinHash, profile.pin_hash),
    legacyPinHash: pickString(profile.legacyPinHash, profile.legacy_pin_hash),
    authPinHash: pickString(profile.authPinHash, profile.auth_pin_hash),
    plaintextPin: pickString(profile.pin, profile.authPin, profile.auth_pin, profile.legacyPin, profile.legacy_pin),
    plaintextPassword: pickString(profile.password, profile.plaintextPassword, profile.plaintext_password)
  };
}

function hashPinSecret(secret) {
  return crypto.createHash("sha256").update(`bamsignal:pin:${secret}`).digest("hex");
}

function verifyLegacySecret(secret, candidate) {
  if (!secret || !candidate) return false;
  const value = String(secret);
  const stored = String(candidate);
  if (value === stored) return true;
  if (stored === hashPinSecret(value)) return true;
  if (stored.length === 64 && stored === crypto.createHash("sha256").update(value).digest("hex")) {
    return true;
  }
  return false;
}

function verifyLegacyPin(secret, fields) {
  if (!secret) return false;
  if (fields.plaintextPin && verifyLegacySecret(secret, fields.plaintextPin)) return true;
  if (fields.plaintextPassword && verifyLegacySecret(secret, fields.plaintextPassword)) return true;
  if (fields.pinHash && verifyLegacySecret(secret, fields.pinHash)) return true;
  if (fields.passwordHash && verifyLegacySecret(secret, fields.passwordHash)) return true;
  if (fields.legacyPinHash && verifyLegacySecret(secret, fields.legacyPinHash)) return true;
  if (fields.authPinHash && verifyLegacySecret(secret, fields.authPinHash)) return true;
  return false;
}

async function clearLegacyPinFields(member) {
  if (!member?.id || !isDatabaseReady()) return;
  const profile =
    member.profile && typeof member.profile === "object" ? { ...member.profile } : {};
  let changed = false;
  for (const key of [
    "pin",
    "authPin",
    "auth_pin",
    "legacyPin",
    "legacy_pin",
    "password",
    "plaintextPassword",
    "plaintext_password",
    "pinHash",
    "pin_hash",
    "passwordHash",
    "password_hash",
    "legacyPinHash",
    "legacy_pin_hash",
    "authPinHash",
    "auth_pin_hash"
  ]) {
    if (profile[key] != null) {
      delete profile[key];
      changed = true;
    }
  }
  if (!changed) return;
  await query(`update app_member_profiles set profile = $2, updated_at = now() where id = $1`, [
    member.id,
    profile
  ]);
}

async function ensureSupabaseAuthPassword({ email, password, name, username, phone, authUserId }) {
  const config = supabaseServiceHeaders();
  if (!config) return null;

  const headers = buildSupabaseAdminHeaders(config.serviceKey);
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const metadata = {
    name: String(name || "").trim(),
    username: String(username || "").trim().toLowerCase(),
    phone: normalizeSignupPhone(phone || "")
  };

  if (authUserId) {
    const response = await fetch(`${config.url}/auth/v1/admin/users/${authUserId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        email: normalizedEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: metadata
      })
    });
    if (!response.ok) return null;
    const user = await response.json().catch(() => null);
    return user?.id ? String(user.id) : authUserId;
  }

  const response = await fetch(`${config.url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: normalizedEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: metadata
    })
  });

  if (response.ok) {
    const user = await response.json().catch(() => null);
    return user?.id ? String(user.id) : null;
  }

  const detail = await response.text();
  if (/already registered|already exists|duplicate/i.test(detail)) {
    const list = await fetch(
      `${config.url}/auth/v1/admin/users?${new URLSearchParams({
        page: "1",
        per_page: "1",
        email: normalizedEmail
      })}`,
      { headers }
    );
    if (!list.ok) return null;
    const payload = await list.json().catch(() => null);
    const existingId = payload?.users?.[0]?.id;
    if (!existingId) return null;
    return ensureSupabaseAuthPassword({
      email: normalizedEmail,
      password,
      name,
      username,
      phone,
      authUserId: existingId
    });
  }

  return null;
}

/** Resolve username to the Supabase auth email used for PIN login. */
export async function resolveLoginUsername(rawUsername = "") {
  const account = await resolveLoginAccount(rawUsername);
  return {
    email: account.email,
    username: account.username,
    matched: account.usernameFound,
    profileExists: account.profileExists
  };
}

/** @deprecated Use resolveLoginUsername — username-only login. */
export async function resolveLoginIdentifier(rawIdentifier = "") {
  return resolveLoginUsername(rawIdentifier);
}

/** Verify PIN via Supabase password grant (never logs the PIN). */
export async function verifyLoginPassword(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const secret = String(password || "");
  if (!normalizedEmail || !secret) {
    loginDebug("pinCompareResult", false);
    return { ok: false, session: null, error: INVALID_LOGIN_MESSAGE };
  }

  const supabaseUrl = resolveSupabaseUrl();
  const anonKey = resolveAnonKey();
  if (!supabaseUrl || !anonKey) {
    loginDebug("pinCompareResult", false);
    return { ok: false, session: null, error: "Auth is not configured." };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: normalizedEmail, password: secret })
    });
    const payload = await response.json().catch(() => ({}));
    const ok = response.ok && Boolean(payload?.access_token);
    loginDebug("pinCompareResult", ok);
    if (!ok) {
      return {
        ok: false,
        session: null,
        error: INVALID_LOGIN_MESSAGE
      };
    }
    loginDebug("sessionCreated", true);
    return {
      ok: true,
      session: {
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
        expires_in: payload.expires_in,
        expires_at: payload.expires_at,
        token_type: payload.token_type,
        user: payload.user
      },
      error: null
    };
  } catch (error) {
    loginDebug("pinCompareResult", false);
    return {
      ok: false,
      session: null,
      error: error instanceof Error ? error.message : "Login failed."
    };
  }
}

/** @deprecated Use verifyLoginPassword */
export async function verifyLoginPin(email, pin) {
  return verifyLoginPassword(email, pin);
}

async function verifyWithLegacyFallback(account, password) {
  const member = account.member;
  if (!member?.id) {
    loginDebug("hasPasswordHash", false);
    loginDebug("hasPinHash", false);
    return { ok: false, migrated: false };
  }

  const fields = extractLegacyAuthFields(member.profile);
  loginDebug("hasPasswordHash", Boolean(fields.passwordHash));
  loginDebug("hasPinHash", Boolean(fields.pinHash || fields.legacyPinHash || fields.authPinHash));

  if (!verifyLegacyPin(password, fields)) {
    loginDebug("pinCompareResult", false);
    return { ok: false, migrated: false };
  }

  loginDebug("pinCompareResult", true);
  const email = account.email || account.emails[0];
  if (!email) return { ok: false, migrated: false };

  const authUserId = await ensureSupabaseAuthPassword({
    email,
    password,
    name: member.name,
    username: member.username || account.username,
    phone: member.phone,
    authUserId: account.authUser?.id || null
  });
  if (!authUserId) return { ok: false, migrated: false };

  await clearLegacyPinFields(member);
  return { ok: true, migrated: true, email };
}

export async function loginWithUsernameAndPassword(username, password) {
  const account = await resolveLoginAccount(username);
  if (!account.usernameFound || !account.emails.length) {
    loginDebug("sessionCreated", false);
    return { ok: false, error: INVALID_LOGIN_MESSAGE, resolved: account };
  }

  for (const email of account.emails) {
    const verified = await verifyLoginPassword(email, password);
    if (verified.ok) {
      return {
        ok: true,
        email,
        session: verified.session,
        error: null,
        resolved: { ...account, email, matched: true, profileExists: account.profileExists }
      };
    }
  }

  const legacy = await verifyWithLegacyFallback(account, password);
  if (legacy.ok && legacy.email) {
    const verified = await verifyLoginPassword(legacy.email, password);
    if (verified.ok) {
      const member = account.member
        ? await findMemberProfileByUserKey(legacy.email, account.member.phone)
        : null;
      return {
        ok: true,
        email: legacy.email,
        session: verified.session,
        error: null,
        resolved: {
          ...account,
          email: legacy.email,
          matched: true,
          profileExists: Boolean(member?.id || account.profileExists)
        }
      };
    }
  }

  loginDebug("sessionCreated", false);
  return {
    ok: false,
    error: INVALID_LOGIN_MESSAGE,
    resolved: {
      ...account,
      matched: account.usernameFound,
      profileExists: account.profileExists
    }
  };
}

/** @deprecated Use loginWithUsernameAndPassword */
export async function loginWithIdentifierAndPin(identifier, pin) {
  return loginWithUsernameAndPassword(identifier, pin);
}
