#!/usr/bin/env node
import {
  PaymentDatabaseError,
  PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE,
  isPaymentDatabaseError,
  paymentHttpStatusForError,
  requireDatabaseReadyForPayments
} from "../server/services/paymentDb.js";
import { claimPaymentFulfillment } from "../server/services/paymentFulfillments.js";

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

let dbUnavailableThrown = false;
try {
  requireDatabaseReadyForPayments();
} catch (error) {
  dbUnavailableThrown = error instanceof PaymentDatabaseError;
}
assert(dbUnavailableThrown, "verify fails closed when DB unavailable");

let claimRejected = false;
try {
  await claimPaymentFulfillment({
    reference: "bs_test_persistence",
    productType: "premium",
    productId: "monthly",
    amountKobo: 399900
  });
} catch (error) {
  claimRejected = isPaymentDatabaseError(error);
}
assert(claimRejected, "ledger claim fails closed when DB unavailable");

assert(
  paymentHttpStatusForError(new PaymentDatabaseError()) === 503,
  "payment DB errors map to HTTP 503"
);
assert(
  PAYMENT_CONFIRM_UNAVAILABLE_MESSAGE.includes("Please try again"),
  "payment confirm unavailable message is retryable copy"
);

if (failed) process.exit(1);
console.log("payment persistence tests ok");
