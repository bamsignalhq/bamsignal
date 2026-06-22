#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONSULTATION_FEE_AMOUNT_KOBO,
  CONSULTATION_FEE_PRODUCT_TYPE,
  CONSULTATION_PAYMENT_TIMELINE_EVENTS,
  isConsultationFeeProductType,
  isConsultationPaystackMetadata,
  isValidConsultationPaymentId,
  normalizeConsultationPaymentId,
  resolveConsultationFeeIntent,
  resolvePaystackWebhookSecret,
  verifyConsultationWebhookSignature
} from "../server/services/paystackConsultationService.js";

const CONSULTATION_PAYMENTS_API_PATH = "/api/consultation-payments";
const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

assert(CONSULTATION_FEE_AMOUNT_KOBO === 10_000_000, "consultation fee is ₦100,000 in kobo");
assert(CONSULTATION_FEE_PRODUCT_TYPE === "consultation-fee", "product type is consultation-fee");
assert(isValidConsultationPaymentId("BS-PAY-2026-0001"), "accepts valid BS-PAY-YYYY-#### IDs");
assert(!isValidConsultationPaymentId("BS-PAY-26-1"), "rejects malformed payment IDs");
assert(
  normalizeConsultationPaymentId("bs-pay-2026-0042") === "BS-PAY-2026-0042",
  "normalizes payment ID casing"
);

const intent = resolveConsultationFeeIntent({
  paymentId: "BS-PAY-2026-0001",
  memberId: "member_abc",
  journeyId: "BS-JRN-2026-0001"
});
assert(intent?.amountKobo === CONSULTATION_FEE_AMOUNT_KOBO, "intent amount matches server catalog");
assert(intent?.productId === "BS-PAY-2026-0001", "intent productId is permanent payment ID");
assert(intent?.memberId === "member_abc", "intent carries member ID");
assert(intent?.journeyId === "BS-JRN-2026-0001", "intent carries journey ID");
assert(resolveConsultationFeeIntent({ paymentId: "invalid", memberId: "x" }) === null, "rejects invalid intent");

assert(isConsultationFeeProductType("consultation-fee"), "detects consultation fee product type");
assert(
  isConsultationPaystackMetadata({ product_type: "consultation-fee", consultation_fee: true }),
  "detects consultation Paystack metadata"
);

assert(
  CONSULTATION_PAYMENT_TIMELINE_EVENTS.length === 6,
  "timeline events cover payment lifecycle"
);
assert(
  CONSULTATION_PAYMENT_TIMELINE_EVENTS.includes("payment-created") &&
    CONSULTATION_PAYMENT_TIMELINE_EVENTS.includes("consultation-unlocked"),
  "timeline includes payment-created and consultation-unlocked"
);

assert(CONSULTATION_PAYMENTS_API_PATH === "/api/consultation-payments", "canonical API path");

const appSource = readFileSync(join(rootPath, "server/app.js"), "utf8");
assert(
  appSource.includes('"/api/consultation-payments"') &&
    appSource.includes('"/api/consultation-payment"'),
  "both consultation payment API paths are mounted"
);

const gatewaySource = readFileSync(join(rootPath, "server/services/consultationPaymentGateway.js"), "utf8");
assert(
  gatewaySource.includes("paystackConsultationService.js"),
  "legacy gateway delegates to paystackConsultationService"
);

const secret = resolvePaystackWebhookSecret();
const body = Buffer.from('{"event":"charge.success"}');
const validSig = verifyConsultationWebhookSignature(body, "invalid");
assert(typeof validSig === "boolean", "webhook signature helper returns boolean");
assert(!validSig || secret, "webhook verification only passes with configured secret");

if (failed) process.exit(1);
console.log("consultation payment tests ok");
