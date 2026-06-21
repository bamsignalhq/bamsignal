#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  safeClientMessage,
  sendLoggedApiError
} from "../server/services/errorResponse.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: null,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

const helperSource = read("server/services/apiErrorResponse.js");
const compatibilityHelperSource = read("server/services/errorResponse.js");
const pinLoginSource = read("api/auth/pin-login.js");
const memberDataSource = read("api/member/data.js");
const memberPhotosSource = read("api/member/photos.js");

assert(
    helperSource.includes("ensureApiRequestContext") &&
    helperSource.includes("createRequestId") &&
    helperSource.includes("REQUEST_ID_HEADER") &&
    helperSource.includes("logSanitizedApiError") &&
    helperSource.includes("sanitizeApiErrorForLog") &&
    helperSource.includes("safeClientMessage") &&
    compatibilityHelperSource.includes("clientError") &&
    compatibilityHelperSource.includes("logError"),
  "API error helper must attach request ids and log sanitized details"
);

const rawResponseFiles = [
  ["pin-login", "api/auth/pin-login.js"],
  ["pin-reset", "api/auth/pin-reset.js"],
  ["email-code", "api/auth/email-code.js"],
  ["login-security", "api/auth/login-security.js"],
  ["play-reviewer-finish", "api/auth/play-reviewer-finish.js"],
  ["identity", "api/auth/identity.js"],
  ["member-data", "api/member/data.js"],
  ["member-photos", "api/member/photos.js"],
  ["member-voice", "api/member/voice.js"],
  ["city-home", "api/city/home.js"],
  ["city-spotlight", "api/city/spotlight.js"],
  ["city-spotlight-event", "api/city/spotlight-event.js"],
  ["admin-bootstrap", "api/admin/bootstrap.js"],
  ["admin-city-home", "api/admin/city-home.js"],
  ["admin-city-spotlight", "api/admin/city-spotlight.js"],
  ["admin-consent", "api/admin/consent.js"],
  ["admin-members", "api/admin/members.js"],
  ["admin-moderation", "api/admin/moderation.js"],
  ["diagnostics-view-security", "api/diagnostics/view-security.js"],
  ["diagnostics-function-security", "api/diagnostics/function-security.js"],
  ["diagnostics-paystack-connectivity", "api/diagnostics/paystack-connectivity.js"],
  ["hard-setup", "api/hard/setup.js"],
  ["whatsapp-start", "api/verify/whatsapp/start.js"],
  ["whatsapp-confirm", "api/verify/whatsapp/confirm.js"]
];

for (const [name, relativePath] of rawResponseFiles) {
  const source = read(relativePath);
  assert(
    source.includes("sendLoggedApiError") || source.includes("sendApiError"),
    `${name} must use generic API error responses with request ids`
  );
  assert(!source.includes("error: error.message"), `${name} must not return error.message to clients`);
  assert(!source.includes("error.message ||"), `${name} must not fall back to raw error.message`);
  assert(!source.includes("String(error)"), `${name} must not stringify thrown errors into client paths`);
}

assert(
  pinLoginSource.includes('message: "Login failed."') &&
    pinLoginSource.includes('event: "pin_login_error"') &&
    pinLoginSource.includes("buildAuthAuditContext"),
  "pin-login failures must return generic copy and log masked identity context"
);

assert(
  memberDataSource.includes('message: "Member data request failed."') &&
    memberDataSource.includes('"profile_save_failed"') &&
    memberDataSource.includes('event: "member_data_blocked"') &&
    memberDataSource.includes('message: "Message blocked for safety."') &&
    memberDataSource.includes('message: "Report blocked for safety."'),
  "member data failures must use generic copy for server and contact-leak errors"
);

assert(
  memberPhotosSource.includes("photoStorageClientMessage") &&
    memberPhotosSource.includes('message: "Photo request failed."') &&
    memberPhotosSource.includes('message: "Photo storage is temporarily unavailable."') &&
    !memberPhotosSource.includes("Photo storage is not configured."),
  "photo API must hide storage internals behind generic client messages"
);

