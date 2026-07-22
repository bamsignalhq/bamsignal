/**
 * Signal persistence — normalized evidence only.
 */

import crypto from "node:crypto";
import { query, isDatabaseReady } from "../../db.js";
import { PassportSignalDatabaseError } from "./errors.js";
import { getSignalTypeDefaults } from "./signalRegistry.js";

export function generateSignalId() {
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `sig_${Date.now()}_${suffix}`;
}

export function generateAuditRef(passportId, contributorId) {
  return `audit:passport_signal:${passportId}:${contributorId}:${Date.now()}`;
}

export function generateProvenanceId(signalId) {
  return `prov_${signalId}`;
}

export function normalizeSubmission(submission, contributor, auditRef) {
  const defaults = getSignalTypeDefaults(submission.signalType) || {};
  const humanReviewRequirement =
    submission.humanReviewRequirement || defaults.humanReview || "none";
  const requiresReview =
    humanReviewRequirement === "required" || humanReviewRequirement === "recommended";
  const lifecycleStatus = requiresReview ? "quarantined" : "accepted";

  return {
    passportId: String(submission.passportId).trim().toUpperCase(),
    contributorId: contributor.contributorId,
    category: submission.category || defaults.category,
    signalType: submission.signalType,
    occurredAt: submission.occurredAt,
    recordedAt: new Date().toISOString(),
    consentRef: submission.consentRef || null,
    auditRef,
    confidence: submission.confidence || {
      level: "pending",
      basis: "Initial ingestion",
      assessedAt: null,
      assessor: "contributor"
    },
    evidence: {
      evidenceRef: submission.evidence?.evidenceRef || null,
      evidenceType: submission.evidence?.evidenceType || null,
      checksum: submission.evidence?.checksum || null,
      storageProduct: submission.evidence?.storageProduct || contributor.contributorId,
      retrievable: Boolean(submission.evidence?.evidenceRef)
    },
    sourceProduct: submission.sourceProduct || contributor.contributorId,
    version: submission.version || "1.0",
    humanReviewRequirement,
    status: lifecycleStatus,
    explanation: String(submission.explanation || "").slice(0, 2000),
    expiration: submission.expiration || {
      expiresAt: null,
      policy: "permanent",
      rollingDays: null,
      label: "Permanent"
    },
    revocation: submission.revocation || null
  };
}

export async function persistValidationReport(report, signalRowId = null, signalId = null) {
  if (!isDatabaseReady()) throw new PassportSignalDatabaseError();
  const result = await query(
    `insert into passport_signal_validation_reports (
      signal_row_id, signal_id, contributor_id, passport_id, passed, results, validated_at
    ) values ($1, $2, $3, $4, $5, $6, $7)
    returning id`,
    [
      signalRowId,
      signalId,
      report.contributorId,
      report.passportId,
      report.passed,
      JSON.stringify(report.results),
      report.validatedAt
    ]
  );
  return result.rows[0]?.id || null;
}

export async function persistProvenance(normalized, signalId) {
  if (!isDatabaseReady()) throw new PassportSignalDatabaseError();
  const provenanceId = generateProvenanceId(signalId);
  const questions = {
    whoEmitted: normalized.contributorId,
    whenOccurred: normalized.occurredAt,
    whenRecorded: normalized.recordedAt,
    whyEmitted: normalized.explanation,
    consentBasis: normalized.consentRef,
    verifiable: normalized.evidence.retrievable,
    revoked: false,
    authoritative: normalized.status === "accepted"
  };

  const result = await query(
    `insert into passport_signal_provenance (
      provenance_id, signal_id, passport_id, contributor_id, source_product,
      emitted_at, recorded_at, consent_ref, audit_ref, explanation,
      evidence_verifiable, contributor_authoritative, revoked, questions
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,false,$13)
    returning id, provenance_id`,
    [
      provenanceId,
      signalId,
      normalized.passportId,
      normalized.contributorId,
      normalized.sourceProduct,
      normalized.occurredAt,
      normalized.recordedAt,
      normalized.consentRef,
      normalized.auditRef,
      normalized.explanation,
      normalized.evidence.retrievable,
      normalized.status === "accepted",
      JSON.stringify(questions)
    ]
  );

  return {
    provenanceId: result.rows[0].provenance_id,
    provenanceRowId: result.rows[0].id,
    questions
  };
}

