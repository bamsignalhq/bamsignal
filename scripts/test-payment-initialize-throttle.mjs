/**
 * Payment initialize abuse guard regression checks.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import handler from "../api/paystack/verify.js";
import {
  PAYMENT_INITIALIZE_BURST_MAX_REQUESTS,
  PAYMENT_INITIALIZE_MAX_REQUESTS,
  PAYMENT_INITIALIZE_RATE_LIMITED_MESSAGE,
  enforcePaymentInitializeThrottle
} from "../server/services/paymentInitializeThrottle.js";
import { resetMemoryMemberThrottleStore } from "../server/services/memoryThrottle.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

const paystackSource = readFileSync(join(rootPath, "api/paystack/verify.js"), "utf8");
const throttleSource = readFileSync(
  join(rootPath, "server/services/paymentInitializeThrottle.js"),
  "utf8"
);
const paymentsSource = readFileSync(join(rootPath, "src/services/payments.ts"), "utf8");

assert(
  paystackSource.includes("requireMemberAuth(req, body)") &&
    paystackSource.includes("enforcePaymentInitializeThrottle") &&
    paystackSource.indexOf("requireMemberAuth(req, body)") < paystackSource.indexOf("if (!paystackConfigured())"),
  "initialize actions must require member auth before Paystack configuration is exposed"
);
assert(
  throttleSource.includes("payment_initialize_rate_events") &&
    throttleSource.includes("PAYMENT_INITIALIZE_MAX_REQUESTS = 5") &&
    throttleSource.includes("PAYMENT_INITIALIZE_BURST_MAX_REQUESTS") &&
    throttleSource.includes("checkMemoryMemberThrottle") &&
    throttleSource.includes("payment_initialize_rate_limited"),
  "payment initialize throttle must use durable events, 5/min limits, burst protection, memory fallback, and observability"
);
assert(
  paymentsSource.includes("memberApiHeaders") && paymentsSource.includes("headers: await memberApiHeaders()"),
  "payment initialize client must attach member bearer headers"
);

const anonymousResponse = createResponse();
await handler(
  {
    method: "POST",
    query: { action: "initialize" },
    headers: { "content-type": "application/json", "user-agent": "payment-throttle-test" },
    socket: { remoteAddress: "203.0.113.40" },
    body: JSON.stringify({ email: "anonymous@example.com", productId: "weekly" })
  },
  anonymousResponse
);
assert(
  anonymousResponse.statusCode === 401,
  `anonymous initialize must return 401 before Paystack checks (got ${anonymousResponse.statusCode})`
);
assert(
  anonymousResponse.body?.error === "not_authorized",
  "anonymous initialize must return a generic not_authorized response"
);

resetMemoryMemberThrottleStore();

const reqShape = {
  headers: { "user-agent": "payment-throttle-test" },
  socket: { remoteAddress: "203.0.113.41" }
};
const memberAuth = {
  ok: true,
  authUserId: "00000000-0000-4000-8000-000000000001",
  email: "member@example.com",
  identity: { email: "member@example.com", name: "Member" }
};

const normalAttempt = await enforcePaymentInitializeThrottle({
  req: reqShape,
  action: "initialize",
  memberAuth
});
assert(normalAttempt.ok === true, "first authenticated initialize should be allowed");

resetMemoryMemberThrottleStore();

let lastResult = null;
for (let attempt = 0; attempt < PAYMENT_INITIALIZE_BURST_MAX_REQUESTS; attempt += 1) {
  lastResult = await enforcePaymentInitializeThrottle({
    req: reqShape,
    action: "initialize",
    memberAuth
  });
  assert(lastResult.ok === true, `burst attempt ${attempt + 1} should still be allowed`);
}

lastResult = await enforcePaymentInitializeThrottle({
  req: reqShape,
  action: "initialize",
  memberAuth
});
assert(lastResult.ok === false, "burst spam should be blocked by the memory fallback");
assert(lastResult.store === "memory", "outage fallback must use memory storage instead of failing open");
assert(
  PAYMENT_INITIALIZE_RATE_LIMITED_MESSAGE === "Too many attempts. Please try again later.",
  "429 payment initialize message must stay generic"
);
assert(PAYMENT_INITIALIZE_MAX_REQUESTS === 5, "payment initialize main window must allow 5 requests per minute");

console.log("payment initialize throttle tests ok");
