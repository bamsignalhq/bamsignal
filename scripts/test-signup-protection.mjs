#!/usr/bin/env node
process.env.CRON_SECRET = process.env.CRON_SECRET || "test-signup-math-secret";

import { isDisposableEmail } from "../shared/blockedEmailDomains.mjs";
import {
  assertSignupMathChallengePassed,
  buildSignupMathChallengeToken,
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
assert(isDisposableEmail("jamesowen@blondmail.com"), "blocks blondmail.com");
assert(isDisposableEmail("USER@BLONDMAIL.COM"), "blocks blondmail case-insensitive");
assert(isDisposableEmail("user@sub.blondmail.com"), "blocks blondmail subdomain");
assert(isDisposableEmail("user@tempmailo.com"), "blocks tempmailo.com");
assert(!isDisposableEmail("user@gmail.com"), "allows gmail");
assert(!isDisposableEmail("user@yahoo.com"), "allows yahoo");
assert(!isDisposableEmail("user@outlook.com"), "allows outlook");

const challenge = issueSignupMathChallenge();
assert(challenge.ok !== false, "issues math challenge");
assert(challenge.challengeToken && challenge.token === challenge.challengeToken, "returns challengeToken");
assert(challenge.a >= 1 && challenge.a <= 9, "operand a in range");
assert(challenge.b >= 1 && challenge.b <= 9, "operand b in range");

assertSignupMathChallengePassed(challenge.token, String(challenge.a + challenge.b));

let wrongAnswerRejected = false;
try {
  assertSignupMathChallengePassed(challenge.token, "0");
} catch (error) {
  wrongAnswerRejected = error?.code === "math_failed";
}
assert(wrongAnswerRejected, "rejects wrong math answer");

const expiredToken = buildSignupMathChallengeToken({
  a: 3,
  b: 7,
  issuedAt: Date.now() - 16 * 60 * 1000
});
let expiredRejected = false;
try {
  assertSignupMathChallengePassed(expiredToken, "10");
} catch (error) {
  expiredRejected = error?.code === "challenge_expired";
}
assert(expiredRejected, "rejects expired challenge token");

const tamperedToken = `${challenge.token.slice(0, -1)}x`;
let tamperedRejected = false;
try {
  assertSignupMathChallengePassed(tamperedToken, String(challenge.a + challenge.b));
} catch (error) {
  tamperedRejected = error?.code === "challenge_expired";
}
assert(tamperedRejected, "rejects tampered challenge token");

const secondInstance = issueSignupMathChallenge();
assert(secondInstance.token, "second challenge issues independently");

if (failed) process.exit(1);
console.log("signup protection tests ok");
