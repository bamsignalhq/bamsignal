/**
 * Identity, admin, and status exposure minimization checks.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const identityExposureSource = read("server/services/identityExposure.js");
const identityApiSource = read("api/auth/identity.js");
const memberDataSource = read("api/member/data.js");
const loginSecuritySource = read("api/auth/login-security.js");
const diagnosticsAccessSource = read("server/services/diagnosticsAccess.js");
const adminAuthSource = read("server/adminAuth.js");
const hardSetupSource = read("api/hard/setup.js");
const memberAuthSource = read("server/services/memberAuth.js");
const accountSecurityClientSource = read("src/services/accountSecurity.ts");

assert(
  identityExposureSource.includes("identity_exposure_blocked") &&
    identityExposureSource.includes("admin_status_hidden") &&
    identityExposureSource.includes("diagnostics_access_denied") &&
    identityExposureSource.includes("sanitizePublicMemberProfile"),
  "identity exposure helpers must define logging and public profile sanitization"
);

assert(
  identityApiSource.includes("requireMemberIdentity") &&
    identityApiSource.includes('action: "exists-check"') &&
    !identityApiSource.includes("exists: true") &&
    !identityApiSource.includes("exists: false") &&
    identityApiSource.includes("requireAdmin(req, res)") &&
    identityApiSource.includes('action === "settings"'),
  "identity API must block public existence checks and protect admin settings"
);

assert(
  memberDataSource.includes("sanitizePublicMemberProfile") &&
    !memberDataSource.includes("Account not found") &&
    !memberDataSource.includes('ok: Boolean(profile)') &&
    memberDataSource.includes("sendGenericServiceUnavailable") &&
    memberDataSource.includes('endpoint: "resolve-login"'),
  "member data API must hide profile existence and database posture from public callers"
);

assert(
  !memberAuthSource.includes('"check-username"') &&
    loginSecuritySource.includes("requireMemberAuth(req, body)") &&
    !loginSecuritySource.includes("database"),
  "username checks and login security must require bearer auth and hide database status"
);

assert(
  diagnosticsAccessSource.includes("logDiagnosticsAccessDenied") &&
    adminAuthSource.includes("logAdminStatusHidden") &&
    adminAuthSource.includes("GENERIC_NOT_AUTHORIZED"),
  "diagnostics and admin auth denials must log without exposing secrets"
);

assert(
  hardSetupSource.includes("logAdminStatusHidden") &&
    hardSetupSource.includes("hasSetupSecret"),
  "console setup status must hide needsSetup without setup secret"
);

assert(
  accountSecurityClientSource.includes("memberApiHeaders") &&
    accountSecurityClientSource.includes("/api/auth/login-security?action=") &&
    accountSecurityClientSource.includes('"login-check"'),
  "login 2FA client calls must attach bearer tokens after PIN login"
);

console.log("identity exposure tests ok");
