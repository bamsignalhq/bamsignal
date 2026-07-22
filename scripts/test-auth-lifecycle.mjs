#!/usr/bin/env node
/**
 * Sprint 2 — Authentication & Account Lifecycle tests.
 * Static contract + module import smoke (no live DB required).
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  buildCertificationManifest,
  buildProductionCertReport,
  PRODUCTION_CERT_VERSION
} from "../shared/productionCertification.mjs";
import {
  LIFECYCLE_STATUSES,
  resolveAccountLifecycleStatus
} from "../server/services/auth/lifecycle.js";
import { RECOVERY_KINDS } from "../server/services/auth/recovery.js";
import {
  getAuthObservabilityMetrics,
  incrementAuthMetric
} from "../server/services/auth/observability.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relPath) {
  return readFileSync(join(rootPath, relPath), "utf8");
}

const migration = read("migrations/0058_member_auth_lifecycle.sql");
assert(migration.includes("member_auth_security_events"), "migration creates security events table");
assert(migration.includes("member_auth_sessions"), "migration creates sessions table");
assert(migration.includes("server_session_status"), "migration adds server_session_status");
assert(migration.includes("member_auth_devices"), "migration creates devices table");
assert(migration.includes("member_account_lifecycle_log"), "migration creates lifecycle log");
assert(migration.includes("member_auth_recovery_tokens"), "migration creates recovery tokens");
assert(migration.includes("member_account_retention"), "migration creates retention metadata");

const schema = read("server/services/schemaVerification.js");
for (const table of [
  "member_auth_security_events",
  "member_auth_sessions",
  "member_auth_devices",
  "member_account_lifecycle_log",
  "member_auth_recovery_tokens",
  "member_account_retention"
]) {
  assert(schema.includes(`"${table}"`), `schema verification requires ${table}`);
}

const appSource = read("server/app.js");
assert(appSource.includes("/api/auth/sessions"), "sessions route mounted");
assert(appSource.includes("/api/auth/account"), "account route mounted");

const pinLoginSource = read("api/auth/pin-login.js");
assert(
  pinLoginSource.includes("handlePostLoginAuth") && pinLoginSource.includes("failed_login"),
  "pin-login hooks post-login auth and failed login audit"
);

const pinResetSource = read("server/services/pinReset.js");
assert(
  pinResetSource.includes("createRecoveryToken") && pinResetSource.includes("completeRecoveryToken"),
  "pin reset integrates recovery token audit"
);

const signupSource = read("server/services/signupProvisioning.js");
assert(
  signupSource.includes("recordAuthSecurityEvent") && signupSource.includes("transitionAccountLifecycle"),
  "signup provisioning records lifecycle audit"
);

const memberTrustSource = read("server/memberTrust.js");
assert(
  memberTrustSource.includes("recordAccountDeletionRetention") &&
    memberTrustSource.includes("recordAccountRestored") &&
    memberTrustSource.includes("recordPermanentDeletion"),
  "member trust deletion hooks lifecycle retention"
);

const lifecycleSource = read("server/services/auth/lifecycle.js");
assert(
  lifecycleSource.includes("resolveAccountLifecycleStatus") &&
    lifecycleSource.includes("transitionAccountLifecycle"),
  "lifecycle service present"
);

assert(LIFECYCLE_STATUSES.length === 10, "ten lifecycle states defined");

assert(resolveAccountLifecycleStatus({ account_status: "deleted" }) === "archived", "deleted maps archived");
assert(
  resolveAccountLifecycleStatus({ account_status: "deleted_pending" }) === "disabled",
  "deleted_pending maps disabled"
);
assert(
  resolveAccountLifecycleStatus({ onboarding_complete: false }, { emailVerified: true }) ===
    "profile_completion",
  "verified email with incomplete onboarding maps profile_completion"
);

assert(RECOVERY_KINDS.includes("pin_reset"), "pin_reset recovery kind");
assert(RECOVERY_KINDS.includes("forgot_username"), "forgot_username recovery kind");

incrementAuthMetric("login", 2);
const metrics = getAuthObservabilityMetrics();
assert(metrics.login >= 2, "auth observability counters");

const certSource = read("shared/productionCertification.mjs");
assert(
  certSource.includes("buildCertificationManifest") && certSource.includes("manifest.json"),
  "certification manifest export"
);
assert(PRODUCTION_CERT_VERSION === "1.2.0", "certification version bumped for Sprint 2");

const report = buildProductionCertReport([
  { id: "auth-lifecycle", label: "Auth Lifecycle", passed: true, durationMs: 1 }
]);
const manifest = buildCertificationManifest(report);
assert(manifest.checksExecuted === 1 && manifest.overallStatus === "PASS", "manifest builder");

for (const doc of [
  "docs/architecture/AUTHENTICATION.md",
  "docs/architecture/ACCOUNT_LIFECYCLE.md",
  "docs/operations/AUTH_RUNBOOK.md",
  "docs/architecture/AUTH_FLOW_AUDIT.md"
]) {
  assert(existsSync(join(rootPath, doc)), `${doc} exists`);
}

const authContracts = read("src/auth/index.ts");
assert(authContracts.includes("AccountLifecycleStatus"), "TS auth contracts exported");

if (failed) process.exit(1);
console.log("auth lifecycle tests ok");
