/**
 * Payment provider error sanitization regression checks.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  PaystackClientError,
  PAYMENT_INITIALIZE_CLIENT_ERROR,
  PAYMENT_VERIFY_CLIENT_ERROR,
  logPaymentProviderError,
  paystackErrorResponse
} from "../server/services/paystackClient.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const paystackClientSource = readFileSync(
  join(rootPath, "server/services/paystackClient.js"),
  "utf8"
);
const paystackVerifySource = readFileSync(join(rootPath, "api/paystack/verify.js"), "utf8");

assert(
  paystackClientSource.includes("PAYMENT_INITIALIZE_CLIENT_ERROR") &&
    paystackClientSource.includes("PAYMENT_VERIFY_CLIENT_ERROR") &&
    paystackClientSource.includes("logPaymentProviderError") &&
    paystackClientSource.includes("payment_provider_error") &&
    paystackClientSource.includes("upstreamMessage") &&
    paystackClientSource.includes("sanitizeApiErrorForLog") &&
    !paystackClientSource.includes("error: error.message || fallback"),
  "paystack client must map provider failures to generic client messages and sanitized diagnostics"
);

assert(
  paystackVerifySource.includes("PAYMENT_INITIALIZE_CLIENT_ERROR") &&
    paystackVerifySource.includes("PAYMENT_VERIFY_CLIENT_ERROR") &&
    paystackVerifySource.includes("logPaymentProviderError") &&
    !paystackVerifySource.includes("PAYSTACK_SECRET_KEY is not configured.") &&
    !paystackVerifySource.includes("error.message || \"Payment request failed.\""),
  "paystack verify API must not expose provider or config internals to clients"
);

const providerFailure = new PaystackClientError("Paystack initialize request failed.", {
  code: "initialize_failed",
  status: 503,
  upstreamStatus: 401,
  upstreamMessage: "Invalid key",
  upstreamBody: { status: false, message: "Invalid key" }
});

const initializeResponse = paystackErrorResponse(providerFailure, PAYMENT_INITIALIZE_CLIENT_ERROR);
assert(initializeResponse.body.error === PAYMENT_INITIALIZE_CLIENT_ERROR, "initialize failures must use generic copy");
assert(!initializeResponse.body.code, "client responses must not expose provider error codes");
assert(!JSON.stringify(initializeResponse.body).includes("Invalid key"), "provider message must not leak");

const networkFailure = new PaystackClientError("Paystack network request failed.", {
  code: "network_error",
  status: 503
});
const verifyResponse = paystackErrorResponse(networkFailure, PAYMENT_VERIFY_CLIENT_ERROR);
assert(verifyResponse.body.error === PAYMENT_VERIFY_CLIENT_ERROR, "verify failures must use generic copy");
assert(!verifyResponse.body.error.includes("network"), "network internals must not leak to clients");

const logs = [];
const originalError = console.error;
const originalWarn = console.warn;
console.error = (...args) => {
  logs.push(args);
};
console.warn = (...args) => {
  logs.push(args);
};

logPaymentProviderError(
  { headers: {}, observability: { requestId: "req_test", correlationId: "req_test" } },
  "initialize",
  providerFailure,
  { reference: "bs_test_ref" }
);

console.error = originalError;
console.warn = originalWarn;

const serialized = JSON.stringify(logs);
assert(serialized.includes("payment_provider_error"), "provider failures must log payment_provider_error");
assert(serialized.includes("payment_initialize_failed"), "initialize failures must log payment_initialize_failed");
assert(serialized.includes("provider_error"), "server logs must retain sanitized provider category");
assert(!serialized.includes("Invalid key"), "server logs must not retain raw provider diagnostic detail");
assert(!serialized.includes("status\":false"), "server logs must not retain provider payload bodies");
assert(serialized.includes("bs_test_ref"), "server logs must retain payment reference");

console.log("payment provider error tests ok");
