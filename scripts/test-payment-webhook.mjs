#!/usr/bin/env node
import {
  PAYSTACK_WEBHOOK_ALIAS_PATHS,
  PAYSTACK_WEBHOOK_CANONICAL_PATH,
  PAYSTACK_WEBHOOK_MOUNT_PATHS,
  handlePaystackWebhookRequest,
  verifyPaystackWebhookSignature
} from "../server/services/paystackWebhookHandler.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

assert(
  PAYSTACK_WEBHOOK_CANONICAL_PATH === "/api/paystack/webhook",
  "canonical Paystack webhook path is /api/paystack/webhook"
);
assert(
  PAYSTACK_WEBHOOK_MOUNT_PATHS.includes(PAYSTACK_WEBHOOK_CANONICAL_PATH) &&
    PAYSTACK_WEBHOOK_ALIAS_PATHS.every((path) => PAYSTACK_WEBHOOK_MOUNT_PATHS.includes(path)),
  "all alias webhook paths are mounted"
);

const invalidSignature = await handlePaystackWebhookRequest({
  method: "POST",
  rawBody: Buffer.from('{"event":"charge.success"}'),
  signature: "invalid"
});
assert(invalidSignature.status === 401, "invalid webhook signature returns 401");

const methodNotAllowed = await handlePaystackWebhookRequest({
  method: "GET",
  rawBody: Buffer.from("{}"),
  signature: "invalid"
});
assert(methodNotAllowed.status === 405, "non-POST webhook requests return 405");

const ignoredEvent = await handlePaystackWebhookRequest({
  method: "POST",
  rawBody: Buffer.from('{"event":"transfer.success","data":{}}'),
  signature: "ignored"
});
assert(ignoredEvent.status === 401, "ignored events still require valid signature");

assert(
  typeof verifyPaystackWebhookSignature === "function",
  "shared handler exports signature verification"
);

const paystackRouterSource = readFileSync(join(rootPath, "server/routes/paystack.js"), "utf8");
const paystackWebhookApiSource = readFileSync(join(rootPath, "api/webhooks/paystack.js"), "utf8");
const paystackWebhookHandlerSource = readFileSync(
  join(rootPath, "server/services/paystackWebhookHandler.js"),
  "utf8"
);

assert(
  paystackRouterSource.includes("handlePaystackWebhookExpress") &&
    paystackRouterSource.includes("PAYSTACK_WEBHOOK_MOUNT_PATHS") &&
    !paystackRouterSource.includes("completePaymentFulfillment"),
  "Express paystack routes delegate to shared webhook handler"
);
assert(
  paystackWebhookApiSource.includes("handlePaystackWebhookRequest") &&
    !paystackWebhookApiSource.includes("completePaymentFulfillment"),
  "serverless webhook wrapper delegates to shared handler"
);
assert(
  paystackWebhookHandlerSource.includes("verifyPaystackWebhookSignature") &&
    paystackWebhookHandlerSource.includes("completePaymentFulfillment") &&
    paystackWebhookHandlerSource.includes("PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE"),
  "shared webhook handler owns fulfillment and fail-closed behavior"
);

if (failed) process.exit(1);
console.log("payment webhook tests ok");
