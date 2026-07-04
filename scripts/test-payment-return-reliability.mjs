#!/usr/bin/env node
/**
 * SPRINT 030 — Payment return reliability regression checks (static + unit logic).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relPath) {
  return readFileSync(join(root, relPath), "utf8");
}

const appSource = read("src/App.tsx");
const screenSource = read("src/components/PaymentReturnScreen.tsx");
const statusSource = read("src/utils/paymentReturnStatus.ts");
const flowSource = read("src/utils/paymentReturnFlow.ts");
const verifySource = read("api/paystack/verify.js");
const eventsSource = read("server/services/paymentEvents.js");

assert(
  !appSource.includes('paymentReturnPhase === "idle" ? "verifying"'),
  "App no longer maps idle payment phase to verifying (false failure inversion removed)"
);
assert(
  appSource.includes("setPaystackCallbackActive(false)"),
  "Success path clears paystack callback before redirect"
);
assert(
  appSource.includes('outcome.status === "failed"'),
  "Failed phase gated on explicit backend failure status"
);
assert(
  !appSource.match(/if \(!userRef\.current\.email && !userRef\.current\.phone\)/),
  "bootAndVerify no longer fails before identity restore completes"
);
assert(
  appSource.includes("runPaymentReturnVerification"),
  "App uses canonical payment return verification flow"
);
assert(
  appSource.includes("shouldAttemptPaymentRecovery"),
  "Profile/payment recovery re-verify hook present"
);

assert(screenSource.includes('"processing"'), "PaymentReturnScreen supports processing phase");

assert(statusSource.includes("interpretVerifyHttpResponse"), "Canonical verify response parser exists");
assert(statusSource.includes("pollVerifyOutcome"), "Verify polling helper exists");

assert(flowSource.includes("pollVerifyOutcome"), "Payment return flow delegates to verify polling");

assert(verifySource.includes("tryOptionalMemberAuth"), "Verify endpoint resolves optional member auth for audit");
assert(verifySource.includes("repairPaymentAuditIdentity"), "Verify repairs audit identity after success");
assert(verifySource.includes("authUserId: memberAuth?.authUserId"), "Initialize audit stores auth user id");

assert(eventsSource.includes("coalesce(excluded.user_id"), "Audit append coalesces user_id on payment_events");

if (failed === 0) {
  console.log("PASS: payment return reliability checks");
} else {
  process.exitCode = 1;
  console.error(`${failed} check(s) failed`);
}
