/**
 * Stankings Digital Trust Passport — Governance layer.
 * Constitutional principles, consent, explainability, disputes, user visibility.
 *
 * @see docs/architecture/DIGITAL_TRUST_CONSTITUTION.md
 */

export {
  CONSTITUTION_VERSION,
  CONSTITUTIONAL_PRINCIPLES,
  PASSPORT_PROHIBITIONS,
  PASSPORT_MISSION,
  getConstitutionalPrinciple,
  listConstitutionalPrinciples,
  type ConstitutionalPrincipleId
} from "./constitution";

export type {
  TrustSignalCategory,
  TrustSignalVerificationStatus,
  TrustSignalReviewStatus,
  TrustSignalRecord,
  TrustSignalExpiryPolicy,
  TrustSignalTypeRegistration,
  TrustSignalIngestionClient
} from "./trustSignals";

export type {
  TrustExplanationFactor,
  TrustDimensionExplanation,
  PassportTrustExplanation,
  TrustExplanationClient
} from "./explainability";

export {
  buildPlaceholderTrustExplanation,
  signalToExplanationFactor
} from "./explainability";

export type {
  ConsentGrantStatus,
  ConsentGrantRecord,
  ConsentAuditEntry,
  ConsentRequest
} from "./consent";

export {
  recordConsentGrant,
  revokeConsentGrant,
  listConsentGrants,
  listActiveConsentGrants,
  getConsentAuditTrail,
  consentCoversScopes
} from "./consent";

export type {
  DisputeCategory,
  DisputeStatus,
  DisputeRecord,
  DisputeSubmission,
  DisputeResolutionClient
} from "./disputes";

export {
  submitDispute,
  listDisputes,
  mapDisputeToSignalReviewStatus
} from "./disputes";

export type {
  UserVisibilitySection,
  UserPassportVisibilitySnapshot
} from "./userVisibility";

export {
  USER_VISIBILITY_SECTIONS,
  buildUserPassportVisibilitySnapshot
} from "./userVisibility";

export type {
  TrustMaturityLevel,
  PassportCapabilityId,
  PassportCapabilityDefinition
} from "./maturity";

export {
  PASSPORT_CAPABILITY_REGISTRY,
  getCapabilityDefinition,
  getCapabilityMaturity,
  getTrustDimensionMaturity,
  listPassportCapabilities,
  listCapabilitiesByMaturity,
  isAuthoritativeCapability,
  isCapabilityAtLeast,
  maturityLabel
} from "./maturity";

/** Future AI usage policy — guidance only, no AI in Passport core. */
export const AI_USAGE_POLICY = {
  allowed: [
    "Assist human reviewers with dispute triage (with audit trail)",
    "Summarize explainability factors in plain language for users",
    "Detect anomalous signal patterns for human investigation"
  ],
  prohibited: [
    "Autonomous credit, employment, or legal decisions",
    "Single-score person ranking or permanent labeling",
    "Trust overrides without human review and audit",
    "Training on raw product data without product consent",
    "Opaque trust conclusions without explainability path"
  ],
  humanOversightRequired: true
} as const;

/** Extended trust dimensions products may register in future — Principle 4. */
export const FUTURE_TRUST_DIMENSIONS = [
  "professional_trust",
  "education_trust",
  "health_credentials",
  "business_trust"
] as const;

export type FutureTrustDimension = (typeof FUTURE_TRUST_DIMENSIONS)[number];
