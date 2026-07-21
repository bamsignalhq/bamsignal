import crypto from "node:crypto";
import {
  assertSignupIdentityAvailable,
  normalizeSignupEmail,
  normalizeSignupPhone,
  normalizeSignupUsername,
  SignupIdentityError,
  SIGNUP_CONFLICT_MESSAGES,
  SIGNUP_CONFLICT_CODES
} from "./signupIdentity.js";
import { findAppUserIdentity, isDatabaseReady, normalizeUserKey, query, upsertAppUserIdentity } from "../db.js";
import { findMemberProfileByUserKey, upsertMemberProfile } from "../cityHome.js";
import { supabaseServiceHeaders } from "../supabaseEnv.js";
import { verifyLoginPassword } from "./pinLogin.js";
import { assertSchemaTable } from "./schemaVerification.js";

export const SIGNUP_USER_MESSAGE = "We couldn't complete your signup. Please try again.";
export const SIGNUP_PROVISIONING_TTL_MS = 30 * 60 * 1000;
export const SIGNUP_PROVISIONING_ACTIVE_STATUSES = new Set([
  "otp_verified",
  "retrying",
  "auth_creating",
  "auth_created",
  "local_provisioning",
  "session_creating",
  "auth_cleanup_pending",
  "auth_cleanup_failed",
  "auth_cleanup_complete",
  "failed"
]);

const DEFAULT_SIGNUP_CITY = "Lagos";
const DEFAULT_SIGNUP_STATE = "Lagos";

export class SignupProvisioningError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.name = "SignupProvisioningError";
    this.status = status;
    this.code = code;
  }
}

function provisioningFlowLog(event, detail = undefined) {
  if (detail !== undefined) {
    console.info(`[bamsignal:signup-flow] ${event}`, detail);
  } else {
    console.info(`[bamsignal:signup-flow] ${event}`);
  }
}

export function normalizeSignupProvisioningRow(row = null) {
  if (!row) return null;
  return {
    ...row,
    auth_user_created: Boolean(row.auth_user_created),
    attempts: Number(row.attempts || 0),
    expires_at: row.expires_at instanceof Date ? row.expires_at.toISOString() : row.expires_at
  };
}

export function isActiveSignupProvisioningAttempt(row, nowMs = Date.now()) {
  if (!row || !SIGNUP_PROVISIONING_ACTIVE_STATUSES.has(String(row.status || ""))) return false;
  const expiresAt = new Date(row.expires_at || 0).getTime();
  return Number.isFinite(expiresAt) && expiresAt > nowMs;
}

export function canResumeProvisioningAttempt(existingAttempt, codeHash, nowMs = Date.now()) {
  return Boolean(
    existingAttempt &&
      existingAttempt.code_hash === codeHash &&
      isActiveSignupProvisioningAttempt(existingAttempt, nowMs)
  );
}

export function authUserWasCreatedByProvisioning(authUser, attempt) {
  if (!authUser?.id) return false;
  if (authUser.created) return true;
  return Boolean(attempt?.auth_user_created && attempt?.auth_user_id === authUser.id);
}

export function shouldCleanupOrphanAuthUser({ authUser, attempt, localProvisioned }) {
  return !localProvisioned && authUserWasCreatedByProvisioning(authUser, attempt);
}

export function resolveFailureProvisioningStatus({ authUser, attempt, localProvisioned }) {
  return shouldCleanupOrphanAuthUser({ authUser, attempt, localProvisioned })
    ? "auth_cleanup_pending"
    : "failed";
}

async function ensureSignupProvisioningTable() {
  if (!isDatabaseReady()) {
    provisioningFlowLog("provisioning_state_failed", { reason: "database_disconnected" });
    throw new SignupProvisioningError(503, SIGNUP_USER_MESSAGE, "database_disconnected");
  }

  await assertSchemaTable("signup_provisioning_attempts");
}

export async function readSignupProvisioningAttempt(email) {
  if (!isDatabaseReady()) return null;
  await ensureSignupProvisioningTable();
  const normalized = normalizeSignupEmail(email);
  const result = await query(
    `select *
     from signup_provisioning_attempts
     where email = $1
     limit 1`,
    [normalized]
  );
  const row = normalizeSignupProvisioningRow(result.rows[0] || null);
  if (!row) return null;

  if (!isActiveSignupProvisioningAttempt(row) && row.status !== "completed") {
    await query(
      `update signup_provisioning_attempts
       set status = 'expired', updated_at = now()
       where email = $1 and status <> 'expired'`,
      [normalized]
    );
    return null;
  }

  return row;
}