const logs = [];
const originalError = console.error;
console.error = (...args) => logs.push(args);

const req = {
  headers: {},
  observability: {},
  socket: { remoteAddress: "203.0.113.55" }
};
const res = createResponse();
sendLoggedApiError({
  req,
  res,
  event: "raw_error_hardening_test",
  error: new Error("SQL failed for alice@example.com with sk_live_secret123"),
  status: 500,
  message: "Generic failure."
});

console.error = originalError;

assert(res.statusCode === 500, "helper must preserve the intended HTTP status");
assert(res.payload?.error === "Generic failure.", "helper must return generic client copy");
assert(res.payload?.requestId, "helper must include requestId in response body");
assert(res.headers["x-request-id"] === res.payload.requestId, "helper must mirror requestId in response header");
assert(!JSON.stringify(res.payload).includes("alice@example.com"), "response must not include raw email");
assert(!JSON.stringify(res.payload).includes("sk_live"), "response must not include provider secrets");

const serializedLogs = JSON.stringify(logs);
assert(serializedLogs.includes("raw_error_hardening_test"), "helper must log server-side details");
assert(!serializedLogs.includes("alice@example.com"), "logs must redact email addresses");
assert(!serializedLogs.includes("sk_live_secret123"), "logs must redact provider secrets");
assert(!serializedLogs.includes("SQL failed"), "logs must redact SQL details");

const dangerousCases = [
  {
    label: "provider",
    error: new Error("Paystack upstream payload sk_live_secret123 Invalid key"),
    forbidden: ["Paystack", "upstream payload", "sk_live_secret123", "Invalid key"],
    expectedCategory: "provider_error"
  },
  {
    label: "database",
    error: new Error("SQL select * from app_users where email = alice@example.com"),
    forbidden: ["select *", "app_users", "alice@example.com"],
    expectedCategory: "database_error"
  },
  {
    label: "storage",
    error: new Error("Supabase storage/v1 object path profile-photos/users/secret.jpg failed"),
    forbidden: ["Supabase", "storage/v1", "profile-photos/users/secret.jpg"],
    expectedCategory: "storage_error"
  },
  {
    label: "stack",
    error: Object.assign(new Error("stack leak"), {
      stack: "Error: stack leak\n    at handler (/app/api/member/photos.js:12:34)"
    }),
    forbidden: ["/app/api/member/photos.js", "at handler"],
    expectedCategory: "stack_trace"
  }
];

for (const testCase of dangerousCases) {
  const caseLogs = [];
  const caseRes = createResponse();
  const caseReq = {
    headers: {},
    observability: {},
    socket: { remoteAddress: "203.0.113.55" }
  };
  console.error = (...args) => caseLogs.push(args);
  sendLoggedApiError({
    req: caseReq,
    res: caseRes,
    event: `raw_error_${testCase.label}_test`,
    error: testCase.error,
    status: 500,
    message: "Unable to complete request."
  });
  console.error = originalError;

  const responseText = JSON.stringify(caseRes.payload);
  const logText = JSON.stringify(caseLogs);
  assert(caseRes.payload?.requestId, `${testCase.label} response must include requestId`);
  assert(caseRes.payload?.error === "Unable to complete request.", `${testCase.label} response must be generic`);
  assert(logText.includes(testCase.expectedCategory), `${testCase.label} logs must include sanitized category`);
  for (const forbidden of testCase.forbidden) {
    assert(!responseText.includes(forbidden), `${testCase.label} response leaked ${forbidden}`);
    assert(!logText.includes(forbidden), `${testCase.label} logs leaked ${forbidden}`);
  }
}

assert(
  safeClientMessage("SQL select * from app_users", "Fallback") === "Fallback",
  "safeClientMessage must block SQL details"
);
assert(
  safeClientMessage("Paystack upstream payload Invalid key", "Fallback") === "Fallback",
  "safeClientMessage must block provider details"
);
assert(
  safeClientMessage("That code has expired. Request a new one.", "Fallback") ===
    "That code has expired. Request a new one.",
  "safeClientMessage must preserve known user-safe UX copy"
);

console.log("raw error hardening tests ok");
