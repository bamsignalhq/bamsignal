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

const paymentFortressSource = readProjectFile("server/services/paymentFortress.js");
const boostIntegritySource = readProjectFile("server/services/boostIntegrity.js");
const memberBoostsSource = readProjectFile("server/services/memberBoosts.js");
const verifySource = readProjectFile("api/paystack/verify.js");
const migrationSource = readProjectFile("migrations/0039_boost_activation_integrity.sql");
const repairScriptSource = readProjectFile("scripts/repair-boost-entitlements.mjs");
const appSource = readFileSync(join(rootPath, "src/App.tsx"), "utf8");
const paymentReturnStatusSource = readProjectFile("src/utils/paymentReturnStatus.ts");

assert(
  boostIntegritySource.includes("evaluateBoostActivationIntegrity") &&
    boostIntegritySource.includes("fulfillBoostWithIntegrity") &&
    boostIntegritySource.includes("await client.query(\"begin\")") &&
    boostIntegritySource.includes("status = 'fulfilled'") &&
    boostIntegritySource.includes("entitlement_id"),
  "boost integrity service must evaluate gates and commit fulfillment + entitlement atomically"
);

assert(
  memberBoostsSource.includes("getBoostEntitlementByReference") &&
    memberBoostsSource.includes("on conflict (paystack_reference)") &&
    memberBoostsSource.includes("requireRow") &&
    memberBoostsSource.includes("BoostActivationError"),
  "member boosts must expose idempotent entitlement lookup and fail loudly on missing rows"
);

assert(
  paymentFortressSource.includes("resolveIdempotentFulfillment") &&
    paymentFortressSource.includes("evaluateBoostActivationIntegrity") &&
    paymentFortressSource.includes("missing_entitlement") &&
    paymentFortressSource.includes("fulfillBoostWithIntegrity") &&
    paymentFortressSource.includes("fulfillmentCommitted"),
  "payment fortress must verify entitlement on idempotent retries and use transactional shop boost fulfillment"
);

assert(
  verifySource.includes("entitlementId") &&
    verifySource.includes("boostActive") &&
    verifySource.includes("verificationSource"),
  "verify response must expose entitlement evidence for payment return"
);

assert(
  migrationSource.includes("boost_activation_repairs") &&
    migrationSource.includes("entitlement_id") &&
    migrationSource.includes("boost_entitlement_server_all"),
  "migration 0039 must add repair audit trail, entitlement_id link, and server RLS policy"
);

assert(
  repairScriptSource.includes("--dry-run") &&
    repairScriptSource.includes("repairBoostEntitlementForReference") &&
    repairScriptSource.includes("repairAllMissingBoostEntitlements"),
  "repair command must support dry-run and batch/idempotent repair"
);

assert(
  appSource.includes("refreshMemberBoostEntitlements") &&
    appSource.includes("applyServerBoostEntitlement"),
  "payment return must hydrate boosts from server entitlement, not optimistic local activation"
);

assert(
  paymentReturnStatusSource.includes("boostActive") || paymentReturnStatusSource.includes("entitlementId"),
  "payment return status must interpret server entitlement fields"
);

assert(
  readProjectFile("server/app.js").includes("/api/admin/boost-integrity") ||
    readProjectFile("api/admin/boost-integrity.js").includes("getBoostIntegrityDashboard"),
  "admin boost integrity endpoint must exist"
);

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: boost activation integrity static checks");
