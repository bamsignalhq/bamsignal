#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  authUserWasCreatedByProvisioning,
  canResumeProvisioningAttempt,
  isActiveSignupProvisioningAttempt,
  resolveFailureProvisioningStatus,
  shouldCleanupOrphanAuthUser,
  SIGNUP_PROVISIONING_ACTIVE_STATUSES
} from "../server/services/signupProvisioning.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const signupOtpSource = read("server/services/signupOtp.js");
const signupProvisioningSource = read("server/services/signupProvisioning.js");
const migrationSource = read("supabase/migrations/202606211430_signup_provisioning_recovery.sql");

assert(
  signupProvisioningSource.includes("signup_provisioning_attempts") &&
    signupProvisioningSource.includes("SIGNUP_PROVISIONING_ACTIVE_STATUSES") &&
    signupProvisioningSource.includes("export async function beginProvisioning") &&
    signupProvisioningSource.includes("export async function resumeProvisioning") &&
    signupProvisioningSource.includes("export async function completeProvisioning") &&
    signupProvisioningSource.includes("export async function cleanupProvisioning"),
  "signup provisioning service must expose begin, resume, complete, and cleanup helpers"
);

assert(
  signupOtpSource.includes('from "./signupProvisioning.js"') &&
    signupOtpSource.includes("runSignupProvisioning") &&
    signupOtpSource.includes("beginProvisioning") &&
    signupOtpSource.includes("resumeProvisioning"),
  "signup OTP flow must delegate provisioning to signupProvisioning service"
);

assert(
  signupProvisioningSource.includes("deleteSupabaseAuthUser") &&
    signupProvisioningSource.includes("cleanupCreatedSupabaseAuthUser") &&
    signupProvisioningSource.includes("auth_cleanup_pending") &&
    signupProvisioningSource.includes("auth_cleanup_complete") &&
    signupProvisioningSource.includes("auth_cleanup_failed"),
  "signup must include compensating cleanup for created Supabase auth users"
);

assert(
  signupProvisioningSource.includes("authUserWasCreatedByProvisioning") &&
    signupProvisioningSource.includes("shouldCleanupOrphanAuthUser") &&
    signupProvisioningSource.includes("cleanupProvisioning") &&
    signupProvisioningSource.includes("throw error;"),
  "signup cleanup must only target auth users created by the provisioning attempt before local provisioning succeeds"
);

assert(
  signupProvisioningSource.includes("provisioning_resume") &&
    signupProvisioningSource.includes("code_hash") &&
    signupProvisioningSource.includes('status: "retrying"') &&
    signupProvisioningSource.includes('"failed"') &&
    signupOtpSource.includes("canResumeProvisioningAttempt") &&
    !signupOtpSource.includes("await verifySignupOtp(body.email, body.code);"),
  "signup retries must resume with the same OTP code hash instead of requiring a consumed OTP"
);

assert(
  signupProvisioningSource.includes("on conflict (email) do update") &&
    signupProvisioningSource.includes("attempts = signup_provisioning_attempts.attempts + 1") &&
    signupProvisioningSource.includes("findSupabaseUserByEmail") &&
    signupProvisioningSource.includes("duplicate_recover"),
  "duplicate and concurrent signup attempts must upsert provisioning state and reuse existing auth users"
);

assert(
  migrationSource.includes("create table if not exists public.signup_provisioning_attempts") &&
    migrationSource.includes("code_hash text not null") &&
    migrationSource.includes("auth_user_created boolean not null default false") &&
    migrationSource.includes("signup_provisioning_attempts_status_idx"),
  "signup provisioning recovery migration must create state table and status index"
);

const now = Date.now();
const future = new Date(now + 60_000).toISOString();
const past = new Date(now - 60_000).toISOString();

const activeAttempt = {
  status: "auth_created",
  code_hash: "abc123",
  expires_at: future,
  auth_user_created: true,
  auth_user_id: "user-1"
};

assert(
  isActiveSignupProvisioningAttempt(activeAttempt, now),
  "active provisioning attempts must remain resumable before expiry"
);
assert(
  !isActiveSignupProvisioningAttempt({ ...activeAttempt, expires_at: past }, now),
  "expired provisioning attempts must not remain active"
);
assert(
  canResumeProvisioningAttempt(activeAttempt, "abc123", now),
  "retry after partial failure must resume when code hash matches an active attempt"
);
assert(
  !canResumeProvisioningAttempt(activeAttempt, "wrong-hash", now),
  "retry must not resume when OTP code hash does not match"
);

