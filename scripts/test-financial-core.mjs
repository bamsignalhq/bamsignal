#!/usr/bin/env node
/**
 * Sprint 3 — Financial Core tests.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { FINANCIAL_STATUSES } from "../server/services/finance/lifecycle.js";
import { FINANCIAL_EVENT_TYPES } from "../server/services/finance/eventBus.js";
import { SUBSCRIPTION_STATUSES } from "../server/services/finance/subscriptions.js";
import {
  resolveFinancialIdempotencyKey,
  resolveRefundIdempotencyKey,
  resolveWebhookIdempotencyKey
} from "../server/services/finance/idempotency.js";
import { getFinancialObservabilityMetrics, incrementFinancialMetric } from "../server/services/finance/observability.js";
import { PRODUCTION_CERT_VERSION } from "../shared/productionCertification.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

const migration = read("migrations/0059_member_financial_core.sql");
assert(migration.includes("member_financial_ledger"), "ledger table");
assert(migration.includes("member_financial_lifecycle_log"), "lifecycle log");
assert(migration.includes("member_refund_records"), "refund records");
assert(migration.includes("member_financial_reconciliation_runs"), "reconciliation runs");
assert(migration.includes("member_financial_events"), "financial event bus table");
assert(migration.includes("member_subscription_state"), "subscription state table");
assert(migration.includes("idempotency_key"), "idempotency key columns");

const schema = read("server/services/schemaVerification.js");
for (const table of [
  "member_financial_ledger",
  "member_financial_lifecycle_log",
  "member_financial_events",
  "member_refund_records",
  "member_financial_reconciliation_runs",
  "member_subscription_state",
  "member_subscription_lifecycle_log"
]) {
  assert(schema.includes(`"${table}"`), `schema requires ${table}`);
}

const fortress = read("server/services/paymentFortress.js");
assert(
  fortress.includes("handlePaymentFinancialEvent") && fortress.includes("lifecycleStatus"),
  "payment fortress integrates financial ledger"
);
assert(fortress.includes("webhookEventId"), "webhook idempotency wired in payment fortress");

const webhook = read("server/services/paystackWebhookHandler.js");
assert(webhook.includes("incrementFinancialMetric"), "webhook financial observability");
assert(webhook.includes("webhookEventId"), "webhook passes event id for idempotency");

const appSource = read("server/app.js");
assert(appSource.includes("/api/finance/billing"), "billing route");
assert(appSource.includes("/api/finance/admin"), "admin finance route");

assert(FINANCIAL_STATUSES.length === 9, "nine financial lifecycle states");
assert(FINANCIAL_EVENT_TYPES.length === 10, "ten financial event types");
assert(SUBSCRIPTION_STATUSES.length === 7, "seven subscription lifecycle states");

assert(
  resolveFinancialIdempotencyKey({ reference: "ref_abc", lifecycleStatus: "successful" }) ===
    "pay:ref_abc:successful",
  "payment idempotency key"
);
assert(resolveRefundIdempotencyKey("rf_1", "create") === "refund:rf_1:create", "refund idempotency key");
assert(
  resolveWebhookIdempotencyKey("evt_1", "ref_abc") === "webhook:evt_1:ref_abc",
  "webhook idempotency key"
);

incrementFinancialMetric("successfulPayments", 1);
const metrics = getFinancialObservabilityMetrics();
assert(metrics.successfulPayments >= 1, "financial metrics");

assert(PRODUCTION_CERT_VERSION === "1.5.0", "certification version for Sprint 5");

for (const doc of [
  "docs/architecture/PAYMENTS.md",
  "docs/architecture/FINANCIAL_LEDGER.md",
  "docs/architecture/SUBSCRIPTIONS.md",
  "docs/architecture/PAYMENT_FLOW_AUDIT.md",
  "docs/operations/PAYMENT_RUNBOOK.md"
]) {
  assert(existsSync(join(rootPath, doc)), `${doc} exists`);
}

const financeIndex = read("src/finance/index.ts");
assert(financeIndex.includes("FinancialTransactionStatus"), "TS finance contracts");

const membershipCommerce = read("server/services/membershipCommerce.js");
assert(
  membershipCommerce.includes("recordSubscriptionActivatedFromPayment"),
  "subscription state machine hooked to membership activation"
);

if (failed) process.exit(1);
console.log("financial core tests ok");
