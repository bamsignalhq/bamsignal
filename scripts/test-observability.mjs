/**
 * Observability — structured logs, request ids, secret redaction.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  createRequestId,
  logAlertableEvent,
  logObservabilityEvent,
  logReadyCheckFailed,
  logThresholdedAlert,
  sanitizeLogContext
} from "../server/services/observability.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const requestId = createRequestId();
assert(/^[0-9a-f-]{36}$/i.test(requestId), "request ids must be UUIDs");

const redacted = sanitizeLogContext({
  email: "member@example.com",
  bearer: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.def",
  password: "secret-pin",
  reference: "bs_test_ref",
  nested: {
    phone: "08012345678",
    token: "abc123"
  }
});
assert(redacted.email === "[redacted]", "email values must be redacted by key");
assert(redacted.password === "[redacted]", "password values must be redacted");
assert(redacted.reference === "bs_test_ref", "non-sensitive fields must remain");
assert(redacted.nested.phone === "[redacted]", "nested sensitive keys must be redacted");
assert(redacted.nested.token === "[redacted]", "nested tokens must be redacted");

const redactedString = sanitizeLogContext({
  message: "failed for user@example.com with sk_live_abcd1234"
});
assert(
  !String(redactedString.message).includes("user@example.com"),
  "email patterns inside strings must be redacted"
);
assert(
  !String(redactedString.message).includes("sk_live_abcd1234"),
  "paystack secret patterns inside strings must be redacted"
);

const paymentLog = logAlertableEvent("payment_verify_failed", {
  requestId,
  reference: "bs_demo_ref",
  code: "upstream_error"
});
assert(paymentLog.event === "payment_verify_failed", "alertable events must include event name");
assert(paymentLog.requestId === requestId, "structured logs must preserve requestId");

const infoLog = logObservabilityEvent("payment_initialized", { reference: "bs_demo_ref" }, "info");
assert(infoLog.event === "payment_initialized", "info events must stay structured");

const firstReady = logReadyCheckFailed({ ready: false, source: "test" });
const secondReady = logReadyCheckFailed({ ready: false, source: "test" });
assert(firstReady?.event === "ready_check_failed", "ready failures must emit alertable events");
assert(secondReady === null, "ready failure logs must be rate limited");

const firstPaymentAlert = logThresholdedAlert("payment_verify_failed", {
  scope: "observability_test",
  reference: "bs_obs_test"
});
const secondPaymentAlert = logThresholdedAlert("payment_verify_failed", {
  scope: "observability_test",
  reference: "bs_obs_test"
});
assert(firstPaymentAlert?.event === "payment_verify_failed", "thresholded payment alerts must emit once");
assert(secondPaymentAlert === null, "thresholded payment alerts must dedupe");

const appSource = read("server/app.js");
const observabilitySource = read("server/services/observability.js");
const paystackVerifySource = read("api/paystack/verify.js");
const webhookSource = read("server/services/paystackWebhookHandler.js");
const purchaseEmailSource = read("server/services/purchaseEmail.js");
const photosSource = read("api/member/photos.js");
const voiceSource = read("api/member/voice.js");
const memberDataSource = read("api/member/data.js");
const productionSource = read("server/production.js");

assert(
  observabilitySource.includes("requestContextMiddleware") &&
    observabilitySource.includes("sanitizeLogContext") &&
    observabilitySource.includes("payment_verify_failed") &&
    observabilitySource.includes("payment_initialize_failed") &&
    observabilitySource.includes("background_task_failed") &&
    observabilitySource.includes("logThresholdedAlert") &&
    observabilitySource.includes("logRetryExhausted"),
  "observability service must expose middleware, redaction, thresholds, and standard events"
);
assert(
  appSource.includes("requestContextMiddleware") &&
    appSource.includes("logReadyCheckFailed") &&
    appSource.includes("unhandled_request_error"),
  "Express app must attach request ids and log unhandled errors"
);
assert(
  paystackVerifySource.includes("logPaymentProviderError") &&
    read("server/services/paystackClient.js").includes("payment_verify_failed") &&
    read("server/services/paystackClient.js").includes("payment_initialize_failed") &&
    webhookSource.includes("payment_webhook_failed") &&
    purchaseEmailSource.includes("email_send_failed") &&
    photosSource.includes("photo_upload_failed") &&
    voiceSource.includes("voice_intro_failed") &&
    memberDataSource.includes("profile_save_failed"),
  "critical failure paths must emit standard observability events"
);
assert(
  productionSource.includes("logBackgroundTaskFailure") &&
    !productionSource.includes("account deletion sweep skipped"),
  "background task failures must be logged instead of swallowed"
);

console.log("observability tests ok");
