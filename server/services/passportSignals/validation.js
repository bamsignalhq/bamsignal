/**
 * Signal validation implementation — structured reports, no opaque errors.
 */

import {
  getSignalTypeDefaults,
  isKnownSignalCategory,
  isValidPassportId,
  normalizePassportId
} from "./signalRegistry.js";
import { contributorAllowsSignalType } from "./contributorAuth.js";

function result(kind, passed, message) {
  return { kind, passed, message, checkedAt: new Date().toISOString() };
}

function sanitizeString(value, max = 500) {
  return String(value || "")
    .trim()
    .slice(0, max);
}

export function validateSchema(submission) {
  const results = [];
  const passportId = normalizePassportId(submission.passportId);
  if (!passportId) {
    results.push(result("schema", false, "Invalid passport ID format"));
  } else {
    results.push(result("schema", true, "Passport ID format valid"));
  }

  if (!submission.signalType) {
    results.push(result("schema", false, "signalType is required"));
  } else {
    results.push(result("schema", true, "signalType present"));
  }

  if (!submission.occurredAt || Number.isNaN(Date.parse(submission.occurredAt))) {
    results.push(result("schema", false, "occurredAt must be a valid ISO timestamp"));
  } else {
    results.push(result("schema", true, "occurredAt valid"));
  }

  if (!submission.explanation) {
    results.push(result("schema", false, "explanation is required"));
  } else {
    results.push(result("schema", true, "explanation present"));
  }

  return { results, passportId, passed: results.every((r) => r.passed) };
}

export function validateContributor(submission, contributor) {
  if (!contributorAllowsSignalType(contributor, submission.signalType)) {
    return result("contributor", false, `Contributor not authorized for signal type: ${submission.signalType}`);
  }
  if (submission.contributorId && submission.contributorId !== contributor.contributorId) {
    return result("contributor", false, "Submission contributorId mismatch");
  }
  return result("contributor", true, "Contributor authorized for signal type");
}

export function validateCategory(submission) {
  const defaults = getSignalTypeDefaults(submission.signalType);
  const category = submission.category || defaults?.category;
  if (!category || !isKnownSignalCategory(category)) {
    return result("schema", false, "Unknown or missing signal category");
  }
  if (defaults && category !== defaults.category) {
    return result("schema", false, "Category does not match registered signal type");
  }
  return result("schema", true, "Category valid");
}

export function validateVersion(submission, contributor) {
  const version = sanitizeString(submission.version || "1.0", 32);
  const compatible = sanitizeString(contributor.versionCompatibility || "1.0", 32);
  if (version.split(".")[0] !== compatible.split(".")[0]) {
    return result("version", false, "Signal version incompatible with contributor contract");
  }
  return result("version", true, "Version compatible");
}

export function validateExpiration(submission) {
  const expiration = submission.expiration || { policy: "permanent", label: "Permanent" };
  if (!expiration.policy) {
    return result("expiration", false, "Expiration policy required");
  }
  if (expiration.expiresAt && Number.isNaN(Date.parse(expiration.expiresAt))) {
    return result("expiration", false, "expiresAt must be valid ISO timestamp when provided");
  }
  return result("expiration", true, "Expiration policy valid");
}

export function validateEvidence(submission) {
  const evidence = submission.evidence || {};
  if (evidence.evidenceRef && typeof evidence.evidenceRef !== "string") {
    return result("evidence", false, "evidenceRef must be a string reference");
  }
  if (!evidence.storageProduct) {
    return result("evidence", false, "evidence.storageProduct is required");
  }
  return result("evidence", true, "Evidence metadata valid");
}

export function validateReferences(submission) {
  if (submission.auditRef && typeof submission.auditRef !== "string") {
    return result("reference", false, "auditRef must be a string when provided");
  }
  return result("reference", true, "References well-formed");
}

/** Signature validation stub — cryptographic signing deferred. */
export function validateSignature() {
  return result("signature", true, "Signature validation deferred (stub accepted)");
}

export async function validateConsentSubmission(submission) {
  return validateConsentRef(submission.consentRef, submission.passportId, submission.contributorId);
}

export async function validateConsentRef(consentRef, passportId, contributorId, queryFn) {
  if (!consentRef) {
    return result("consent", false, "consentRef is required");
  }

  const ref = sanitizeString(consentRef, 128);
  const internalPattern = /^contributor:[a-z0-9_]+:signal_emission$/;
  if (internalPattern.test(ref)) {
    const expected = `contributor:${contributorId}:signal_emission`;
    if (ref !== expected) {
      return result("consent", false, "Internal contributor consent ref mismatch");
    }
    return result("consent", true, "Contributor emission consent accepted");
  }

  if (!queryFn) {
    return result("consent", true, "Consent ref format accepted (database lookup skipped)");
  }

  const lookup = await queryFn(ref, passportId, contributorId);
  if (!lookup) {
    return result("consent", false, "Consent not found or not applicable");
  }
  if (lookup.status !== "active") {
    return result("consent", false, `Consent is ${lookup.status}`);
  }
  if (lookup.expires_at && new Date(lookup.expires_at) < new Date()) {
    return result("consent", false, "Consent expired");
  }
  return result("consent", true, "Active consent verified");
}

export async function runValidationPipeline(submission, contributor, { queryConsent } = {}) {
  const schema = validateSchema(submission);
  const results = [...schema.results];
  if (!schema.passed) {
    return {
      signalType: submission.signalType,
      contributorId: contributor.contributorId,
      passportId: schema.passportId,
      passed: false,
      results,
      validatedAt: new Date().toISOString()
    };
  }
  results.push(validateContributor(submission, contributor));
  results.push(validateCategory(submission));
  results.push(validateVersion(submission, contributor));
  results.push(validateExpiration(submission));
  results.push(validateEvidence(submission));
  results.push(validateReferences(submission));
  results.push(validateSignature());
  results.push(
    await validateConsentRef(
      submission.consentRef,
      schema.passportId || submission.passportId,
      contributor.contributorId,
      queryConsent
    )
  );

  const passed = results.every((r) => r.passed);
  return {
    signalType: submission.signalType,
    contributorId: contributor.contributorId,
    passportId: schema.passportId || normalizePassportId(submission.passportId),
    passed,
    results,
    validatedAt: new Date().toISOString()
  };
}

export { isValidPassportId, normalizePassportId };
