#!/usr/bin/env node
/**
 * Sprint 6 — Digital Trust Passport Integration tests.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { TRUST_SIGNAL_PRODUCERS, resolveSignalMapping } from "../server/services/passportIntegration/audit.js";
import { REPUTATION_DIMENSIONS } from "../server/services/passportIntegration/reputation.js";
import { TRUST_PLATFORM_EVENT_TYPES } from "../server/services/passportIntegration/eventBus.js";
import { getPassportIntegrationMetrics, incrementPassportIntegrationMetric } from "../server/services/passportIntegration/observability.js";
import { generatePassportId } from "../server/services/passportIntegration/memberRegistry.js";
import { isValidPassportId } from "../server/services/passportSignals/signalRegistry.js";
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

const migration = read("migrations/0063_passport_integration.sql");
assert(migration.includes("member_passport_registry"), "member passport registry");
assert(migration.includes("passport_reputation_profile"), "reputation profile");
assert(migration.includes("passport_sync_queue"), "sync queue");
assert(migration.includes("passport_integration_events"), "integration events");
assert(migration.includes("passport_consent_audit_log"), "consent audit");

const schema = read("server/services/schemaVerification.js");
for (const table of [
  "member_passport_registry",
  "passport_reputation_profile",
  "passport_reputation_input_log",
  "passport_sync_queue",
  "passport_integration_events",
  "passport_consent_audit_log"
]) {
  assert(schema.includes(`"${table}"`), `schema requires ${table}`);
}

assert(read("server/services/signupProvisioning.js").includes("handlePlatformTrustEvent"), "signup trust hook");
assert(read("server/services/finance/index.js").includes("handlePlatformTrustEvent"), "finance trust hook");
assert(read("server/services/messaging/index.js").includes("handlePlatformTrustEvent"), "messaging trust hook");
assert(read("server/memberSocial.js").includes("handlePlatformTrustEvent"), "matching trust hook");
assert(read("server/services/operations/userSafety.js").includes("handlePlatformTrustEvent"), "operations trust hook");
assert(read("server/services/memberPersistence.js").includes("handleReportSubmittedEvent"), "report ops hook preserved");

const appSource = read("server/app.js");
assert(appSource.includes("/api/passport/integration"), "passport integration route");

assert(TRUST_SIGNAL_PRODUCERS.length >= 8, "trust producers audited");
assert(resolveSignalMapping("authentication", "email_verified")?.signalType === "email_verified", "signal mapping");
assert(REPUTATION_DIMENSIONS.length === 9, "nine reputation dimensions");
assert(TRUST_PLATFORM_EVENT_TYPES.length === 7, "seven trust platform events");

const passportId = generatePassportId();
assert(isValidPassportId(passportId), "generated passport id valid");

incrementPassportIntegrationMetric("signalsQueued", 1);
assert(getPassportIntegrationMetrics().signalsQueued >= 1, "integration metrics");

assert(PRODUCTION_CERT_VERSION === "1.7.0", "certification version for Sprint 7");

assert(existsSync(join(rootPath, "scripts/certify-passport-journey.mjs")), "passport journey cert");

for (const doc of [
  "docs/architecture/TRUST_SIGNALS.md",
  "docs/architecture/PASSPORT_INTEGRATION.md",
  "docs/architecture/REPUTATION_PLATFORM.md",
  "docs/operations/PASSPORT_RUNBOOK.md"
]) {
  assert(existsSync(join(rootPath, doc)), `${doc} exists`);
}

const bridge = read("server/services/passportIntegration/bridge.js");
assert(bridge.includes("ingestTrustSignal"), "bridge uses passport ingestion");
assert(bridge.includes("setImmediate"), "async sync never blocks");

const registry = read("server/services/passportSignals/signalRegistry.js");
assert(registry.includes("email_verified"), "extended signal types");

if (failed) process.exit(1);
console.log("passport integration tests ok");
