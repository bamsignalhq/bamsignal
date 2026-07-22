import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { ensureContributorEmissionConsent } from "../passportSignals/consentGate.js";
import { ingestTrustSignal } from "../passportSignals/ingestion.js";
import { getSignalTypeDefaults } from "../passportSignals/signalRegistry.js";
import { ensurePassportForMember } from "./memberRegistry.js";
import { appendReputationInput } from "./reputation.js";
import { publishTrustPlatformEvent } from "./eventBus.js";
import { resolveSignalMapping } from "./audit.js";
import {
  incrementPassportIntegrationMetric,
  recordSyncLatency
} from "./observability.js";

const QUEUE_TABLE = "passport_sync_queue";
const CONSENT_AUDIT_TABLE = "passport_consent_audit_log";

const INTERNAL_CONTRIBUTOR = Object.freeze({
  contributorId: "bamsignal",
  displayName: "BamSignal",
  trustDomain: "social",
  status: "active",
  verificationLevel: "verified",
  allowedSignalTypes: [
    "profile_verified", "identity_verified", "positive_interaction", "successful_match",
    "community_participation", "policy_violation", "appeal_approved", "email_verified",
    "profile_completed", "premium_active", "payment_successful", "payment_refund",
    "conversation_started", "message_delivered", "message_read", "member_reported",
    "moderation_action", "concierge_engaged", "support_resolved", "verification_completed"
  ],
  allowedCategories: ["identity", "verification", "community", "compliance", "financial", "security"],
  capabilities: ["emit_signals", "attach_evidence_refs"],
  versionCompatibility: "1.0"
});

async function ensureQueue() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(QUEUE_TABLE);
    return true;
  } catch {
    return false;
  }
}

async function auditConsentDecision(input = {}) {
  if (!isDatabaseReady()) return;
  try {
    await assertSchemaTable(CONSENT_AUDIT_TABLE);
    await query(
      `insert into passport_consent_audit_log (
         audit_id, passport_id, contributor_id, consent_ref, decision, reason, actor, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
       on conflict (audit_id) do nothing`,
      [
        String(input.auditId || crypto.randomUUID()),
        input.passportId,
        input.contributorId || "bamsignal",
        input.consentRef || null,
        input.decision || "checked",
        String(input.reason || "").slice(0, 500),
        input.actor || "system",
        JSON.stringify(input.metadata || {})
      ]
    );
  } catch {
    /* non-fatal */
  }
}

export async function queuePlatformTrustSignal(input = {}) {
  const sourceSystem = String(input.sourceSystem || "").trim();
  const eventType = String(input.eventType || "").trim();
  const mapping = resolveSignalMapping(sourceSystem, eventType);
  if (!mapping) return { ok: false, error: "unmapped_event" };

  if (!(await ensureQueue())) {
    setImmediate(() => {
      void processPlatformTrustSignalDirect({ ...input, mapping }).catch(() => {});
    });
    return { ok: true, queued: false, async: true };
  }

  const queueId = String(input.queueId || `psq_${crypto.randomUUID()}`);
  const idempotencyKey = String(
    input.idempotencyKey || `trust:${sourceSystem}:${eventType}:${input.memberId || input.passportId}:${input.correlationId || queueId}`
  );

  await query(
    `insert into passport_sync_queue (
       queue_id, member_id, passport_id, source_system, signal_type, signal_category,
       idempotency_key, correlation_id, actor, payload
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
     on conflict (idempotency_key) do nothing`,
    [
      queueId,
      input.memberId || null,
      input.passportId ? String(input.passportId).toUpperCase() : null,
      sourceSystem,
      mapping.signalType,
      mapping.category,
      idempotencyKey,
      input.correlationId || null,
      input.actor || "system",
      JSON.stringify({ ...input.payload, eventType, dimension: mapping.dimension })
    ]
  );

  incrementPassportIntegrationMetric("signalsQueued", 1);
  incrementPassportIntegrationMetric(`source_${sourceSystem}`, 1);

  setImmediate(() => {
    void processQueuedTrustSignal(queueId).catch((error) => {
      console.warn("[passportIntegration] async sync failed:", error?.message || error);
    });
  });

  return { ok: true, queued: true, queueId, idempotencyKey };
}

export async function processQueuedTrustSignal(queueId) {
  if (!(await ensureQueue())) return { ok: false, skipped: true };

  const started = Date.now();
  const { rows } = await query(
    "select * from passport_sync_queue where queue_id = $1 and status = 'queued' limit 1",
    [queueId]
  );
  const row = rows[0];
  if (!row) return { ok: false, error: "not_found" };

  await query(
    "update passport_sync_queue set status = 'processing', attempts = attempts + 1, updated_at = now() where queue_id = $1",
    [queueId]
  );

  const result = await processPlatformTrustSignalDirect({
    memberId: row.member_id,
    passportId: row.passport_id,
    sourceSystem: row.source_system,
    eventType: row.payload?.eventType || row.source_system,
    correlationId: row.correlation_id,
    actor: row.actor,
    payload: row.payload,
    mapping: resolveSignalMapping(row.source_system, row.payload?.eventType) || {
      signalType: row.signal_type,
      category: row.signal_category,
      dimension: row.payload?.dimension || "community"
    },
    idempotencyKey: row.idempotency_key
  });

  recordSyncLatency(Date.now() - started);
  incrementPassportIntegrationMetric("signalsProcessed", 1);

  await query(
    `update passport_sync_queue
     set status = $2, processed_at = now(), updated_at = now(), error_message = $3
     where queue_id = $1`,
    [queueId, result.ok ? "completed" : "failed", result.error || null]
  );

  return result;
}

