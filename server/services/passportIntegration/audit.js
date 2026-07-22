/**
 * Trust signal producer audit — canonical registry of platform emitters.
 */

export const TRUST_SIGNAL_PRODUCERS = Object.freeze([
  { source: "authentication", events: ["signup", "email_verified", "profile_completed", "session_created"], signalTypes: ["email_verified", "profile_completed", "profile_verified"] },
  { source: "verification", events: ["identity_submitted", "identity_verified", "verification_override"], signalTypes: ["identity_verified", "verification_completed"] },
  { source: "finance", events: ["payment_successful", "payment_refund", "subscription_activated"], signalTypes: ["payment_successful", "payment_refund", "premium_active"] },
  { source: "messaging", events: ["conversation_created", "message_sent", "message_delivered", "message_read"], signalTypes: ["conversation_started", "positive_interaction", "message_delivered", "message_read"] },
  { source: "matching", events: ["signal_accepted", "match_created"], signalTypes: ["successful_match", "positive_interaction"] },
  { source: "moderation", events: ["report_submitted", "moderation_action", "appeal_resolved"], signalTypes: ["member_reported", "policy_violation", "moderation_action", "appeal_approved"] },
  { source: "operations", events: ["user_suspended", "user_restored", "shadow_ban"], signalTypes: ["moderation_action", "policy_violation"] },
  { source: "concierge", events: ["case_assigned", "case_completed"], signalTypes: ["concierge_engaged", "community_participation"] },
  { source: "support", events: ["ticket_created", "ticket_resolved"], signalTypes: ["support_resolved", "community_participation"] }
]);

/** Legacy duplicate emitters retired — all platform events route through passportIntegration bridge. */
export const RETIRED_DUPLICATE_EMITTERS = Object.freeze([
  "direct passport API calls from member flows (use bridge only)",
  "ad-hoc auditLog trust entries without signal pipeline"
]);

export function auditTrustProducers() {
  return {
    producers: TRUST_SIGNAL_PRODUCERS,
    retiredDuplicates: RETIRED_DUPLICATE_EMITTERS,
    canonicalEntryPoint: "handlePlatformTrustEvent",
    auditedAt: new Date().toISOString()
  };
}

export function resolveSignalMapping(sourceSystem, eventType) {
  const producer = TRUST_SIGNAL_PRODUCERS.find((p) => p.source === sourceSystem);
  if (!producer || !producer.events.includes(eventType)) return null;

  const mapping = {
    signup: { signalType: "profile_verified", category: "verification", dimension: "identity" },
    email_verified: { signalType: "email_verified", category: "verification", dimension: "verification" },
    profile_completed: { signalType: "profile_completed", category: "verification", dimension: "identity" },
    session_created: { signalType: "profile_verified", category: "verification", dimension: "reliability" },
    identity_verified: { signalType: "identity_verified", category: "identity", dimension: "identity" },
    verification_completed: { signalType: "verification_completed", category: "verification", dimension: "verification" },
    verification_override: { signalType: "verification_completed", category: "verification", dimension: "verification" },
    payment_successful: { signalType: "payment_successful", category: "financial", dimension: "financial" },
    payment_refund: { signalType: "payment_refund", category: "financial", dimension: "financial" },
    subscription_activated: { signalType: "premium_active", category: "financial", dimension: "financial" },
    conversation_created: { signalType: "conversation_started", category: "community", dimension: "engagement" },
    message_sent: { signalType: "positive_interaction", category: "community", dimension: "engagement" },
    message_delivered: { signalType: "message_delivered", category: "community", dimension: "reliability" },
    message_read: { signalType: "message_read", category: "community", dimension: "engagement" },
    signal_accepted: { signalType: "successful_match", category: "community", dimension: "community" },
    match_created: { signalType: "successful_match", category: "community", dimension: "community" },
    report_submitted: { signalType: "member_reported", category: "compliance", dimension: "safety" },
    moderation_action: { signalType: "moderation_action", category: "compliance", dimension: "safety" },
    appeal_resolved: { signalType: "appeal_approved", category: "compliance", dimension: "safety" },
    user_suspended: { signalType: "policy_violation", category: "compliance", dimension: "safety" },
    user_restored: { signalType: "appeal_approved", category: "compliance", dimension: "safety" },
    shadow_ban: { signalType: "policy_violation", category: "compliance", dimension: "safety" },
    case_assigned: { signalType: "concierge_engaged", category: "community", dimension: "concierge" },
    case_completed: { signalType: "concierge_engaged", category: "community", dimension: "concierge" },
    ticket_created: { signalType: "support_resolved", category: "community", dimension: "support" },
    ticket_resolved: { signalType: "support_resolved", category: "community", dimension: "support" }
  };

  return mapping[eventType] || null;
}
