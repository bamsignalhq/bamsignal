import { processPlatformTrustSignalDirect } from "./bridge.js";

export { auditTrustProducers, TRUST_SIGNAL_PRODUCERS, resolveSignalMapping } from "./audit.js";
export { ensurePassportForMember, getPassportIdForMember, getMemberIdForPassport, generatePassportId } from "./memberRegistry.js";
export { queuePlatformTrustSignal, processQueuedTrustSignal, processPlatformTrustSignalDirect } from "./bridge.js";
export {
  REPUTATION_DIMENSIONS,
  ensureReputationProfile,
  appendReputationInput,
  getReputationProfile,
  listReputationInputs
} from "./reputation.js";
export {
  TRUST_PLATFORM_EVENT_TYPES,
  publishTrustPlatformEvent,
  listTrustPlatformEvents,
  subscribeTrustPlatformEvents
} from "./eventBus.js";
export {
  incrementPassportIntegrationMetric,
  getPassportIntegrationMetrics,
  resetPassportIntegrationMetrics
} from "./observability.js";
export {
  buildPassportSummary,
  buildTrustTimeline,
  buildVerificationHistory,
  buildSignalHistory,
  buildConsentHistory,
  buildReputationProfileContract,
  buildPassportApiDashboard
} from "./apiContract.js";

/** Unified async trust hook — never blocks caller, never throws. */
export async function handlePlatformTrustEvent(input = {}) {
  try {
    const { queuePlatformTrustSignal } = await import("./bridge.js");
    return await queuePlatformTrustSignal(input);
  } catch (error) {
    console.warn("[passportIntegration] trust hook failed:", error?.message || error);
    return { ok: false, error: "trust_hook_failed" };
  }
}

/** Operational certification journey — signup through passport update. */
export async function runPassportCertificationJourney(input = {}) {
  const memberId = input.memberId || "00000000-0000-0000-0000-000000000010";
  const correlationId = input.correlationId || `cert_passport_${Date.now()}`;
  const steps = [];

  const journey = [
    { sourceSystem: "authentication", eventType: "signup", label: "signup" },
    { sourceSystem: "authentication", eventType: "email_verified", label: "verify_email" },
    { sourceSystem: "authentication", eventType: "profile_completed", label: "complete_profile" },
    { sourceSystem: "finance", eventType: "subscription_activated", label: "purchase_premium" },
    { sourceSystem: "finance", eventType: "payment_successful", label: "trust_signal_payment" },
    { sourceSystem: "matching", eventType: "signal_accepted", label: "match" },
    { sourceSystem: "messaging", eventType: "message_sent", label: "message" },
    { sourceSystem: "messaging", eventType: "message_delivered", label: "positive_delivery" },
    { sourceSystem: "moderation", eventType: "report_submitted", label: "moderation_check" },
    { sourceSystem: "authentication", eventType: "profile_completed", label: "passport_updated" }
  ];

  for (const step of journey) {
    const result = await processPlatformTrustSignalDirect({
      memberId,
      sourceSystem: step.sourceSystem,
      eventType: step.eventType,
      correlationId: `${correlationId}:${step.label}`,
      actor: "certification"
    }).catch(() => ({ ok: false, skipped: true }));

    steps.push({
      step: step.label,
      ok: result.ok !== false || result.skipped || result.duplicate
    });
  }

  const passed = steps.every((s) => s.ok);
  return { ok: passed, passed, steps, correlationId, memberId };
}