async function markSignupProvisioningAttempt(email, patch = {}) {
  if (!isDatabaseReady()) return null;
  await ensureSignupProvisioningTable();

  const normalized = normalizeSignupEmail(email);
  const result = await query(
    `update signup_provisioning_attempts
     set status = coalesce($2, status),
         auth_user_id = coalesce($3, auth_user_id),
         auth_user_created = coalesce($4, auth_user_created),
         last_error_code = $5,
         payload = payload || $6::jsonb,
         updated_at = now()
     where email = $1
     returning *`,
    [
      normalized,
      patch.status || null,
      patch.authUserId || null,
      patch.authUserCreated === undefined ? null : Boolean(patch.authUserCreated),
      patch.lastErrorCode ?? null,
      JSON.stringify(patch.payload && typeof patch.payload === "object" ? patch.payload : {})
    ]
  );
  return normalizeSignupProvisioningRow(result.rows[0] || null);
}

async function safeMarkSignupProvisioningAttempt(email, patch = {}) {
  try {
    return await markSignupProvisioningAttempt(email, patch);
  } catch (error) {
    provisioningFlowLog("provisioning_state_failed", {
      reason: "mark_failed",
      code: error?.code || null,
      status: patch.status || null
    });
    return null;
  }
}

export async function beginProvisioning(body = {}, verification, { otpTtlMs = 10 * 60 * 1000 } = {}) {
  await ensureSignupProvisioningTable();

  const email = normalizeSignupEmail(body.email);
  const phone = normalizeSignupPhone(body.phone);
  const username = normalizeSignupUsername(body.username);
  const name = String(body.name || "").trim();
  const userKey = normalizeUserKey({ email, phone });
  const expiresAt = new Date(
    Math.min(
      Number(verification.expiresAt) || Date.now() + otpTtlMs,
      Date.now() + SIGNUP_PROVISIONING_TTL_MS
    )
  ).toISOString();

  const result = await query(
    `insert into signup_provisioning_attempts (
       email, user_key, phone, username, name, code_hash, status, attempts, payload, expires_at, updated_at
     )
     values ($1, $2, $3, $4, $5, $6, 'otp_verified', 1, $7::jsonb, $8, now())
     on conflict (email) do update
     set user_key = excluded.user_key,
         phone = excluded.phone,
         username = excluded.username,
         name = excluded.name,
         code_hash = excluded.code_hash,
         status = 'otp_verified',
         attempts = signup_provisioning_attempts.attempts + 1,
         last_error_code = null,
         payload = signup_provisioning_attempts.payload || excluded.payload,
         expires_at = excluded.expires_at,
         updated_at = now()
     returning *`,
    [
      email,
      userKey,
      phone || null,
      username || null,
      name || null,
      verification.codeHash,
      JSON.stringify({
        source: "otp_verified",
        phonePresent: Boolean(phone),
        usernamePresent: Boolean(username)
      }),
      expiresAt
    ]
  );

  return normalizeSignupProvisioningRow(result.rows[0] || null);
}

export async function resumeProvisioning(email, existingAttempt) {
  provisioningFlowLog("provisioning_resume", {
    status: existingAttempt.status,
    attempts: existingAttempt.attempts
  });
  const normalized = normalizeSignupEmail(email);
  return (
    (await safeMarkSignupProvisioningAttempt(normalized, {
      status: "retrying",
      payload: { resumedAt: new Date().toISOString(), previousStatus: existingAttempt.status }
    })) || existingAttempt
  );
}

export async function completeProvisioning(email, patch = {}) {
  return safeMarkSignupProvisioningAttempt(email, {
    status: "completed",
    ...patch,
    payload: {
      ...(patch.payload && typeof patch.payload === "object" ? patch.payload : {}),
      completedAt: new Date().toISOString()
    }
  });
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
    throw new SignupProvisioningError(503, SIGNUP_USER_MESSAGE, "service_role_missing");
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
    provisioningFlowLog("user_create_failed", {
      reason: "supabase_update_failed",
      status: response.status,
      detail: detail.slice(0, 240)
    });
    throw new SignupProvisioningError(502, SIGNUP_USER_MESSAGE, "session_failed");
  }

  return { id: userId, created: false };
}

