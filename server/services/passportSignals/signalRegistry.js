/**
 * Server-side signal type registry — mirrors Platform v2.0 contracts.
 * Keep aligned with src/passport/signals/contributors.ts
 */

export const SIGNAL_EVIDENCE_CATEGORIES = new Set([
  "identity",
  "verification",
  "financial",
  "marketplace",
  "community",
  "professional",
  "education",
  "government",
  "security",
  "compliance",
  "legacy"
]);

export const SIGNAL_TYPE_DEFAULTS = {
  profile_verified: { category: "verification", humanReview: "none" },
  identity_verified: { category: "identity", humanReview: "required" },
  positive_interaction: { category: "community", humanReview: "none" },
  successful_match: { category: "community", humanReview: "none" },
  community_participation: { category: "community", humanReview: "none" },
  policy_violation: { category: "compliance", humanReview: "required" },
  appeal_approved: { category: "compliance", humanReview: "completed" },
  bank_verified: { category: "financial", humanReview: "required" },
  successful_escrow: { category: "financial", humanReview: "none" },
  completed_settlement: { category: "financial", humanReview: "none" },
  chargeback: { category: "financial", humanReview: "required" },
  refund: { category: "financial", humanReview: "recommended" },
  fraud_investigation: { category: "security", humanReview: "required" },
  verified_seller: { category: "marketplace", humanReview: "required" },
  verified_buyer: { category: "marketplace", humanReview: "required" },
  successful_transaction: { category: "marketplace", humanReview: "none" },
  inspection_passed: { category: "marketplace", humanReview: "recommended" },
  property_verified: { category: "verification", humanReview: "required" },
  dispute_closed: { category: "compliance", humanReview: "completed" },
  email_verified: { category: "verification", humanReview: "none" },
  profile_completed: { category: "verification", humanReview: "none" },
  premium_active: { category: "financial", humanReview: "none" },
  payment_successful: { category: "financial", humanReview: "none" },
  payment_refund: { category: "financial", humanReview: "recommended" },
  conversation_started: { category: "community", humanReview: "none" },
  message_delivered: { category: "community", humanReview: "none" },
  message_read: { category: "community", humanReview: "none" },
  member_reported: { category: "compliance", humanReview: "required" },
  moderation_action: { category: "compliance", humanReview: "required" },
  concierge_engaged: { category: "community", humanReview: "none" },
  support_resolved: { category: "community", humanReview: "none" },
  verification_completed: { category: "verification", humanReview: "required" }
};

export const PASSPORT_ID_PATTERN = /^SKL-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/i;

export function isValidPassportId(value) {
  return Boolean(value && PASSPORT_ID_PATTERN.test(String(value).trim().toUpperCase()));
}

export function normalizePassportId(value) {
  if (!value) return null;
  const normalized = String(value).trim().replace(/\s+/g, "").toUpperCase();
  return PASSPORT_ID_PATTERN.test(normalized) ? normalized : null;
}

export function getSignalTypeDefaults(signalType) {
  return SIGNAL_TYPE_DEFAULTS[signalType] || null;
}

export function isKnownSignalCategory(category) {
  return SIGNAL_EVIDENCE_CATEGORIES.has(category);
}
