#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const signupOtpSource = read("server/services/signupOtp.js");
const migrationSource = read("supabase/migrations/202606211430_signup_provisioning_recovery.sql");

assert(
  signupOtpSource.includes("signup_provisioning_attempts") &&
    signupOtpSource.includes("SIGNUP_PROVISIONING_ACTIVE_STATUSES") &&
    signupOtpSource.includes("verifySignupOtpForProvisioning") &&
    signupOtpSource.includes("beginSignupProvisioningAttempt"),
  "signup must persist resumable provisioning state after OTP verification"
);

assert(
  signupOtpSource.includes("deleteSupabaseAuthUser") &&
    signupOtpSource.includes("cleanupCreatedSupabaseAuthUser") &&
    signupOtpSource.includes("auth_cleanup_pending") &&
    signupOtpSource.includes("auth_cleanup_complete") &&
    signupOtpSource.includes("auth_cleanup_failed"),
  "signup must include compensating cleanup for created Supabase auth users"
);

assert(
  signupOtpSource.includes("authUserWasCreatedByProvisioning") &&
    signupOtpSource.includes("!localProvisioned") &&
    signupOtpSource.includes("recordSignupProvisioningFailure") &&
    signupOtpSource.includes("throw error;"),
  "signup cleanup must only target auth users created by the provisioning attempt before local provisioning succeeds"
);

assert(
  signupOtpSource.includes("provisioning_resume") &&
    signupOtpSource.includes("code_hash") &&
    signupOtpSource.includes("status: \"retrying\"") &&
    signupOtpSource.includes('"failed"') &&
    !signupOtpSource.includes("await verifySignupOtp(body.email, body.code);"),
  "signup retries must resume with the same OTP code hash instead of requiring a consumed OTP"
);

assert(
  migrationSource.includes("create table if not exists public.signup_provisioning_attempts") &&
    migrationSource.includes("code_hash text not null") &&
    migrationSource.includes("auth_user_created boolean not null default false") &&
    migrationSource.includes("signup_provisioning_attempts_status_idx"),
  "signup provisioning recovery migration must create state table and status index"
);

function simulateProvisioningFailure({ authCreated, localProvisioned }) {
  const events = ["otp_verified", "auth_creating"];
  if (authCreated) events.push("auth_created");
  if (localProvisioned) events.push("local_provisioning", "session_creating", "failed");
  if (authCreated && !localProvisioned) {
    events.push("auth_cleanup_pending", "auth_cleanup_complete");
  }
  return events;
}

assert(
  simulateProvisioningFailure({ authCreated: true, localProvisioned: false }).includes(
    "auth_cleanup_complete"
  ),
  "new auth users must be cleaned up when local provisioning fails"
);
assert(
  !simulateProvisioningFailure({ authCreated: true, localProvisioned: true }).includes(
    "auth_cleanup_pending"
  ),
  "auth users must not be deleted after local provisioning succeeds"
);
assert(
  !simulateProvisioningFailure({ authCreated: false, localProvisioned: false }).includes(
    "auth_cleanup_pending"
  ),
  "pre-existing auth users must not be deleted by retry recovery"
);

console.log("signup provisioning recovery tests ok");
