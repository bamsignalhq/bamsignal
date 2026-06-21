/**
 * Auth throttle outage safety — member memory fallback, admin fail-closed.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  checkMemoryMemberThrottle,
  recordMemoryMemberThrottleFailure,
  resetMemoryMemberThrottleStore
} from "../server/services/memoryThrottle.js";
import {
  PIN_AUTH_LOCK_MS,
  PIN_AUTH_MAX_ATTEMPTS,
  PIN_AUTH_WINDOW_MS,
  checkPinLoginThrottle,
  recordPinLoginFailure
} from "../server/services/pinAuthThrottle.js";
import {
  ADMIN_SECURITY_UNAVAILABLE_MESSAGE,
  checkAdminActionPinThrottle
} from "../server/services/adminActionPinThrottle.js";
import { isDatabaseReady } from "../server/db.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pinAuthSource = readFileSync(join(rootPath, "server/services/pinAuthThrottle.js"), "utf8");
const adminThrottleSource = readFileSync(
  join(rootPath, "server/services/adminActionPinThrottle.js"),
  "utf8"
);
const adminConsentSource = readFileSync(join(rootPath, "server/adminConsent.js"), "utf8");
const memoryThrottleSource = readFileSync(join(rootPath, "server/services/memoryThrottle.js"), "utf8");

assert(
  pinAuthSource.includes("checkMemoryMemberThrottle") &&
    pinAuthSource.includes("recordMemoryMemberThrottleFailure") &&
    pinAuthSource.includes("useMemberMemoryFallback") &&
    !pinAuthSource.includes("if (!isDatabaseReady()) {\n    return { ok: true, locked: false, lockedUntil: null };\n  }"),
  "PIN auth throttle must use memory fallback instead of fail-open when DB is unavailable"
);
assert(
  adminThrottleSource.includes("ADMIN_SECURITY_UNAVAILABLE_MESSAGE") &&
    adminThrottleSource.includes("failClosed: true") &&
    adminThrottleSource.includes("logAdminFailClosed"),
  "admin action PIN throttle must fail closed when database persistence is unavailable"
);
assert(
  adminConsentSource.includes("throttle.failClosed") &&
    adminConsentSource.includes("ADMIN_SECURITY_UNAVAILABLE_MESSAGE"),
  "admin consent must surface fail-closed security errors"
);
assert(
  memoryThrottleSource.includes("memberStore") &&
    memoryThrottleSource.includes("throttle_db_unavailable") &&
    memoryThrottleSource.includes("logObservabilityEvent"),
  "memory throttle fallback must stay process-local with observability logs"
);

resetMemoryMemberThrottleStore();

const reqShape = {
  headers: { "user-agent": "auth-throttle-test" },
  socket: { remoteAddress: "203.0.113.10" }
};
const config = {
  action: "pin_login",
  identifier: "memorytest",
  ip: "203.0.113.10",
  userAgentHash: "abc123",
  windowMs: PIN_AUTH_WINDOW_MS,
  lockMs: PIN_AUTH_LOCK_MS,
  maxAttempts: PIN_AUTH_MAX_ATTEMPTS
};

let lastRecord = null;
for (let attempt = 0; attempt < PIN_AUTH_MAX_ATTEMPTS; attempt += 1) {
  lastRecord = recordMemoryMemberThrottleFailure(config);
}
assert(lastRecord?.locked === true, "memory throttle must lock after max member attempts");

const lockedCheck = checkMemoryMemberThrottle(config);
assert(lockedCheck.locked === true && lockedCheck.ok === false, "memory throttle must stay locked");

if (!isDatabaseReady()) {
  const username = `outage_${Date.now()}`;
  for (let attempt = 0; attempt < PIN_AUTH_MAX_ATTEMPTS; attempt += 1) {
    await recordPinLoginFailure(reqShape, username);
  }
  const throttle = await checkPinLoginThrottle(reqShape, username);
  assert(throttle.locked === true, "PIN login must remain throttled when database is unavailable");

  const adminThrottle = await checkAdminActionPinThrottle(reqShape, "admin@example.com");
  assert(adminThrottle.failClosed === true, "admin PIN checks must fail closed without database");
  assert(
    adminThrottle.error === ADMIN_SECURITY_UNAVAILABLE_MESSAGE,
    "admin fail-closed message must stay generic"
  );
  assert(!("attempts" in adminThrottle), "admin fail-closed response must not expose attempt counts");
}

console.log("auth throttle outage tests ok");