export async function processPlatformTrustSignalDirect(input = {}) {
  const mapping = input.mapping || resolveSignalMapping(input.sourceSystem, input.eventType);
  if (!mapping) return { ok: false, error: "unmapped_event" };

  let passportId = input.passportId ? String(input.passportId).toUpperCase() : null;
  if (!passportId && input.memberId) {
    const passport = await ensurePassportForMember({
      memberId: input.memberId,
      userKey: input.userKey,
      correlationId: input.correlationId
    });
    if (!passport.ok && !passport.skipped) return passport;
    passportId = passport.passportId || null;
  }
  if (!passportId) return { ok: false, skipped: true, error: "no_passport" };

  const consentRef = await ensureContributorEmissionConsent(passportId, "bamsignal");
  await auditConsentDecision({
    passportId,
    contributorId: "bamsignal",
    consentRef,
    decision: consentRef ? "granted" : "denied",
    reason: "Platform trust signal emission",
    actor: input.actor || "system"
  });

  if (!consentRef) {
    incrementPassportIntegrationMetric("consentFailures", 1);
    return { ok: false, error: "consent_denied" };
  }
  incrementPassportIntegrationMetric("consentChecks", 1);

  const defaults = getSignalTypeDefaults(mapping.signalType) || {};
  const signalType = mapping.signalType;
  const category = mapping.category || defaults.category || "community";
  const correlationId = input.correlationId || crypto.randomUUID();
  const idempotencyKey =
    input.idempotencyKey || `trust:${input.sourceSystem}:${input.eventType}:${passportId}:${correlationId}`;

  const evidenceRef =
    input.payload?.evidenceRef ||
    `${input.sourceSystem}:${input.eventType}:${input.memberId || passportId}:${correlationId}`;

  const submission = {
    passportId,
    signalType,
    category,
    occurredAt: input.occurredAt || new Date().toISOString(),
    consentRef,
    explanation: input.explanation || `${input.sourceSystem} ${input.eventType} trust signal`,
    evidence: {
      evidenceRef,
      evidenceType: input.sourceSystem,
      storageProduct: "bamsignal",
      retrievable: true
    },
    version: "1.0",
    confidence: {
      level: input.confidenceLevel || "high",
      basis: `Platform event: ${input.sourceSystem}.${input.eventType}`,
      assessedAt: new Date().toISOString(),
      assessor: "platform_bridge"
    }
  };

  let ingestResult = { ok: false, skipped: true };
  try {
    ingestResult = await ingestTrustSignal({
      submission,
      idempotency: {
        idempotencyKey,
        contributorEventId: `${input.sourceSystem}:${input.eventType}`,
        correlationId
      },
      contributor: INTERNAL_CONTRIBUTOR
    });
  } catch (error) {
    incrementPassportIntegrationMetric("ingestionFailures", 1);
    incrementPassportIntegrationMetric("syncFailures", 1);
    return { ok: false, error: error?.message || "ingestion_failed" };
  }

  if (!ingestResult.ok && !ingestResult.duplicate) {
    incrementPassportIntegrationMetric("signalsRejected", 1);
    incrementPassportIntegrationMetric("syncFailures", 1);
    await publishTrustPlatformEvent({
      eventType: "trust.signal.rejected",
      passportId,
      correlationId,
      payload: { sourceSystem: input.sourceSystem, eventType: input.eventType, reason: ingestResult.reason }
    });
    return { ok: false, error: ingestResult.reason || "ingestion_rejected" };
  }

  const signalId = ingestResult.signal?.signalId || null;
  const accepted = ingestResult.signal?.status === "accepted" || ingestResult.duplicate;

  if (accepted) {
    incrementPassportIntegrationMetric("signalsAccepted", 1);
    await publishTrustPlatformEvent({
      eventType: "trust.signal.accepted",
      passportId,
      signalId,
      correlationId,
      payload: { signalType, sourceSystem: input.sourceSystem }
    });
  }

  await publishTrustPlatformEvent({
    eventType: "trust.signal.created",
    passportId,
    signalId,
    correlationId,
    payload: { signalType, sourceSystem: input.sourceSystem, eventType: input.eventType }
  });

  if (signalType === "identity_verified" || signalType === "verification_completed") {
    await publishTrustPlatformEvent({
      eventType: "verification.completed",
      passportId,
      signalId,
      correlationId,
      payload: { sourceSystem: input.sourceSystem }
    });
  }
  if (signalType === "email_verified" || signalType === "profile_completed" || signalType === "identity_verified") {
    await publishTrustPlatformEvent({
      eventType: "identity.updated",
      passportId,
      signalId,
      correlationId,
      payload: { signalType }
    });
  }

  await appendReputationInput({
    passportId,
    dimension: mapping.dimension,
    sourceSystem: input.sourceSystem,
    signalType,
    signalId,
    evidenceRef,
    correlationId,
    actor: input.actor || "system",
    metadata: input.payload || {}
  });

  incrementPassportIntegrationMetric("passportUpdates", 1);

  return {
    ok: true,
    passportId,
    signalId,
    duplicate: Boolean(ingestResult.duplicate),
    correlationId
  };
}
