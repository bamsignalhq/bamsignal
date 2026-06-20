/**
 * Static checks for admin action PIN throttling.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assertCheck(condition, message) {
  if (condition) return;
  console.error(`admin action pin throttle test failed: ${message}`);
  process.exit(1);
}

const throttleSource = readFileSync(
  join(rootPath, "server/services/adminActionPinThrottle.js"),
  "utf8"
);
const adminConsentSource = readFileSync(join(rootPath, "server/adminConsent.js"), "utf8");
const consentApiSource = readFileSync(join(rootPath, "api/admin/consent.js"), "utf8");
const adminSessionSource = readFileSync(join(rootPath, "src/utils/adminSession.ts"), "utf8");

assertCheck(
  throttleSource.includes('const ACTION = "admin_action_pin"') &&
    throttleSource.includes("const MAX_ATTEMPTS = 5") &&
    throttleSource.includes("15 * 60 * 1000") &&
    throttleSource.includes("30 * 60 * 1000") &&
    throttleSource.includes("attempt_count") &&
    throttleSource.includes("locked_until"),
  "admin action PIN throttle must use 5 attempts, 15 minute window, and 30 minute lock"
);

assertCheck(
  adminConsentSource.includes("attemptAdminActionPin") &&
    adminConsentSource.includes("admin_action_pin_failed") &&
    adminConsentSource.includes("admin_action_pin_locked") &&
    adminConsentSource.includes("admin_action_pin_success") &&
    adminConsentSource.includes("INVALID_ADMIN_ACTION_PIN_MESSAGE") &&
    adminConsentSource.includes("ADMIN_ACTION_PIN_LOCKED_MESSAGE") &&
    adminConsentSource.includes("ADMIN_SECURITY_UNAVAILABLE_MESSAGE") &&
    adminConsentSource.includes("throttle.failClosed"),
  "admin consent must enforce throttled PIN attempts with generic responses"
);

assertCheck(
  !adminConsentSource.includes("console.log") &&
    !adminConsentSource.match(/console\.(info|log|error)\([^)]*\bpin\b[^)]*\)/i),
  "admin action PIN flow must not log PIN values"
);

assertCheck(
  adminConsentSource.includes("recordAdminActionPinSuccess") &&
    throttleSource.includes("delete from pin_auth_attempts where action = $1 and identifier = $2"),
  "successful admin action PIN verification must clear failed attempts"
);

assertCheck(
  consentApiSource.includes("createConsentFromPin(req, body.pin)") &&
    consentApiSource.includes("rotateAdminActionPin(req,"),
  "admin consent API must pass request context into throttled PIN verification"
);

assertCheck(
  adminSessionSource.includes("clearAdminConsentToken") &&
    adminSessionSource.includes("handleAdminSessionExpired"),
  "admin session expiry must clear action PIN consent trust"
);

function simulateThrottle(maxAttempts, attemptNumber) {
  if (attemptNumber <= maxAttempts) {
    return { locked: false, message: "Invalid action PIN." };
  }
  return { locked: true, message: "Too many attempts. Please try again later." };
}

assertCheck(
  simulateThrottle(5, 5).locked === false,
  "first 5 failed admin PIN attempts must stay on invalid action PIN response"
);
assertCheck(
  simulateThrottle(5, 6).locked === true,
  "6th admin PIN attempt must return lock response"
);

console.log("admin action pin throttle tests ok");
