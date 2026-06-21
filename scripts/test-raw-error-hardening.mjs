#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sendLoggedApiError } from "../server/services/apiErrorResponse.js";

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
const pinLoginSource = read("api/auth/pin-login.js");
const memberDataSource = read("api/member/data.js");
const memberPhotosSource = read("api/member/photos.js");

assert(
  helperSource.includes("ensureApiRequestContext") &&
    helperSource.includes("createRequestId") &&
    helperSource.includes("REQUEST_ID_HEADER") &&
    helperSource.includes("logSanitizedApiError"),
  "API error helper must attach request ids and log sanitized details"
);

for (const [name, source] of [
  ["pin-login", pinLoginSource],
  ["member-data", memberDataSource],
  ["member-photos", memberPhotosSource]
]) {
  assert(
    source.includes("sendLoggedApiError") || source.includes("sendApiError"),
    `${name} must use generic API error responses with request ids`
  );
  assert(!source.includes("error: error.message"), `${name} must not return error.message to clients`);
  assert(!source.includes("error.message ||"), `${name} must not fall back to raw error.message`);
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

console.log("raw error hardening tests ok");
