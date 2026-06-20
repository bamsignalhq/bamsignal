import crypto from "node:crypto";
import { isDatabaseReady, query } from "../db.js";
import { normalizeSignupPhone, normalizeSignupUsername } from "./signupIdentity.js";
import { normalizeLoginUsername, resolveLoginAccount } from "./loginResolve.js";
import { resolveSupabaseUrl } from "../supabaseEnv.js";
import { supabaseServiceHeaders } from "../supabaseEnv.js";

export const INVALID_LOGIN_MESSAGE = "Invalid username or PIN.";
const DEFAULT_REPAIR_CITY = "Lagos";
const DEFAULT_REPAIR_STATE = "Lagos";

function pinLoginLog(label, value) {
  console.info(`[pin-login] ${label}`, value);
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
  const nestedSources = [profile];
  for (const key of ["auth", "security", "credentials"]) {
    const nested = profile[key];
    if (nested && typeof nested === "object") nestedSources.push(nested);
  }

  const pickFromSources = (...keys) => {
    for (const source of nestedSources) {
      for (const key of keys) {
        const text = String(source?.[key] ?? "").trim();
        if (text) return text;
      }
    }
    return "";
  };

  return {
    passwordHash: pickFromSources("passwordHash", "password_hash"),
    pinHash: pickFromSources("pinHash", "pin_hash"),
    legacyPinHash: pickFromSources("legacyPinHash", "legacy_pin_hash"),
    authPinHash: pickFromSources("authPinHash", "auth_pin_hash"),
    plaintextPin: pickFromSources(
      "pin",
      "authPin",
      "auth_pin",
      "legacyPin",
      "legacy_pin",
      "loginPin",
      "login_pin"
    ),
    plaintextPassword: pickFromSources("password", "plaintextPassword", "plaintext_password")
  };
}

function legacyPinHashExists(fields) {
  return Boolean(
    fields.pinHash ||
      fields.legacyPinHash ||
      fields.authPinHash ||
      fields.passwordHash ||
      fields.plaintextPin ||
      fields.plaintextPassword
  );
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
  const keys = [
    "pin",
    "authPin",
    "auth_pin",
    "legacyPin",
    "legacy_pin",
    "loginPin",
    "login_pin",
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
  ];
  for (const key of keys) {
    if (profile[key] != null) {
      delete profile[key];
      changed = true;
    }
  }
  for (const nestedKey of ["auth", "security", "credentials"]) {
    const nested = profile[nestedKey];
    if (!nested || typeof nested !== "object") continue;
    const next = { ...nested };
    let nestedChanged = false;
    for (const key of keys) {
      if (next[key] != null) {
        delete next[key];
        nestedChanged = true;
      }
    }
    if (nestedChanged) {
      profile[nestedKey] = next;
      changed = true;
    }
  }
  if (!changed) return;
  await query(`update app_member_profiles set profile = $2, updated_at = now() where id = $1`, [
    member.id,
    profile
  ]);
}

async function syncSupabaseAuthPasswordViaSql({ email, password, name, username, phone, authUserId }) {
  if (!isDatabaseReady()) return null;

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const metadata = JSON.stringify({
    name: String(name || "").trim(),
    username: normalizeSignupUsername(username),
    phone: normalizeSignupPhone(phone || "")
  });

  let userId = authUserId || null;
  if (!userId) {
    const existing = await query(
      "select id from auth.users where lower(email) = lower($1) limit 1",
      [normalizedEmail]
    );
    userId = existing.rows[0]?.id || null;
  }

  if (!userId) return null;

  await query(
    `update auth.users
     set encrypted_password = crypt($2::text, gen_salt('bf')),
         email_confirmed_at = coalesce(email_confirmed_at, now()),
         raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || $3::jsonb,
         updated_at = now()
     where id = $1::uuid`,
    [userId, String(password), metadata]
  );

  return String(userId);
}

