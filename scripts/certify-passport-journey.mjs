#!/usr/bin/env node
/**
 * Sprint 6 — Passport trust certification journey.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { runPassportCertificationJourney } from "../server/services/passportIntegration/index.js";
import { TRUST_PLATFORM_EVENT_TYPES } from "../server/services/passportIntegration/eventBus.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;
const journeySteps = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
  return Boolean(condition);
}

function step(name, ok) {
  journeySteps.push({ step: name, status: ok ? "PASS" : "FAIL" });
}

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

step("Signup hook", assert(read("server/services/signupProvisioning.js").includes("handlePlatformTrustEvent"), "signup"));
step("Email verification", assert(read("server/services/auth/lifecycle.js").includes("email_verified"), "email verified"));
step("Profile completion", assert(read("server/services/auth/lifecycle.js").includes("profile_completed"), "profile"));
step("Premium purchase", assert(read("server/services/membershipCommerce.js").includes("subscription_activated"), "premium"));
step("Trust signal pipeline", assert(read("server/services/passportIntegration/bridge.js").includes("ingestTrustSignal"), "ingestion"));
step("Match hook", assert(read("server/memberSocial.js").includes("signal_accepted"), "match"));
step("Message hook", assert(read("server/services/messaging/index.js").includes("message_sent"), "message"));
step("Moderation hook", assert(read("server/services/operations/index.js").includes("report_submitted"), "moderation"));
step("Passport API", assert(read("server/services/passportIntegration/apiContract.js").includes("buildPassportApiDashboard"), "api"));
step("Reputation profile", assert(read("server/services/passportIntegration/reputation.js").includes("appendReputationInput"), "reputation"));

assert(TRUST_PLATFORM_EVENT_TYPES.includes("passport.updated"), "passport.updated event");
assert(existsSync(join(rootPath, "launch-readiness.json")), "launch readiness");

const journey = await runPassportCertificationJourney({
  memberId: "00000000-0000-0000-0000-000000000088"
});

step("Journey orchestrator", assert(journey.steps.length >= 8, "journey steps"));
step("Certification PASS", assert(journey.passed || journey.steps.every((s) => s.ok), "journey pass"));

console.log("");
console.log("Passport Trust Certification Journey");
console.log("====================================");
for (const s of journeySteps) {
  console.log(`${s.status === "PASS" ? "✓" : "✕"} ${s.step}`);
}
for (const s of journey.steps) {
  console.log(`${s.ok ? "✓" : "✕"} ${s.step}`);
}
console.log("");
console.log(journey.passed ? "Journey: PASS" : "Journey: FAIL");

if (failed) process.exit(1);
