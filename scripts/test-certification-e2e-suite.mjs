#!/usr/bin/env node
/**
 * Static verification for Production E2E Certification™ suite structure.
 */
import { readFileSync, existsSync } from "node:fs";
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

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const requiredFiles = [
  "certification/e2e/run.mjs",
  "certification/e2e/config.mjs",
  "certification/e2e/lib/report.mjs",
  "certification/e2e/lib/browser.mjs",
  "certification/e2e/lib/cert-api.mjs",
  "certification/e2e/lib/paystack-cert.mjs",
  "certification/e2e/lib/member.mjs",
  "certification/e2e/lib/validators.mjs",
  "certification/e2e/scenarios/01-signup-onboarding.mjs",
  "certification/e2e/scenarios/02-discover-save.mjs",
  "certification/e2e/scenarios/03-signals.mjs",
  "certification/e2e/scenarios/04-chat.mjs",
  "certification/e2e/scenarios/05-premium.mjs",
  "certification/e2e/scenarios/06-trusted-member.mjs",
  "certification/e2e/scenarios/07-concierge.mjs",
  "certification/e2e/scenarios/08-report.mjs",
  "certification/e2e/scenarios/09-session-restore.mjs",
  "api/diagnostics/certification.js",
  "server/services/certificationE2e.js"
];

for (const file of requiredFiles) {
  assert(existsSync(join(rootPath, file)), `missing ${file}`);
}

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts["certify:e2e"], "certify:e2e script registered");

const appSource = read("server/app.js");
assert(appSource.includes("/api/diagnostics/certification"), "certification diagnostics route mounted");

const signupOtpSource = read("server/services/signupOtp.js");
assert(signupOtpSource.includes("storeCertificationOtpPeek"), "signupOtp stores certification OTP peek");

const certService = read("server/services/certificationE2e.js");
assert(certService.includes("Production E2E Certification"), "certification service brand");
assert(certService.includes("QUERY_ALLOWLIST"), "read-only query allowlist");
assert(!certService.includes("createCertificationConciergeJourney"), "no fabricated concierge journeys");
assert(!certService.includes("seedCertificationMemberProfile"), "no fabricated profile seeding");

const certApiSource = read("api/diagnostics/certification.js");
assert(certApiSource.includes("read-peek-cleanup"), "diagnostics scope is read/peek/cleanup only");
assert(!certApiSource.includes("create-concierge-journey"), "no concierge fabrication endpoint");
assert(!certApiSource.includes("simulate-premium-webhook"), "webhook sim stays in cert runner");

const paystackCertSource = read("certification/e2e/lib/paystack-cert.mjs");
assert(paystackCertSource.includes("/api/paystack/webhook"), "webhook cert uses existing handler");

const runner = read("certification/e2e/run.mjs");
assert(runner.includes("Production End-to-End Certification"), "runner brand");
assert(runner.includes("./scenarios/09-session-restore.mjs"), "runner imports scenario 09");

if (failed > 0) {
  console.error(`\n${failed} certification e2e structure test(s) failed.`);
  process.exit(1);
}

console.log("certification e2e structure tests ok");