async function ensureSupabaseAuthPassword({ email, password, name, username, phone, authUserId }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const config = supabaseServiceHeaders();

  if (config) {
    const headers = buildSupabaseAdminHeaders(config.serviceKey);
    const metadata = {
      name: String(name || "").trim(),
      username: normalizeSignupUsername(username),
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
      if (response.ok) {
        const user = await response.json().catch(() => null);
        return user?.id ? String(user.id) : authUserId;
      }
    } else {
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
        if (user?.id) return String(user.id);
      } else {
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
          if (list.ok) {
            const payload = await list.json().catch(() => null);
            const existingId = payload?.users?.[0]?.id;
            if (existingId) {
              return ensureSupabaseAuthPassword({
                email: normalizedEmail,
                password,
                name,
                username,
                phone,
                authUserId: existingId
              });
            }
          }
        }
      }
    }
  }

  return syncSupabaseAuthPasswordViaSql({
    email: normalizedEmail,
    password,
    name,
    username,
    phone,
    authUserId
  });
}

function resolveAccountEmail(account) {
  const candidates = [
    account.email,
    ...(account.emails || []),
    String(account.member?.email || "").trim().toLowerCase(),
    String(account.authUser?.email || "").trim().toLowerCase()
  ];
  for (const value of candidates) {
    const email = String(value || "").trim().toLowerCase();
    if (email.includes("@") && !email.includes("@phone.bamsignal.local")) {
      return email;
    }
  }
  return null;
}

function completionMarked(profileJson = {}, member = {}) {
  const profile = profileJson && typeof profileJson === "object" ? profileJson : {};
  return Boolean(
    member?.onboarding_complete ||
      profile.onboardingComplete ||
      profile.onboardingCompleted ||
      profile.onboarding_completed ||
      profile.setupCompleted ||
      profile.setup_completed ||
      profile.profileCompletedAt ||
      profile.profile_completed_at ||
      profile.onboardingCompletedAt ||
      profile.onboarding_completed_at ||
      profile.completedAt ||
      profile.completed_at
  );
}

async function repairLoginIdentityAfterSuccess(account, email, session) {
  if (!isDatabaseReady()) return;

  try {
    const sessionUser = session?.user && typeof session.user === "object" ? session.user : {};
    const sessionMeta =
      sessionUser.user_metadata && typeof sessionUser.user_metadata === "object"
        ? sessionUser.user_metadata
        : {};
    const authMeta =
      account.authUser?.raw_user_meta_data && typeof account.authUser.raw_user_meta_data === "object"
        ? account.authUser.raw_user_meta_data
        : {};
    const normalizedEmail = String(email || account.email || sessionUser.email || "")
      .trim()
      .toLowerCase();
    const username = normalizeLoginUsername(
      account.username || account.member?.username || authMeta.username || sessionMeta.username || ""
    );
    const phone = normalizeSignupPhone(
      pickString(account.member?.phone, authMeta.phone, sessionMeta.phone)
    );
    const name = pickString(account.member?.name, authMeta.name, sessionMeta.name, "Member");

    if (!normalizedEmail && !phone) return;

    const { upsertAppUserIdentity } = await import("../db.js");
    const { findMemberProfileByUserKey, upsertMemberProfile } = await import("../cityHome.js");
    const { repairOnboardingStatus } = await import("./onboardingRepair.js");

    const appUser = await upsertAppUserIdentity({
      email: normalizedEmail || null,
      phone: phone || null,
      name
    });

    let member =
      account.member?.id
        ? account.member
        : await findMemberProfileByUserKey(normalizedEmail, phone);

    const existingProfile =
      member?.profile && typeof member.profile === "object" ? { ...member.profile } : {};
    const hasMember = Boolean(member?.id);
    const profile = {
      ...existingProfile,
      name: pickString(existingProfile.name, name),
      username: pickString(existingProfile.username, username) || undefined,
      photos: Array.isArray(existingProfile.photos) ? existingProfile.photos : []
    };
    const city = pickString(member?.city, existingProfile.city, DEFAULT_REPAIR_CITY);
    const state = pickString(member?.state, existingProfile.state, DEFAULT_REPAIR_STATE);
    const complete = completionMarked(existingProfile, member);

    const repairedMember = await upsertMemberProfile({
      email: normalizedEmail || member?.email || null,
      phone: phone || member?.phone || null,
      name,
      username: username || member?.username || existingProfile.username || null,
      city,
      state,
      profile,
      discoverable: hasMember ? member.discoverable !== false : false,
      onboardingComplete: complete,
      cityHomeHidden: hasMember ? Boolean(member.city_home_hidden) : true
    });
    member = repairedMember || member;

    const authUserId = pickString(sessionUser.id, account.authUser?.id);
    const repair = await repairOnboardingStatus(authUserId || member?.id || appUser?.id || normalizedEmail, {
      email: normalizedEmail,
      phone,
      username,
      name
    });
    if (repair?.completed) {
      pinLoginLog("identity repair", {
        linked: Boolean(member?.id && appUser?.id),
        onboarding: "complete",
        repaired: Boolean(repair.repaired)
      });
    } else {
      pinLoginLog("identity repair", {
        linked: Boolean(member?.id && appUser?.id),
        onboarding: "incomplete"
      });
    }
  } catch (error) {
    pinLoginLog("identity repair", {
      ok: false,
      reason: error instanceof Error ? error.message.slice(0, 160) : "failed"
    });
  }
}

