/**
 * Auth and admin log redaction regression checks.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  buildAdminAuditContext,
  buildAuthAuditContext,
  hashIdentifierForLog,
  maskEmailForLog,
  maskUsernameForLog,
  sanitizeAuthDebugLog
} from "../server/services/logRedaction.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

assert(maskEmailForLog("alex@example.com") === "a***@example.com", "email mask must keep domain with one local char");
assert(maskUsernameForLog("alexuser") === "a***", "username mask must keep one visible character");
assert(hashIdentifierForLog("alexuser")?.length === 16, "identifier hash must be 16 hex chars");

const loginAudit = buildAuthAuditContext({ username: "alexuser", attempts: 2, locked: false });
assert(loginAudit.identifierHash && loginAudit.identifierMask === "a***", "auth audit must expose hash and mask only");
assert(!("username" in loginAudit), "auth audit must not include raw username");

const adminAudit = buildAdminAuditContext({ email: "ops@bamsignal.com", attempts: 1 });
assert(adminAudit.adminHash && adminAudit.adminMask === "o***@bamsignal.com", "admin audit must expose hash and mask only");
assert(!("email" in adminAudit), "admin audit must not include raw email");

const debugPayload = sanitizeAuthDebugLog({
  username: "alexuser",
  email: "alex@example.com",
  reason: "missing_email"
});
assert(debugPayload.usernameHash && debugPayload.usernameMask === "a***", "debug sanitizer must mask username");
assert(debugPayload.emailHash && debugPayload.emailMask === "a***@example.com", "debug sanitizer must mask email");
assert(!debugPayload.username && !debugPayload.email, "debug sanitizer must drop raw identifiers");

const pinLoginSource = read("api/auth/pin-login.js");
const pinResetSource = read("api/auth/pin-reset.js");
const adminConsentSource = read("server/adminConsent.js");
const pinLoginServiceSource = read("server/services/pinLogin.js");
const loginResolveSource = read("server/services/loginResolve.js");
const bootstrapApiSource = read("api/admin/bootstrap.js");

assert(
  pinLoginSource.includes("buildAuthAuditContext") &&
    pinLoginSource.includes("logObservabilityEvent") &&
    !pinLoginSource.includes("console.info(\"pin_login_failed\""),
  "PIN login API must log audit events with redacted identifiers"
);
assert(
  pinResetSource.includes("buildAuthAuditContext") &&
    pinResetSource.includes("logObservabilityEvent") &&
    !pinResetSource.includes("console.info(\"pin_reset_success\""),
  "PIN reset API must log audit events with redacted identifiers"
);
assert(
  adminConsentSource.includes("buildAdminAuditContext") &&
    adminConsentSource.includes("logObservabilityEvent") &&
    !adminConsentSource.includes("console.info(\"admin_action_pin_success\""),
  "admin consent must log audit events with redacted admin identifiers"
);
assert(
  pinLoginServiceSource.includes("sanitizeAuthDebugLog") &&
    loginResolveSource.includes("sanitizeAuthDebugLog"),
  "PIN login debug logs must sanitize identifiers"
);
assert(
  bootstrapApiSource.includes("buildAdminAuditContext") &&
    bootstrapApiSource.includes("logAdminBootstrapSuccess") &&
    !bootstrapApiSource.match(/logAdminBootstrapSuccess\(\s*req,\s*\{\s*email:/),
  "admin bootstrap success logs must route email through redaction helper"
);

console.log("log redaction tests ok");
