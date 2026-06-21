/**
 * Long-running stability guards — retry limits, alert thresholds, lifecycle cleanup.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  logListenerCleanup,
  logRetryExhausted,
  logThresholdedAlert,
  logTimerCleanup
} from "../server/services/observability.js";
import { isRetryableHttpStatus, isRetryableNetworkError, withBoundedRetry } from "../server/services/retryPolicy.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const observabilitySource = read("server/services/observability.js");
const retryPolicySource = read("server/services/retryPolicy.js");
const paystackClientSource = read("server/services/paystackClient.js");
const purchaseEmailSource = read("server/services/purchaseEmail.js");
const appSource = read("src/App.tsx");
const serviceWorkerSource = read("src/utils/serviceWorker.ts");
const flowWatchdogSource = read("src/hooks/useFlowWatchdog.ts");

assert(
  observabilitySource.includes("logThresholdedAlert") &&
    observabilitySource.includes("logRetryExhausted") &&
    observabilitySource.includes("logTimerCleanup") &&
    observabilitySource.includes("logListenerCleanup") &&
    observabilitySource.includes("logWebsocketClosed"),
  "observability must expose thresholded alerts and lifecycle events"
);

assert(
  retryPolicySource.includes("withBoundedRetry") &&
    retryPolicySource.includes("isRetryableHttpStatus") &&
    retryPolicySource.includes("logRetryExhausted"),
  "retry policy must bound retries and log exhaustion"
);

assert(
  paystackClientSource.includes("withBoundedRetry") &&
    paystackClientSource.includes('service: "paystack"'),
  "Paystack client must use bounded retry for transient failures"
);

assert(
  purchaseEmailSource.includes("withBoundedRetry") &&
    purchaseEmailSource.includes('service: "resend"') &&
    purchaseEmailSource.includes("logThresholdedAlert"),
  "purchase email must retry transient Resend failures with thresholded alerts"
);

assert(
  appSource.includes("MAX_COMPLIANCE_SYNC_ATTEMPTS") &&
    appSource.includes("retry_exhausted"),
  "compliance sync polling must stop after a bounded number of attempts"
);

assert(
  serviceWorkerSource.includes("MAX_RECOVERY_RELOADS") &&
    serviceWorkerSource.includes("canRecoveryReload"),
  "service worker recovery must cap reload loops"
);

assert(
  flowWatchdogSource.includes("clearFlowState()") &&
    flowWatchdogSource.includes("window.clearInterval(timer)"),
  "flow watchdog must clear timers and flow state on cleanup"
);

const firstAlert = logThresholdedAlert("payment_verify_failed", { scope: "test", reference: "bs_stability" });
const secondAlert = logThresholdedAlert("payment_verify_failed", { scope: "test", reference: "bs_stability" });
assert(firstAlert?.event === "payment_verify_failed", "thresholded alerts must emit on first failure");
assert(secondAlert === null, "thresholded alerts must dedupe within the window");

logTimerCleanup("test_interval", { kind: "interval" });
logListenerCleanup("test_listener", { scope: "test" });
logRetryExhausted("test_service", { attempts: 3 });

let attempts = 0;
try {
  await withBoundedRetry(
    async () => {
      attempts += 1;
      throw new Error("network down");
    },
    {
      service: "test_retry",
      attempts: 3,
      shouldRetry: () => true
    }
  );
  throw new Error("bounded retry should have thrown");
} catch (error) {
  assert(error instanceof Error && error.message === "network down", "bounded retry must eventually throw");
}
assert(attempts === 3, "bounded retry must respect attempt count");

assert(isRetryableHttpStatus(503), "503 must be retryable");
assert(!isRetryableHttpStatus(400), "400 must not be retryable");
assert(isRetryableNetworkError({ code: "ETIMEDOUT" }), "network timeouts must be retryable");

console.log("stability tests ok");