/** Resolve username to the Supabase auth email used for PIN login. */
export async function resolveLoginUsername(rawUsername = "") {
  pinLoginLog("raw username received", String(rawUsername || "").trim());
  const account = await resolveLoginAccount(rawUsername);
  pinLoginLog("normalized username", account.username || "(empty)");
  pinLoginLog("user found", account.usernameFound);
  pinLoginLog("profile found", account.profileExists);
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
    pinLoginLog("pin compare", false);
    return { ok: false, session: null, error: INVALID_LOGIN_MESSAGE };
  }

  const supabaseUrl = resolveSupabaseUrl();
  const anonKey = resolveAnonKey();
  if (!supabaseUrl || !anonKey) {
    pinLoginLog("pin compare", false);
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
    pinLoginLog("pin compare", ok);
    if (!ok) {
      const grantError = String(payload?.error_description || payload?.error || payload?.msg || "").trim();
      if (grantError) {
        pinLoginLog("token grant rejected", grantError.slice(0, 160));
      }
      return {
        ok: false,
        session: null,
        error: INVALID_LOGIN_MESSAGE
      };
    }
    pinLoginLog("session created", true);
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
    pinLoginLog("pin compare", false);
    return {
      ok: false,
      session: null,
      error: error instanceof Error ? error.message : "Login failed."
    };
  }
}

async function verifyLoginPasswordWithRetry(email, password, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const verified = await verifyLoginPassword(email, password);
    if (verified.ok) return verified;
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 120 * (attempt + 1)));
    }
  }
  return { ok: false, session: null, error: INVALID_LOGIN_MESSAGE };
}

/** @deprecated Use verifyLoginPassword */
export async function verifyLoginPin(email, pin) {
  return verifyLoginPassword(email, pin);
}

