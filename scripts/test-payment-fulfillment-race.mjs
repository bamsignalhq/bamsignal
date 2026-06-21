#!/usr/bin/env node
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

function readProjectFile(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const paymentFulfillmentsSource = readProjectFile("server/services/paymentFulfillments.js");
const paymentFortressSource = readProjectFile("server/services/paymentFortress.js");
const paystackVerifySource = readProjectFile("api/paystack/verify.js");
const paystackWebhookHandlerSource = readProjectFile("server/services/paystackWebhookHandler.js");
const cityHomeSource = readProjectFile("server/cityHome.js");
const dbSource = readProjectFile("server/db.js");
const baselineMigrationSource = readProjectFile("migrations/0002_baseline_bamsignal_schema.sql");
const migrationSource = readProjectFile(
  "supabase/migrations/202606211300_payment_fulfillment_processing.sql"
);
const completeFulfillmentStart = paymentFortressSource.indexOf(
  "export async function completePaymentFulfillment"
);
const processingClaimCall = paymentFortressSource.indexOf(
  "const processingClaim = await claimPaymentFulfillmentProcessing",
  completeFulfillmentStart
);
const activationCall = paymentFortressSource.indexOf(
  "const activation = await fulfillVerifiedPurchase",
  completeFulfillmentStart
);

assert(
  paymentFulfillmentsSource.includes("claimPaymentFulfillmentProcessing") &&
    paymentFulfillmentsSource.includes("PAYMENT_FULFILLMENT_PROCESSING_TIMEOUT_MINUTES") &&
    paymentFulfillmentsSource.includes('"processing"') &&
    paymentFulfillmentsSource.includes("status = 'processing'") &&
    paymentFulfillmentsSource.includes("status = 'pending'") &&
    paymentFulfillmentsSource.includes("processing_started_at < now() -"),
  "payment fulfillment claims must atomically move pending references into processing"
);

assert(
  paymentFortressSource.includes("claimPaymentFulfillmentProcessing") &&
    paymentFortressSource.includes("fulfillmentAlreadyInProgress") &&
    paymentFortressSource.includes("processingClaim.claimed") &&
    paymentFortressSource.includes("status: 503") &&
    completeFulfillmentStart >= 0 &&
    processingClaimCall > completeFulfillmentStart &&
    activationCall > processingClaimCall,
  "fulfillment orchestration must claim processing before activating entitlements"
);

assert(
  paystackVerifySource.includes("result.processing") &&
    paystackVerifySource.includes("status(503)") &&
    paystackVerifySource.includes("PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE"),
  "browser payment verification must treat concurrent fulfillment as retryable"
);

assert(
  paystackWebhookHandlerSource.includes("result?.processing") &&
    paystackWebhookHandlerSource.includes("status: 503") &&
    paystackWebhookHandlerSource.includes("PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE"),
  "webhooks must retry while another callback is still fulfilling the same reference"
);

assert(
  !dbSource.includes("create table if not exists") &&
    dbSource.includes("checkSchema({ force: true })"),
  "database startup must verify schema without runtime DDL"
);
assert(
  baselineMigrationSource.includes("payment_fulfillments_reference_unique_idx") &&
    baselineMigrationSource.includes("app_users_paystack_reference_unique_idx") &&
    baselineMigrationSource.includes("city_home_placements_paystack_reference_unique_idx"),
  "schema migrations must enforce unique payment references across fulfillment and entitlement tables"
);
assert(
  migrationSource.includes("payment_fulfillments_reference_unique_idx") &&
    migrationSource.includes("app_users_paystack_reference_unique_idx") &&
    migrationSource.includes("city_home_placements_paystack_reference_unique_idx"),
  "schema migration must enforce unique payment references across fulfillment and entitlement tables"
);

assert(
  cityHomeSource.includes("on conflict (paystack_reference)") &&
    cityHomeSource.includes("id <>") &&
    cityHomeSource.includes("await ensureCityHomeTables();") &&
    baselineMigrationSource.includes("city_home_placements_paystack_reference_unique_idx"),
  "paid city placements must be idempotent by Paystack reference and keep existing placements active"
);

function createClaimState(status = "pending", processingStartedAt = null) {
  return {
    status,
    processingStartedAt,
    claim(nowMs, timeoutMs = 15 * 60 * 1000) {
      const stale =
        this.status === "processing" &&
        (!this.processingStartedAt || this.processingStartedAt < nowMs - timeoutMs);
      if (this.status !== "pending" && !stale) return false;
      this.status = "processing";
      this.processingStartedAt = nowMs;
      return true;
    }
  };
}

const now = Date.now();
const freshRace = createClaimState();
assert(freshRace.claim(now) === true, "first callback must win the processing claim");
assert(freshRace.claim(now + 1) === false, "second concurrent callback must not win");

const staleProcessing = createClaimState("processing", now - 16 * 60 * 1000);
assert(staleProcessing.claim(now) === true, "stale processing references must become retryable");

const fulfilled = createClaimState("fulfilled", now - 16 * 60 * 1000);
assert(fulfilled.claim(now) === false, "fulfilled references must never be claimed again");

if (failed) process.exit(1);
console.log("payment fulfillment race tests ok");