export async function ensureSupabaseAuthUser({ email, password, name, username, phone }) {
  const config = supabaseServiceHeaders();
  if (!config) {
    provisioningFlowLog("user_create_failed", { reason: "service_role_missing" });
    throw new SignupProvisioningError(503, SIGNUP_USER_MESSAGE, "service_role_missing");
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
      provisioningFlowLog("duplicate_recover", { userId: raced.id });
      return updateSupabaseAuthUser(raced.id, { password, name, username, phone });
    }
    provisioningFlowLog("user_create_failed", { reason: "duplicate_user_unresolved", detail: detail.slice(0, 240) });
    throw new SignupProvisioningError(
      409,
      SIGNUP_CONFLICT_MESSAGES.email,
      "duplicate_user"
    );
  }

  provisioningFlowLog("user_create_failed", {
    reason: "supabase_create_failed",
    status: response.status,
    detail: detail.slice(0, 240)
  });
  throw new SignupProvisioningError(502, SIGNUP_USER_MESSAGE, "user_insert_failed");
}

async function deleteSupabaseAuthUser(userId) {
  const config = supabaseServiceHeaders();
  if (!config || !userId) {
    return { ok: false, reason: "service_role_missing" };
  }

  const response = await fetch(`${config.url}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: buildSupabaseAdminHeaders(config.serviceKey)
  });

  if (response.ok || response.status === 404) {
    return { ok: true, status: response.status };
  }

  const detail = await response.text().catch(() => "");
  return {
    ok: false,
    status: response.status,
    reason: "auth_delete_failed",
    detail: detail.slice(0, 240)
  };
}

async function cleanupCreatedSupabaseAuthUser({ email, userId, reason }) {
  const result = await deleteSupabaseAuthUser(userId);
  provisioningFlowLog(result.ok ? "auth_cleanup_success" : "auth_cleanup_failed", {
    userId,
    reason,
    status: result.status || null,
    cleanupReason: result.ok ? undefined : result.reason
  });

  await safeMarkSignupProvisioningAttempt(email, {
    status: result.ok ? "auth_cleanup_complete" : "auth_cleanup_failed",
    authUserId: userId,
    authUserCreated: !result.ok,
    lastErrorCode: result.ok ? null : result.reason || "auth_cleanup_failed",
    payload: {
      cleanup: {
        ok: result.ok,
        reason,
        status: result.status || null
      }
    }
  });

  return result;
}

export async function cleanupProvisioning({ email, error, authUser, attempt, localProvisioned }) {
  const errorCode = error?.code || "signup_provisioning_failed";
  const shouldCleanup = shouldCleanupOrphanAuthUser({ authUser, attempt, localProvisioned });

  await safeMarkSignupProvisioningAttempt(email, {
    status: resolveFailureProvisioningStatus({ authUser, attempt, localProvisioned }),
    authUserId: authUser?.id || null,
    authUserCreated: authUserWasCreatedByProvisioning(authUser, attempt),
    lastErrorCode: errorCode,
    payload: {
      failure: {
        code: errorCode,
        name: error?.name || null,
        localProvisioned: Boolean(localProvisioned)
      }
    }
  });

  if (shouldCleanup && authUser?.id) {
    return cleanupCreatedSupabaseAuthUser({
      email,
      userId: authUser.id,
      reason: errorCode
    });
  }

  return { ok: !shouldCleanup, skipped: !shouldCleanup };
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

export async function resolveSignupProvisioningMode({ email, phone }) {
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
      throw new SignupIdentityError(409, "username", SIGNUP_CONFLICT_MESSAGES.username, {
        code: SIGNUP_CONFLICT_CODES.username,
        conflicts: [
          {
            field: "username",
            code: SIGNUP_CONFLICT_CODES.username,
            message: SIGNUP_CONFLICT_MESSAGES.username
          }
        ]
      });
    }
  }

  if (normalizedPhone.length === 11) {
    const taken = await phoneTakenByOther(normalizedPhone, userKey || member?.user_key || "");
    if (taken) {
      throw new SignupIdentityError(409, "phone", SIGNUP_CONFLICT_MESSAGES.phone, {
        code: SIGNUP_CONFLICT_CODES.phone,
        conflicts: [
          {
            field: "phone",
            code: SIGNUP_CONFLICT_CODES.phone,
            message: SIGNUP_CONFLICT_MESSAGES.phone
          }
        ]
      });
    }
  }

  return { email: normalizeSignupEmail(email), phone: normalizedPhone, username: normalizedUsername };
}

async function ensureAppUserRecord({ email, phone, name }) {
  if (!isDatabaseReady()) {
    provisioningFlowLog("user_insert_failed", { reason: "database_disconnected" });
    throw new SignupProvisioningError(503, SIGNUP_USER_MESSAGE, "database_disconnected");
  }

  const user = await upsertAppUserIdentity({
    email: normalizeSignupEmail(email),
    phone: normalizeSignupPhone(phone),
    name: String(name || "").trim()
  });

  if (!user?.id) {
    provisioningFlowLog("user_insert_failed", { reason: "app_users_upsert_null" });
    throw new SignupProvisioningError(502, SIGNUP_USER_MESSAGE, "user_insert_failed");
  }

  return user;
}

async function ensureMemberProfileStub({ email, phone, name, username, existingMember }) {
  if (!isDatabaseReady()) {
    provisioningFlowLog("profile_insert_failed", { reason: "database_disconnected" });
    throw new SignupProvisioningError(503, SIGNUP_USER_MESSAGE, "profile_insert_failed");
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
    provisioningFlowLog("profile_insert_failed", { reason: "member_profile_upsert_null" });
    throw new SignupProvisioningError(502, SIGNUP_USER_MESSAGE, "profile_insert_failed");
  }

  return row;
}

async function mintSignupSession(email, password) {
  const normalizedEmail = normalizeSignupEmail(email);
  const secret = String(password || "");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const login = await verifyLoginPassword(normalizedEmail, secret);
    if (login.ok && login.session) {
      provisioningFlowLog("session_create_success", { attempt: attempt + 1 });
      return login.session;
    }
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 120 * (attempt + 1)));
    }
  }
  provisioningFlowLog("session_create_failed", { reason: "token_grant_failed" });
  throw new SignupProvisioningError(502, SIGNUP_USER_MESSAGE, "session_failed");
}

export async function runSignupProvisioning(body = {}, provisioning = {}) {
  provisioningFlowLog("otp_verified", { resumed: provisioning.resumed });

  const { mode, member, userKey } = await resolveSignupProvisioningMode(body);
  let authUser = null;
  let provisioningAttempt = provisioning.attempt || null;
  let localProvisioned = false;

  try {
    if (mode === "fresh") {
      await assertSignupIdentityAvailable({
        email: body.email,
        phone: body.phone,
        username: body.username
      });
    } else if (mode === "complete") {
      provisioningFlowLog("duplicate_recover", { mode });
      await assertRepairIdentityAvailable({
        email: body.email,
        phone: body.phone,
        username: body.username,
        userKey,
        member
      });
    } else {
      provisioningFlowLog("profile_repair", { mode });
      await assertRepairIdentityAvailable({
        email: body.email,
        phone: body.phone,
        username: body.username,
        userKey,
        member
      });
    }

    provisioningFlowLog("user_create_start", { mode });
    await safeMarkSignupProvisioningAttempt(provisioning.email, {
      status: "auth_creating",
      payload: { mode }
    });
    authUser = await ensureSupabaseAuthUser({
      email: body.email,
      password: body.password,
      name: body.name,
      username: body.username,
      phone: body.phone
    });
    const authUserCreatedByProvisioning = authUserWasCreatedByProvisioning(authUser, provisioningAttempt);
    provisioningAttempt = await safeMarkSignupProvisioningAttempt(provisioning.email, {
      status: "auth_created",
      authUserId: authUser.id,
      authUserCreated: authUserCreatedByProvisioning,
      payload: { mode }
    });
    provisioningFlowLog("user_create_success", {
      userId: authUser.id,
      created: authUser.created,
      mode
    });

    provisioningFlowLog("profile_create_start");
    await safeMarkSignupProvisioningAttempt(provisioning.email, {
      status: "local_provisioning",
      authUserId: authUser.id,
      authUserCreated: authUserCreatedByProvisioning
    });
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
    localProvisioned = true;
    provisioningFlowLog("profile_create_success", {
      profileId: profileRow.id,
      onboardingComplete: profileRow.onboarding_complete
    });

    provisioningFlowLog("session_create_start");
    await safeMarkSignupProvisioningAttempt(provisioning.email, {
      status: "session_creating",
      authUserId: authUser.id,
      authUserCreated: authUserCreatedByProvisioning,
      payload: { memberProfileId: profileRow.id }
    });
    const session = await mintSignupSession(body.email, body.password);

    await completeProvisioning(provisioning.email, {
      authUserId: authUser.id,
      authUserCreated: authUserCreatedByProvisioning,
      payload: { memberProfileId: profileRow.id }
    });

    return {
      ok: true,
      email: normalizeSignupEmail(body.email),
      memberProfileId: profileRow.id,
      onboardingComplete: Boolean(profileRow.onboarding_complete),
      recovered: mode !== "fresh" || provisioning.resumed,
      session
    };
  } catch (error) {
    await cleanupProvisioning({
      email: provisioning.email,
      error,
      authUser,
      attempt: provisioningAttempt,
      localProvisioned
    });
    throw error;
  }
}

export function hashSignupCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}
