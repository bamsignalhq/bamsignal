/**
 * Signal ingestion service — 9-stage pipeline implementation.
 */

import { runValidationPipeline } from "./validation.js";
import { checkConsentGate } from "./consentGate.js";
import {
  assertIdempotencyPresent,
  buildIdempotencyMetadata,
  detectDuplicate
} from "./idempotency.js";
import {
  generateAuditRef,
  generateSignalId,
  normalizeSubmission,
  persistProvenance,
  persistTrustSignal,
  persistValidationReport,
  mapRowToValidatedSignal,
  getSignalById
} from "./persistence.js";
import { publishSignalEvent } from "./eventBus.js";
import {
  createIngestionTimer,
  logIngestionCompleted,
  logIngestionFailed,
  recordValidationLatency
} from "./observability.js";
import { PassportSignalError } from "./errors.js";
import {
  appendSignalHistory,
  enqueueSignalReview,
  ensureRetentionRecord,
  monitorIngestionReplay,
  detectDuplicateBurst,
  updateContributorHealthCounters
} from "./governance/index.js";

function fail(stage, reason, stagesCompleted) {
  return { ok: false, failedStage: stage, reason, stagesCompleted };
}

export async function ingestTrustSignal({ submission, idempotency, contributor }) {
  const timer = createIngestionTimer();
  const stagesCompleted = [];

  // 1. Receive
  const idempotencyCheck = assertIdempotencyPresent(idempotency);
  if (!idempotencyCheck.ok) {
    logIngestionFailed({
      contributorId: contributor.contributorId,
      stage: "receive",
      reason: idempotencyCheck.reason,
      elapsedMs: timer.elapsedMs()
    });
    return fail("receive", idempotencyCheck.reason, stagesCompleted);
  }
  stagesCompleted.push("receive");

  // 2. Validate
  const validationStarted = timer.elapsedMs();
  const validation = await runValidationPipeline(
    { ...submission, contributorId: contributor.contributorId },
    contributor
  );
  recordValidationLatency(timer.elapsedMs() - validationStarted);
  if (!validation.passed) {
    const reason =
      validation.results.find((r) => !r.passed)?.message || "Validation failed";
    logIngestionFailed({
      contributorId: contributor.contributorId,
      stage: "validate",
      reason,
      elapsedMs: timer.elapsedMs()
    });
    return fail("validate", reason, stagesCompleted);
  }
  stagesCompleted.push("validate");

  // 3. Consent Check
  const consent = await checkConsentGate(
    { ...submission, passportId: validation.passportId },
    contributor
  );
  if (!consent.allowed) {
    logIngestionFailed({
      contributorId: contributor.contributorId,
      stage: "consent_check",
      reason: consent.failureReason || "Consent gate rejected",
      elapsedMs: timer.elapsedMs()
    });
    return fail("consent_check", consent.failureReason || "Consent gate rejected", stagesCompleted);
  }
  stagesCompleted.push("consent_check");

  // 4. Normalize + 5. Audit Reference
  const auditRef = submission.auditRef || generateAuditRef(validation.passportId, contributor.contributorId);
  const normalized = normalizeSubmission(
    { ...submission, passportId: validation.passportId, consentRef: submission.consentRef || consent.consentRef },
    contributor,
    auditRef
  );
  stagesCompleted.push("normalize", "audit_reference");

  // 6. Deduplicate
  const duplicate = await detectDuplicate(contributor.contributorId, idempotency.idempotencyKey);
  if (duplicate.isDuplicate && duplicate.existingSignalId) {
    const existing = await getSignalById(duplicate.existingSignalId);
    if (existing) {
      stagesCompleted.push("deduplicate", "persist", "publish_event", "future_trust_engine");
      logIngestionCompleted({
        contributorId: contributor.contributorId,
        signalId: existing.signal_id,
        passportId: existing.passport_id,
        elapsedMs: timer.elapsedMs(),
        duplicate: true
      });
      return {
        ok: true,
        duplicate: true,
        signal: mapRowToValidatedSignal(existing, existing.provenance_id),
        validation,
        consent,
        provenance: null,
        event: null,
        stagesCompleted
      };
    }
  }
  stagesCompleted.push("deduplicate");

  // 7. Persist
  let validationId;
  let provenanceRecord = null;
  let signalId;

  try {
    signalId = generateSignalId();
    validationId = await persistValidationReport(validation);
    provenanceRecord = await persistProvenance(normalized, signalId);

    await persistTrustSignal(
      normalized,
      idempotency,
      contributor,
      validationId,
      provenanceRecord.provenanceRowId,
      signalId
    );

    await persistValidationReport(validation, null, signalId);

    await appendSignalHistory({
      signalId,
      passportId: normalized.passportId,
      kind: "created",
      headline: "Signal received",
      summary: normalized.explanation,
      actor: contributor.contributorId,
      metadata: { signalType: normalized.signalType, category: normalized.category }
    });
    await appendSignalHistory({
      signalId,
      passportId: normalized.passportId,
      kind: "validation",
      headline: "Validation passed",
      summary: "Signal passed ingestion validation pipeline",
      actor: "system",
      metadata: { passed: true }
    });
    await appendSignalHistory({
      signalId,
      passportId: normalized.passportId,
      kind: "lifecycle_change",
      headline: `Status: validated → ${normalized.status}`,
      summary: normalized.status === "quarantined" ? "Queued for human review" : "Accepted",
      actor: "system",
      metadata: { status: normalized.status }
    });

    await updateContributorHealthCounters(contributor.contributorId, {
      signalsSubmitted: 1,
      signalsAccepted: normalized.status === "accepted" ? 1 : 0
    });
    await ensureRetentionRecord(signalId, {
      retentionClass: "active",
      policyLabel: "default"
    });

    if (normalized.status === "quarantined") {
      await enqueueSignalReview({
        signalId,
        passportId: normalized.passportId,
        contributorId: contributor.contributorId,
        reason: "Human review required at ingestion",
        priority: normalized.humanReviewRequirement === "required" ? "high" : "normal"
      });
    }

    await monitorIngestionReplay({
      contributorId: contributor.contributorId,
      idempotencyKey: idempotency.idempotencyKey,
      isDuplicate: false,
      occurredAt: normalized.occurredAt,
      passportId: normalized.passportId,
      signalId
    });
    await detectDuplicateBurst(contributor.contributorId);
  } catch (error) {
    logIngestionFailed({
      contributorId: contributor.contributorId,
      stage: "persist",
      reason: error instanceof Error ? error.message : "Persistence failed",
      elapsedMs: timer.elapsedMs()
    });
    return fail("persist", "Signal persistence failed", stagesCompleted);
  }
  stagesCompleted.push("persist");

  const validatedSignal = mapRowToValidatedSignal(
    {
      ...normalized,
      signal_id: signalId,
      validation_id: validationId,
      provenance_id: provenanceRecord.provenanceId,
      idempotency_key: idempotency.idempotencyKey
    },
    provenanceRecord.provenanceId
  );

  // 8. Publish Internal Event
  let event = null;
  try {
    const published = await publishSignalEvent({
      eventType: "signal_created",
      passportId: normalized.passportId,
      signalId,
      contributorId: contributor.contributorId,
      correlationId: idempotency.correlationId,
      auditRef,
      payload: {
        signalId,
        signalType: normalized.signalType,
        category: normalized.category
      }
    });
    event = published.event;
  } catch {
    /* event publish failure is non-fatal for ingestion response */
  }
  stagesCompleted.push("publish_event");

  // 9. Future Trust Engine — contract marker only
  stagesCompleted.push("future_trust_engine");

  logIngestionCompleted({
    contributorId: contributor.contributorId,
    signalId,
    passportId: normalized.passportId,
    elapsedMs: timer.elapsedMs(),
    duplicate: false,
    status: normalized.status
  });

  return {
    ok: true,
    duplicate: false,
    signal: validatedSignal,
    validation,
    consent,
    provenance: {
      provenanceId: provenanceRecord.provenanceId,
      questions: provenanceRecord.questions
    },
    event,
    stagesCompleted
  };
}

export function parseIngestionRequest(body = {}) {
  const idempotency = buildIdempotencyMetadata(body);
  const submission = {
    passportId: body.passportId,
    contributorId: body.contributorId,
    category: body.category,
    signalType: body.signalType,
    occurredAt: body.occurredAt || new Date().toISOString(),
    consentRef: body.consentRef,
    auditRef: body.auditRef,
    confidence: body.confidence,
    evidence: body.evidence,
    sourceProduct: body.sourceProduct,
    version: body.version || "1.0",
    humanReviewRequirement: body.humanReviewRequirement,
    status: body.status,
    explanation: body.explanation,
    expiration: body.expiration,
    revocation: body.revocation
  };
  return { submission, idempotency };
}

export function ingestionErrorResponse(error) {
  if (error instanceof PassportSignalError) {
    return {
      ok: false,
      error: error.code,
      message: error.message,
      stage: error.stage,
      details: error.details
    };
  }
  return { ok: false, error: "signal_error", message: "Unable to ingest signal" };
}
