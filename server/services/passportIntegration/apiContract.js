/**
 * Passport API contracts — backend only, no UI.
 */

import { listSignalsForPassport } from "../passportSignals/persistence.js";
import { listRecentEvents } from "../passportSignals/eventBus.js";
import { listTrustPlatformEvents } from "./eventBus.js";
import { getReputationProfile, listReputationInputs } from "./reputation.js";
import { getPassportIdForMember, getMemberIdForPassport } from "./memberRegistry.js";
import { getPassportIntegrationMetrics } from "./observability.js";
import { query, isDatabaseReady } from "../../db.js";

const REPUTATION_DIMENSION_KEYS = [
  "identity",
  "reliability",
  "safety",
  "engagement",
  "financial",
  "community",
  "verification",
  "concierge",
  "support"
];

export async function buildPassportSummary(passportId) {
  const normalized = String(passportId || "").trim().toUpperCase();
  const memberId = await getMemberIdForPassport(normalized);
  const signals = await listSignalsForPassport(normalized, { limit: 10 });
  const reputation = await getReputationProfile(normalized);

  return {
    passportId: normalized,
    memberId,
    signalCount: signals.length,
    latestSignalAt: signals[0]?.recorded_at || null,
    reputationDimensions: reputation
      ? REPUTATION_DIMENSION_KEYS.reduce((acc, dim) => {
          acc[dim] = Array.isArray(reputation[`${dim}_inputs`]) ? reputation[`${dim}_inputs`].length : 0;
          return acc;
        }, {})
      : {},
    updatedAt: reputation?.updated_at || null
  };
}

export async function buildTrustTimeline(passportId, options = {}) {
  const normalized = String(passportId || "").trim().toUpperCase();
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const [signals, platformEvents, reputationInputs] = await Promise.all([
    listSignalsForPassport(normalized, { limit }),
    listTrustPlatformEvents({ passportId: normalized, limit }),
    listReputationInputs(normalized, { limit })
  ]);

  return {
    passportId: normalized,
    signals: signals.map((row) => ({
      signalId: row.signal_id,
      signalType: row.signal_type,
      category: row.category,
      status: row.status,
      occurredAt: row.occurred_at,
      recordedAt: row.recorded_at
    })),
    platformEvents,
    reputationInputs
  };
}

export async function buildVerificationHistory(passportId) {
  const normalized = String(passportId || "").trim().toUpperCase();
  const signals = await listSignalsForPassport(normalized, { limit: 100 });
  return {
    passportId: normalized,
    verifications: signals
      .filter((s) =>
        ["verification", "identity"].includes(s.category) ||
        ["email_verified", "profile_completed", "identity_verified", "verification_completed", "profile_verified"].includes(
          s.signal_type
        )
      )
      .map((row) => ({
        signalId: row.signal_id,
        signalType: row.signal_type,
        status: row.status,
        occurredAt: row.occurred_at,
        explanation: row.explanation
      }))
  };
}

export async function buildSignalHistory(passportId, options = {}) {
  const normalized = String(passportId || "").trim().toUpperCase();
  const signals = await listSignalsForPassport(normalized, { limit: options.limit || 100 });
  return {
    passportId: normalized,
    signals: signals.map((row) => ({
      signalId: row.signal_id,
      signalType: row.signal_type,
      category: row.category,
      status: row.status,
      confidence: row.confidence,
      evidence: row.evidence,
      occurredAt: row.occurred_at,
      recordedAt: row.recorded_at
    }))
  };
}

export async function buildConsentHistory(passportId) {
  const normalized = String(passportId || "").trim().toUpperCase();
  if (!isDatabaseReady()) return { passportId: normalized, consents: [], audits: [] };

  const [grants, audits] = await Promise.all([
    query(
      `select consent_ref, contributor_id, status, purpose, granted_at, expires_at, revoked_at
       from passport_consent_grants where passport_id = $1 and deleted_at is null order by granted_at desc limit 50`,
      [normalized]
    ),
    query(
      `select audit_id, contributor_id, consent_ref, decision, reason, actor, occurred_at
       from passport_consent_audit_log where passport_id = $1 order by occurred_at desc limit 50`,
      [normalized]
    )
  ]);

  return {
    passportId: normalized,
    consents: grants.rows,
    audits: audits.rows
  };
}

export async function buildReputationProfileContract(passportId) {
  const normalized = String(passportId || "").trim().toUpperCase();
  const profile = await getReputationProfile(normalized);
  if (!profile) {
    return { passportId: normalized, dimensions: {}, updatedAt: null };
  }

  const dimensions = {};
  for (const dim of REPUTATION_DIMENSION_KEYS) {
    const inputs = profile[`${dim}_inputs`] || [];
    dimensions[dim] = {
      inputCount: Array.isArray(inputs) ? inputs.length : 0,
      latestInputs: Array.isArray(inputs) ? inputs.slice(-5) : [],
      score: null
    };
  }

  return {
    passportId: normalized,
    dimensions,
    updatedAt: profile.updated_at,
    note: "Structured inputs only — no scoring algorithm in Sprint 6"
  };
}

export async function buildPassportApiDashboard(memberId = null, passportId = null) {
  let resolvedPassport = passportId ? String(passportId).toUpperCase() : null;
  if (!resolvedPassport && memberId) {
    resolvedPassport = await getPassportIdForMember(memberId);
  }
  if (!resolvedPassport) {
    return { ok: false, error: "passport_not_found" };
  }

  const [summary, timeline, verification, consent, reputation, metrics] = await Promise.all([
    buildPassportSummary(resolvedPassport),
    buildTrustTimeline(resolvedPassport, { limit: 20 }),
    buildVerificationHistory(resolvedPassport),
    buildConsentHistory(resolvedPassport),
    buildReputationProfileContract(resolvedPassport),
    Promise.resolve(getPassportIntegrationMetrics())
  ]);

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    contract: "passport-integration-api-v1",
    summary,
    timeline,
    verification,
    consent,
    reputation,
    observability: metrics,
    internalEvents: await listRecentEvents(resolvedPassport, 10)
  };
}
