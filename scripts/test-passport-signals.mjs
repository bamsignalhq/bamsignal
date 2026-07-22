#!/usr/bin/env node
/**
 * Passport Trust Signal — validation, idempotency, and ingestion unit tests.
 * Runs without database for core logic; DB paths fail closed when unavailable.
 */

import {
  validateSchema,
  validateContributor,
  validateCategory,
  validateVersion,
  validateExpiration,
  validateEvidence,
  validateReferences,
  validateSignature,
  validateConsentRef,
  runValidationPipeline
} from "../server/services/passportSignals/validation.js";
import {
  assertIdempotencyPresent,
  buildIdempotencyMetadata,
  detectDuplicate
} from "../server/services/passportSignals/idempotency.js";
import {
  PassportSignalAuthorizationError,
  isPassportSignalError
} from "../server/services/passportSignals/errors.js";
import { normalizePassportId } from "../server/services/passportSignals/signalRegistry.js";
import { parseIngestionRequest } from "../server/services/passportSignals/ingestion.js";
import { getPassportSignalMetrics } from "../server/services/passportSignals/observability.js";

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const contributor = {
  contributorId: "bamsignal",
  displayName: "BamSignal",
  trustDomain: "social",
  status: "active",
  verificationLevel: "verified",
  allowedSignalTypes: ["positive_interaction", "profile_verified"],
  allowedCategories: ["community", "verification"],
  capabilities: ["emit_signals"],
  versionCompatibility: "1.0"
};

const baseSubmission = {
  passportId: "SKL-4A7D-9XQ2",
  signalType: "positive_interaction",
  category: "community",
  occurredAt: new Date().toISOString(),
  consentRef: "contributor:bamsignal:signal_emission",
  explanation: "Positive community interaction recorded",
  evidence: {
    evidenceRef: "bamsignal:interaction:abc123",
    storageProduct: "bamsignal",
    retrievable: true
  },
  version: "1.0"
};

// Schema validation
const schema = validateSchema(baseSubmission);
assert(schema.passed, "valid schema passes");
assert(schema.passportId === "SKL-4A7D-9XQ2", "passport id normalized");

const badSchema = validateSchema({ ...baseSubmission, passportId: "INVALID" });
assert(!badSchema.passed, "invalid passport id fails schema");

// Contributor validation
assert(
  validateContributor(baseSubmission, contributor).passed,
  "authorized signal type passes contributor validation"
);
assert(
  !validateContributor({ ...baseSubmission, signalType: "bank_verified" }, contributor).passed,
  "unauthorized signal type fails"
);

// Category, version, expiration, evidence, references
assert(validateCategory(baseSubmission).passed, "category valid");
assert(validateVersion(baseSubmission, contributor).passed, "version compatible");
assert(validateExpiration(baseSubmission).passed, "expiration valid");
assert(validateEvidence(baseSubmission).passed, "evidence valid");
assert(validateReferences(baseSubmission).passed, "references valid");
assert(validateSignature().passed, "signature stub passes");

// Consent ref
const consent = await validateConsentRef(
  "contributor:bamsignal:signal_emission",
  "SKL-4A7D-9XQ2",
  "bamsignal"
);
assert(consent.passed, "internal contributor consent accepted");

const badConsent = await validateConsentRef(null, "SKL-4A7D-9XQ2", "bamsignal");
assert(!badConsent.passed, "missing consent fails");

// Full pipeline
const report = await runValidationPipeline(baseSubmission, contributor);
assert(report.passed, "validation pipeline passes for valid submission");

// Idempotency
const idempotency = buildIdempotencyMetadata({
  idempotencyKey: "idem_test_1",
  contributorEventId: "evt_1",
  correlationId: "corr_1"
});
assert(assertIdempotencyPresent(idempotency).ok, "idempotency metadata complete");
assert(!assertIdempotencyPresent({ idempotencyKey: "x" }).ok, "incomplete idempotency rejected");

let duplicateRejected = false;
try {
  await detectDuplicate("bamsignal", "idem_offline_test");
} catch (error) {
  duplicateRejected = true;
}
assert(duplicateRejected, "duplicate detection fails closed without database");

// Request parsing
const parsed = parseIngestionRequest({
  ...baseSubmission,
  idempotencyKey: "k1",
  contributorEventId: "e1",
  correlationId: "c1"
});
assert(parsed.submission.signalType === "positive_interaction", "parse ingestion submission");
assert(parsed.idempotency.idempotencyKey === "k1", "parse idempotency");

// Errors
const authError = new PassportSignalAuthorizationError();
assert(isPassportSignalError(authError), "authorization error typed");
assert(authError.status === 401, "auth error status 401");

// Registry
assert(normalizePassportId(" skl-4a7d-9xq2 ") === "SKL-4A7D-9XQ2", "normalize passport id");

// Metrics interface
const metrics = getPassportSignalMetrics();
assert(typeof metrics.ingestionTotal === "number", "metrics export available");

if (failed) process.exit(1);
console.log("passport signal tests ok");