async function verifyLoginPasswordViaSql({ email, username, authUserId, password }) {
  if (!isDatabaseReady()) return { ok: false, userId: null, email: null };
  const secret = String(password || "");
  if (!secret) return { ok: false, userId: null, email: null };

  const rowFromResult = (result) => {
    const row = result.rows[0];
    if (!row?.id) return { ok: false, userId: null, email: null };
    return {
      ok: true,
      userId: String(row.id),
      email: String(row.email || "").trim().toLowerCase()
    };
  };

  if (authUserId) {
    const byId = await query(
      `select id, email
       from auth.users
       where id = $1::uuid
         and encrypted_password is not null
         and encrypted_password = crypt($2::text, encrypted_password)
       limit 1`,
      [authUserId, secret]
    );
    const match = rowFromResult(byId);
    if (match.ok) return match;
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (normalizedEmail.includes("@")) {
    const byEmail = await query(
      `select id, email
       from auth.users
       where lower(email) = lower($1)
         and encrypted_password is not null
         and encrypted_password = crypt($2::text, encrypted_password)
       limit 1`,
      [normalizedEmail, secret]
    );
    const match = rowFromResult(byEmail);
    if (match.ok) return match;
  }

  const normalizedUsername = normalizeLoginUsername(username || "");
  if (normalizedUsername) {
    const byUsername = await query(
      `select id, email
       from auth.users
       where coalesce(nullif(raw_user_meta_data->>'username', ''), '') <> ''
         and lower(raw_user_meta_data->>'username') = lower($1)
         and encrypted_password is not null
         and encrypted_password = crypt($2::text, encrypted_password)
       limit 1`,
      [normalizedUsername, secret]
    );
    const match = rowFromResult(byUsername);
    if (match.ok) return match;
  }

  return { ok: false, userId: null, email: null };
}

async function repairAuthUserLoginState(authUserId, password) {
  if (!isDatabaseReady() || !authUserId) return false;
  await query(
    `update auth.users
     set encrypted_password = crypt($2::text, gen_salt('bf')),
         email_confirmed_at = coalesce(email_confirmed_at, now()),
         banned_until = null,
         updated_at = now()
     where id = $1::uuid`,
    [authUserId, String(password)]
  );
  return true;
}

async function loginViaSqlAuthFallback(account, password) {
  const secret = String(password || "");
  if (!secret || !isDatabaseReady()) return null;

  const attempts = [];
  const seen = new Set();
  const pushAttempt = (via, params) => {
    const key = JSON.stringify(params);
    if (seen.has(key)) return;
    seen.add(key);
    attempts.push({ via, params });
  };

  for (const email of account.emails || []) {
    pushAttempt("email", { email, password: secret });
  }
  if (account.authUser?.id) {
    pushAttempt("authUserId", {
      authUserId: account.authUser.id,
      email: account.authUser.email,
      password: secret
    });
  }
  pushAttempt("username", { username: account.username, password: secret });

  for (const { via, params } of attempts) {
    const sql = await verifyLoginPasswordViaSql(params);
    if (!sql.ok || !sql.email) continue;

    pinLoginLog("pin compare via sql", { ok: true, via });

    let verified = await verifyLoginPassword(sql.email, secret);
    if (!verified.ok && sql.userId) {
      pinLoginLog("repair needed", {
        reason: "sql_ok_token_failed",
        authUserId: sql.userId,
        via
      });
      await repairAuthUserLoginState(sql.userId, secret);
      await ensureSupabaseAuthPassword({
        email: sql.email,
        password: secret,
        name: account.member?.name || account.authUser?.raw_user_meta_data?.name || "",
        username: account.username,
        phone: account.member?.phone || account.authUser?.raw_user_meta_data?.phone || "",
        authUserId: sql.userId
      });
      verified = await verifyLoginPasswordWithRetry(sql.email, secret);
    }

    if (verified.ok) {
      return loginSuccess(account, sql.email, verified.session);
    }
  }

  pinLoginLog("pin compare via sql", false);
  return null;
}

async function verifyWithLegacyFallback(account, password) {
  const member = account.member;
  if (!member?.id) {
    pinLoginLog("pin hash exists", false);
    return { ok: false, migrated: false, email: null };
  }

  const fields = extractLegacyAuthFields(member.profile);
  const hashExists = legacyPinHashExists(fields);
  pinLoginLog("pin hash exists", hashExists);

  if (!verifyLegacyPin(password, fields)) {
    pinLoginLog("pin compare", false);
    return { ok: false, migrated: false, email: resolveAccountEmail(account), hashExists };
  }

  pinLoginLog("pin compare", true);
  const email = resolveAccountEmail(account);
  if (!email) {
    pinLoginLog("repair needed", { reason: "missing_email", username: account.username });
    return { ok: false, migrated: false, email: null, hashExists: true };
  }

  const authUserId = await ensureSupabaseAuthPassword({
    email,
    password,
    name: member.name,
    username: member.username || account.username,
    phone: member.phone,
    authUserId: account.authUser?.id || null
  });
  if (!authUserId) {
    pinLoginLog("repair needed", { reason: "auth_password_sync_failed", username: account.username, email });
    return { ok: false, migrated: false, email, hashExists: true };
  }

  await clearLegacyPinFields(member);
  return { ok: true, migrated: true, email, hashExists: true };
}

async function loginSuccess(account, email, session) {
  pinLoginLog("session created", true);
  pinLoginLog("profile found", Boolean(account.profileExists || account.member?.id));
  await repairLoginIdentityAfterSuccess(account, email, session);
  return {
    ok: true,
    email,
    session,
    error: null,
    resolved: {
      ...account,
      email,
      matched: true,
      profileExists: Boolean(account.profileExists || account.member?.id)
    }
  };
}

export async function loginWithUsernameAndPassword(rawUsername, password) {
  const raw = String(rawUsername || "");
  pinLoginLog("raw username received", raw.trim());
  const account = await resolveLoginAccount(raw);
  pinLoginLog("normalized username", account.username || "(empty)");
  pinLoginLog("user found", account.usernameFound);
  pinLoginLog("profile found", account.profileExists);

  if (!account.usernameFound) {
    pinLoginLog("session created", false);
    pinLoginLog("pin compare", false);
    return { ok: false, error: INVALID_LOGIN_MESSAGE, resolved: account };
  }

  const emails = [...(account.emails || [])];
  const primaryEmail = resolveAccountEmail(account);
  if (primaryEmail && !emails.includes(primaryEmail)) {
    emails.unshift(primaryEmail);
  }

  if (emails.length) {
    for (const email of emails) {
      const verified = await verifyLoginPassword(email, password);
      if (verified.ok) {
        return loginSuccess(account, email, verified.session);
      }
    }
  }

  const legacy = await verifyWithLegacyFallback(account, password);
  if (legacy.ok && legacy.email) {
    const verified = await verifyLoginPasswordWithRetry(legacy.email, password);
    if (verified.ok) {
      return loginSuccess(account, legacy.email, verified.session);
    }
  }

  const sqlLogin = await loginViaSqlAuthFallback(account, password);
  if (sqlLogin) {
    return sqlLogin;
  }

  if (account.usernameFound && !legacy.hashExists && emails.length) {
    pinLoginLog("repair needed", {
      reason: "no_legacy_pin_and_supabase_rejected",
      username: account.username,
      emailCount: emails.length
    });
  }

  pinLoginLog("session created", false);
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

/** Admin/support utility — reset a member PIN in Supabase auth (never log the PIN). */
export async function repairUserPin({ username, newPin }) {
  const normalizedUsername = normalizeLoginUsername(username);
  if (!normalizedUsername) {
    throw new Error("Username is required.");
  }
  const pin = String(newPin || "");
  if (!/^\d{6}$/.test(pin)) {
    throw new Error("PIN must be exactly 6 digits.");
  }

  const account = await resolveLoginAccount(normalizedUsername);
  if (!account.usernameFound) {
    throw new Error("User not found.");
  }

  const email = resolveAccountEmail(account);
  if (!email) {
    throw new Error("No login email is linked to this username.");
  }

  const authUserId = await ensureSupabaseAuthPassword({
    email,
    password: pin,
    name: account.member?.name || account.authUser?.raw_user_meta_data?.name || "",
    username: account.username,
    phone: account.member?.phone || account.authUser?.raw_user_meta_data?.phone || "",
    authUserId: account.authUser?.id || null
  });

  if (!authUserId) {
    throw new Error("Could not sync the new PIN to auth.");
  }

  if (account.member?.id) {
    await clearLegacyPinFields(account.member);
  }

  pinLoginLog("pin repair completed", { username: account.username, email, authUserId });
  return { ok: true, username: account.username, email, authUserId };
}

/** @deprecated Use loginWithUsernameAndPassword */
export async function loginWithIdentifierAndPin(identifier, pin) {
  return loginWithUsernameAndPassword(identifier, pin);
}
