/**
 * Trust Signal module — canonical evidence layer (Platform Phase 1).
 *
 * @see docs/architecture/TRUST_SIGNAL_STANDARD.md
 */

export type {
  TrustSignalEvidenceCategory,
  TrustSignalEvidenceCategoryDefinition
} from "./categories";

export {
  TRUST_SIGNAL_EVIDENCE_CATEGORIES,
  getSignalEvidenceCategory,
  listSignalEvidenceCategories
} from "./categories";

export type {
  TrustSignalStatus,
  TrustSignalHumanReviewRequirement,
  TrustSignalConfidenceMetadata,
  TrustSignalEvidenceMetadata,
  TrustSignalRevocation,
  TrustSignalExpiration,
  TrustSignal,
  TrustSignalTypeDescriptor,
  TrustSignalSubmission,
  ValidatedTrustSignal
} from "./types";

export type {
  SignalIdempotencyMetadata,
  SignalDuplicateHandling,
  SignalDuplicateDetectionResult,
  SignalQueueMetadata,
  SignalReplayDetectionContext,
  SignalIdempotencyClient
} from "./idempotency";

export type {
  SignalValidationKind,
  SignalValidationResult,
  SignalValidationReport,
  SignalSchemaValidator,
  SignalSignatureValidator,
  SignalContributorValidator,
  SignalConsentValidator,
  SignalEvidenceValidator,
  SignalReferenceValidator,
  SignalExpirationValidator,
  SignalVersionValidator,
  SignalValidationPipeline
} from "./validation";

export type {
  SignalProvenanceQuestions,
  SignalProvenanceRecord,
  SignalProvenanceClient
} from "./provenance";

export { buildProvenanceQuestions } from "./provenance";

export type {
  PassportSignalEventType,
  PassportSignalEvent,
  SignalCreatedPayload,
  SignalRevokedPayload,
  HumanReviewRequestedPayload,
  TrustRecomputedPayload,
  PassportSignalEventPublisher,
  PassportSignalEventSubscriber
} from "./events";

export type {
  SignalContributorStatus,
  SignalContributorTrustDomain,
  SignalContributorVerificationLevel,
  SignalContributorCapability,
  SignalContributorDefinition
} from "./contributors";

export {
  PRODUCT_SIGNAL_TYPE_REGISTRY,
  SIGNAL_CONTRIBUTOR_REGISTRY,
  getSignalContributor,
  listSignalContributors,
  getSignalTypeDescriptor,
  listSignalTypesForContributor,
  listSignalTypesByCategory,
  isContributorAllowedSignalType
} from "./contributors";

export type {
  SignalConsentGateFailureReason,
  SignalConsentGateResult,
  SignalConsentGate,
  SignalConsentHumanOverride
} from "./consentGate";

export { SIGNAL_CONSENT_GATE_REQUIREMENTS } from "./consentGate";

export type {
  TrustSignalLifecycleStatus,
  TrustSignalLifecycleStageDefinition,
  SignalGovernanceActionType,
  SignalGovernanceReasonCode,
  SignalGovernanceActionRecord,
  SignalReviewQueueStatus,
  SignalReviewQueueItem,
  SignalHistoryEntryKind,
  SignalHistoryEntry,
  SignalRetentionClass,
  SignalRetentionMetadata,
  ContributorHealthSnapshot,
  ReplayAlertSeverity,
  ReplayMonitoringEvent,
  PassportSignalAlertType,
  PassportSignalAlertPublisher,
  GovernanceDashboardSnapshot
} from "./governance";

export {
  TRUST_SIGNAL_LIFECYCLE_STAGES
} from "./governance";
