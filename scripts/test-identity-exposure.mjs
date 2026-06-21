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
const authEmailSource = read("src/services/authEmail.ts");
const pinLoginSource = read("server/services/pinLogin.js");

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
    !memberDataSource.includes('action === "resolve-login"') &&
    !memberDataSource.includes('action === "resolve-username"'),
  "member data API must not expose username-to-email resolution"
);

assert(
  !memberAuthSource.includes('"resolve-login"') &&
    !memberAuthSource.includes('"resolve-username"') &&
    !loginSecuritySource.includes("database"),
  "resolve-login must not be a public member-data action"
);

assert(
  !authEmailSource.includes("resolveLoginEmail") &&
    !authEmailSource.includes("resolve-login") &&
    authEmailSource.includes("/api/auth/pin-login"),
  "client auth must use pin-login only, not public username-to-email resolution"
);

assert(
  pinLoginSource.includes("loginWithUsernameAndPin") &&
    pinLoginSource.includes("resolveLoginAccount") &&
    !pinLoginSource.includes("export async function resolveLoginUsername"),
  "pin login must resolve username server-side without a public export"
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

const port = Number(process.env.SMOKE_PORT || process.env.IDENTITY_EXPOSURE_SMOKE_PORT || 39453);
process.env.PORT = String(port);

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`, { method: "HEAD" });
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("server did not become ready for identity exposure smoke");
}

try {
  await import("../server/production.js");
  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl);

  const resolveLoginResponse = await fetch(`${baseUrl}/api/member/data?action=resolve-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "knownuser" })
  });
  assert(
    resolveLoginResponse.status === 401,
    `resolve-login must require auth (got ${resolveLoginResponse.status})`
  );
  const resolveLoginPayload = await resolveLoginResponse.json();
  assert(
    !resolveLoginPayload?.email,
    "resolve-login must not return an email field"
  );
  assert(
    resolveLoginPayload?.error === "not_authorized",
    "resolve-login must return generic not_authorized error"
  );

  const resolveUsernameResponse = await fetch(`${baseUrl}/api/member/data?action=resolve-username`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "knownuser" })
  });
  assert(
    resolveUsernameResponse.status === 401,
    `resolve-username must require auth (got ${resolveUsernameResponse.status})`
  );
  const resolveUsernamePayload = await resolveUsernameResponse.json();
  assert(
    !resolveUsernamePayload?.email,
    "resolve-username must not return an email field"
  );

  const pinLoginResponse = await fetch(`${baseUrl}/api/auth/pin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "unknownuser", pin: "123456" })
  });
  assert(
    pinLoginResponse.status === 401,
    `pin-login with bad credentials must return 401 (got ${pinLoginResponse.status})`
  );
  const pinLoginPayload = await pinLoginResponse.json();
  assert(
    !pinLoginPayload?.email,
    "failed pin-login must not leak email"
  );
  assert(
    pinLoginPayload?.error === "Invalid username or PIN.",
    "failed pin-login must return generic invalid credentials message"
  );

  const pinResetResponse = await fetch(`${baseUrl}/api/auth/pin-reset?action=send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "nonexistent@example.com" })
  });
  assert(
    pinResetResponse.status === 200 || pinResetResponse.status === 503,
    `pin-reset send must remain routed (got ${pinResetResponse.status})`
  );
  const pinResetPayload = await pinResetResponse.json();
  assert(
    !pinResetPayload?.email,
    "pin-reset send must not return email in response body"
  );
  if (pinResetResponse.status === 200) {
    assert(
      pinResetPayload?.ok === true,
      "pin-reset send must return ok without revealing account existence"
    );
  }

  console.log("identity exposure tests ok");
  process.exit(0);
} catch (error) {
  console.error("identity exposure tests failed:", error);
  process.exit(1);
}
