#!/usr/bin/env node
import { isDisposableEmail } from "../shared/blockedEmailDomains.mjs";
import {
  assertSignupMathChallengePassed,
  issueSignupMathChallenge
} from "../server/services/signupMathChallenge.js";

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

assert(isDisposableEmail("user@mailinator.com"), "blocks mailinator");
assert(isDisposableEmail("user@sub.mailinator.com"), "blocks subdomain mailinator");
assert(!isDisposableEmail("user@gmail.com"), "allows gmail");

const challenge = issueSignupMathChallenge();
assert(challenge.token && challenge.a >= 1 && challenge.b >= 1, "issues math challenge");
assertSignupMathChallengePassed(challenge.token, String(challenge.a + challenge.b));
let mathRejected = false;
try {
  assertSignupMathChallengePassed(challenge.token, "0");
} catch {
  mathRejected = true;
}
assert(mathRejected, "rejects wrong math answer");

if (failed) process.exit(1);
console.log("signup protection tests ok");