export async function persistTrustSignal(
  normalized,
  idempotency,
  contributor,
  validationId,
  provenanceRowId,
  signalId = generateSignalId()
) {
  if (!isDatabaseReady()) throw new PassportSignalDatabaseError();

  const result = await query(
    `insert into passport_trust_signals (
      signal_id, passport_id, contributor_id, category, signal_type,
      occurred_at, recorded_at, consent_ref, audit_ref, confidence, evidence,
      source_product, version, human_review_requirement, status, explanation,
      expiration, revocation, idempotency_key, contributor_event_id, correlation_id,
      validation_id, provenance_id, contributor_metadata
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
    )
    returning id, signal_id`,
    [
      signalId,
      normalized.passportId,
      normalized.contributorId,
      normalized.category,
      normalized.signalType,
      normalized.occurredAt,
      normalized.recordedAt,
      normalized.consentRef,
      normalized.auditRef,
      JSON.stringify(normalized.confidence),
      JSON.stringify(normalized.evidence),
      normalized.sourceProduct,
      normalized.version,
      normalized.humanReviewRequirement,
      normalized.status,
      normalized.explanation,
      JSON.stringify(normalized.expiration),
      normalized.revocation ? JSON.stringify(normalized.revocation) : null,
      idempotency.idempotencyKey,
      idempotency.contributorEventId,
      idempotency.correlationId,
      validationId,
      provenanceRowId,
      JSON.stringify({
        contributorId: contributor.contributorId,
        trustDomain: contributor.trustDomain,
        verificationLevel: contributor.verificationLevel
      })
    ]
  );

  return {
    rowId: result.rows[0].id,
    signalId: result.rows[0].signal_id
  };
}

export async function getSignalById(signalId) {
  if (!isDatabaseReady()) return null;
  const result = await query(
    `select *
     from passport_trust_signals
     where signal_id = $1 and deleted_at is null
     limit 1`,
    [signalId]
  );
  return result.rows[0] || null;
}

export async function listSignalsForPassport(passportId, { limit = 50, offset = 0 } = {}) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select *
     from passport_trust_signals
     where passport_id = $1 and deleted_at is null
     order by recorded_at desc
     limit $2 offset $3`,
    [passportId, limit, offset]
  );
  return result.rows;
}

export async function listSignalsForAdmin({
  status = null,
  contributorId = null,
  passportId = null,
  limit = 50,
  offset = 0
} = {}) {
  if (!isDatabaseReady()) return [];
  const params = [];
  const conditions = ["deleted_at is null"];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (contributorId) {
    params.push(contributorId);
    conditions.push(`contributor_id = $${params.length}`);
  }
  if (passportId) {
    params.push(String(passportId).trim().toUpperCase());
    conditions.push(`passport_id = $${params.length}`);
  }

  params.push(limit, offset);
  const result = await query(
    `select *
     from passport_trust_signals
     where ${conditions.join(" and ")}
     order by recorded_at desc
     limit $${params.length - 1} offset $${params.length}`,
    params
  );
  return result.rows;
}

export function mapRowToValidatedSignal(row, provenanceId) {
  return {
    signalId: row.signal_id,
    passportId: row.passport_id,
    contributorId: row.contributor_id,
    category: row.category,
    signalType: row.signal_type,
    occurredAt: row.occurred_at,
    recordedAt: row.recorded_at,
    consentRef: row.consent_ref,
    auditRef: row.audit_ref,
    confidence: row.confidence,
    evidence: row.evidence,
    sourceProduct: row.source_product,
    version: row.version,
    humanReviewRequirement: row.human_review_requirement,
    status: row.status,
    explanation: row.explanation,
    expiration: row.expiration,
    revocation: row.revocation,
    validationRef: row.validation_id,
    provenanceRef: provenanceId || row.provenance_id,
    idempotencyKey: row.idempotency_key,
    derived: false
  };
}