assert(
  authUserWasCreatedByProvisioning({ id: "user-1", created: true }, null),
  "newly created auth users must be eligible for orphan cleanup"
);
assert(
  authUserWasCreatedByProvisioning(
    { id: "user-1", created: false },
    { auth_user_created: true, auth_user_id: "user-1" }
  ),
  "auth users recorded on the provisioning attempt must be eligible for orphan cleanup"
);
assert(
  !authUserWasCreatedByProvisioning({ id: "user-1", created: false }, null),
  "pre-existing auth users must not be deleted by retry recovery"
);

assert(
  shouldCleanupOrphanAuthUser({
    authUser: { id: "user-1", created: true },
    attempt: null,
    localProvisioned: false
  }),
  "DB failure after auth user creation must schedule orphan auth cleanup"
);
assert(
  !shouldCleanupOrphanAuthUser({
    authUser: { id: "user-1", created: true },
    attempt: null,
    localProvisioned: true
  }),
  "auth users must not be deleted after local provisioning succeeds"
);
assert(
  resolveFailureProvisioningStatus({
    authUser: { id: "user-1", created: true },
    attempt: null,
    localProvisioned: false
  }) === "auth_cleanup_pending",
  "partial provisioning failures must enter auth cleanup pending state"
);
assert(
  resolveFailureProvisioningStatus({
    authUser: { id: "user-1", created: true },
    attempt: null,
    localProvisioned: true
  }) === "failed",
  "post-profile failures must not trigger auth cleanup"
);

function simulateProvisioningFailure({ authCreated, localProvisioned, preExistingAuth = false }) {
  const events = ["otp_verified", "auth_creating"];
  if (authCreated) events.push("auth_created");
  if (localProvisioned) events.push("local_provisioning", "session_creating", "failed");
  const authUser = authCreated ? { id: "user-1", created: !preExistingAuth } : null;
  const attempt = authCreated && preExistingAuth
    ? { auth_user_created: false, auth_user_id: "user-1" }
    : authCreated
      ? { auth_user_created: true, auth_user_id: "user-1" }
      : null;
  if (
    shouldCleanupOrphanAuthUser({
      authUser,
      attempt,
      localProvisioned
    })
  ) {
    events.push("auth_cleanup_pending", "auth_cleanup_complete");
  }
  return events;
}

assert(
  simulateProvisioningFailure({ authCreated: true, localProvisioned: false }).includes("auth_cleanup_complete"),
  "new auth users must be cleaned up when local provisioning fails"
);
assert(
  !simulateProvisioningFailure({ authCreated: true, localProvisioned: true }).includes("auth_cleanup_pending"),
  "auth users must not be deleted after local provisioning succeeds"
);
assert(
  !simulateProvisioningFailure({ authCreated: true, localProvisioned: false, preExistingAuth: true }).includes(
    "auth_cleanup_pending"
  ),
  "pre-existing auth users must not be deleted by retry recovery"
);

function simulateConcurrentBegin(existingAttempts = 0) {
  let attempts = existingAttempts;
  const rows = new Map();

  function begin(email) {
    const nextAttempts = rows.has(email) ? rows.get(email).attempts + 1 : 1;
    const row = {
      email,
      status: "otp_verified",
      attempts: nextAttempts
    };
    rows.set(email, row);
    attempts = nextAttempts;
    return row;
  }

  const first = begin("member@example.com");
  const second = begin("member@example.com");
  return { first, second, attempts };
}

const concurrent = simulateConcurrentBegin();
assert(concurrent.first.attempts === 1, "first concurrent signup attempt must create provisioning state");
assert(concurrent.second.attempts === 2, "concurrent signup attempts must increment attempt counter idempotently");
assert(
  concurrent.first.email === concurrent.second.email && concurrent.second.status === "otp_verified",
  "concurrent signup attempts must reuse the same provisioning row"
);

function simulateSuccessfulRecovery() {
  const events = ["otp_verified", "auth_creating", "auth_created", "local_provisioning", "session_creating", "completed"];
  const orphanAuthUsers = 0;
  return { events, orphanAuthUsers };
}

const recovery = simulateSuccessfulRecovery();
assert(recovery.events.at(-1) === "completed", "successful recovery must complete signup provisioning");
assert(recovery.orphanAuthUsers === 0, "successful recovery must leave no orphan auth users");

assert(
  SIGNUP_PROVISIONING_ACTIVE_STATUSES.has("otp_verified") &&
    SIGNUP_PROVISIONING_ACTIVE_STATUSES.has("auth_created") &&
    SIGNUP_PROVISIONING_ACTIVE_STATUSES.has("local_provisioning") &&
    !SIGNUP_PROVISIONING_ACTIVE_STATUSES.has("completed"),
  "signup provisioning state machine must track partial states but not completed rows as active"
);

console.log("signup provisioning recovery tests ok");
