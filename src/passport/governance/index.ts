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
  PassportTrustEvolutionExplanation,
  TrustExplanationClient
} from "./explainability";

export {
  buildPlaceholderTrustExplanation,
  buildPlaceholderTrustEvolutionExplanation,
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
    "Detect anomalous signal patterns for human investigation",
    "Assist in identifying patterns for human review — never as final authority"
  ],
  prohibited: [
    "Autonomous credit, employment, or legal decisions",
    "Single-score person ranking or permanent labeling",
    "Trust overrides without human review and audit",
    "Training on raw product data without product consent",
    "Opaque trust conclusions without explainability path",
    "Final authority over identity determination",
    "Final authority over verification outcomes",
    "Final authority over permanent trust conclusions",
    "Final authority over dispute resolution",
    "Final authority over high-impact decisions",
    "Final authority over Legacy recognition or granting"
  ],
  humanOversightRequired: true,
  aiMayAssistPatternIdentification: true,
  aiMustNeverBeFinalAuthorityFor: [
    "identity",
    "verification",
    "permanent_trust",
    "disputes",
    "high_impact_decisions",
    "legacy_recognition"
  ] as const
} as const;

/** Extended trust dimensions products may register in future — Principle 4. */
export const FUTURE_TRUST_DIMENSIONS = [
  "professional_trust",
  "education_trust",
  "health_credentials",
  "business_trust"
] as const;

export type FutureTrustDimension = (typeof FUTURE_TRUST_DIMENSIONS)[number];

// Trust evolution — extends Foundation v1.0 (Living Digital Trust Passport)
export {
  PASSPORT_LIFECYCLE_STAGES,
  getLifecycleStage,
  listLifecycleStages,
  TRUST_PROGRESSION_EVENT_REGISTRY,
  getProgressionEventDescriptor,
  listProgressionEventKinds,
  buildPlaceholderTrustTimeline,
  PASSPORT_JOURNEY_SECTIONS,
  buildPlaceholderPassportJourney,
  PASSPORT_ACHIEVEMENT_REGISTRY,
  getAchievementDefinition,
  listAchievementDefinitions,
  PASSPORT_MILESTONE_REGISTRY,
  getMilestoneDefinition,
  listMilestoneDefinitions,
  PASSPORT_EVOLUTION_PHASES,
  LIVING_PASSPORT_PHILOSOPHY,
  DYNAMIC_TRUST_PHILOSOPHY,
  listEvolutionPhases,
  TRUST_ENGINE_INPUT_CATEGORIES
} from "../evolution";

export type {
  PassportLifecycleStageId,
  PassportLifecycleStage,
  TrustProgressionEventKind,
  TrustProgressionEventDescriptor,
  TrustProgressionEventRecord,
  TrustProgressionClient,
  TrustTimelineEventCategory,
  TrustTimelineEvent,
  PassportTrustTimeline,
  PassportTrustTimelineClient,
  PassportJourneySectionId,
  PassportJourneySection,
  PassportJourneySnapshot,
  PassportAchievementId,
  PassportAchievementDefinition,
  PassportAchievementRecord,
  PassportMilestoneId,
  PassportMilestoneDefinition,
  PassportMilestoneRecord,
  PassportEvolutionPhaseId,
  PassportEvolutionPhase,
  TrustEngineHumanReviewRef,
  TrustEngineInputBundle,
  TrustEngineClient,
  TrustEngineInputCategory
} from "../evolution";

// Legacy layer — Foundation v1.2 (distinct from lifecycle, timeline, achievements)
export {
  LEGACY_PHILOSOPHY,
  LEGACY_EMERGENCE_PHILOSOPHY,
  LEGACY_STEWARDSHIP_NOTICE,
  LEGACY_PROHIBITIONS,
  LEGACY_CONTRIBUTION_REGISTRY,
  getLegacyContributionDimension,
  listLegacyContributionDimensions,
  LEGACY_BADGE_REGISTRY,
  getLegacyBadgeDefinition,
  listLegacyBadgeDefinitions,
  buildPlaceholderLegacyTimeline,
  PASSPORT_ARCHITECTURE_LAYERS,
  buildPlaceholderLegacySnapshot,
  legacyApiClientPlaceholder
} from "../legacy";

export type {
  LegacyContributionDimensionId,
  LegacyContributionDimension,
  LegacyContributionRecord,
  LegacyBadgeId,
  LegacyBadgeDefinition,
  LegacyBadgeRecord,
  LegacyTimelineEventCategory,
  LegacyTimelineEvent,
  PassportLegacyTimeline,
  LegacyRecognitionStatus,
  LegacySnapshot,
  PassportArchitectureLayer,
  LegacyRecognitionSubmission,
  LegacyApiClient
} from "../legacy";
