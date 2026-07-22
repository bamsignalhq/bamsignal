export type {
  PassportId,
  PassportProductId,
  PassportIdentity,
  PassportSessionState,
  PassportSummary,
  IdentityPermission,
  PersonaPermission,
  IdentityVerificationStatus,
  IdentitySecurityStatus,
  IdentityConfidenceLevel,
  AuditEventCategory,
  AuditTimelineEntry,
  ReputationDimension,
  ReputationSnapshot
} from "./types";

export {
  generatePassportId,
  resolvePassportId,
  getPassportIdForAnchor,
  isPassportId,
  isCanonicalPassportId,
  formatPassportId,
  normalizePassportId,
  parsePassportId,
  validatePassportId,
  PASSPORT_PRODUCT_NAME,
  PASSPORT_ID_ALPHABET,
  PASSPORT_PREFIX_REGISTRY,
  PASSPORT_PREFIX_SKL_MEANING,
  ACTIVE_INDIVIDUAL_PASSPORT_PREFIX,
  listPassportPrefixes,
  getPassportPrefixDefinition
} from "./id";

export type { ParsedPassportId, PassportPrefixId, PassportPrefixDefinition, PassportPrefixStatus } from "./id";

export {
  getPassportSession,
  updatePassportSession,
  bindPassportIdentity,
  getPassportIdentity,
  getPassportId,
  markPersonaAvailable,
  selectPersona,
  syncPersonaForWorkspace,
  getSelectedPersonaId,
  rememberPassportRoute,
  getLastPassportRoute,
  getPassportWorkspaceSlice,
  patchPassportWorkspaceSlice
} from "./session";

export { identityCan } from "./permissions";
export { personaCan, canUsePersona } from "./personaPermissions";
export { workspaceCan, canEnterWorkspace } from "../workspaces/permissions";

export {
  PERSONA_REGISTRY,
  getPersonaDefinition,
  isKnownPersonaId,
  listShippedPersonas,
  listPersonasForWorkspace,
  defaultPersonaForWorkspace
} from "./personas/registry";

export type { PersonaId, PersonaDefinition } from "./personas/types";

// Digital Trust layer
export type {
  TrustDimension,
  TrustConfidenceLevel,
  TrustDimensionSummary,
  TrustSnapshot,
  TrustSignalDescriptor
} from "./trust/types";

export {
  getTrustSnapshot,
  listTrustDimensions,
  getTrustDimensionSummary,
  TRUST_DIMENSIONS
} from "./trust";

export {
  TRUST_CONTRIBUTOR_REGISTRY,
  getTrustContributor,
  listTrustContributors,
  listContributorsForTrustDimension,
  isKnownTrustContributorId
} from "./trust/contributors/registry";

export type {
  TrustContributorId,
  TrustContributorDefinition,
  ReputationBehaviorType
} from "./trust/contributors/types";

// Behaviour reputation (distinct from Trust)
export type {
  ReputationBehaviorDimension,
  ReputationBehaviorSummary
} from "./reputation/types";

export {
  getReputationSnapshot,
  listReputationDimensions,
  getLegacyReputationSnapshot,
  REPUTATION_BEHAVIOR_DIMENSIONS
} from "./reputation";

// Passport Summary — canonical portable trust object
export { buildPassportSummary, getPassportSummaryJson } from "./summary";

// External API abstractions (no HTTP in this sprint)
export type {
  PassportApiScope,
  PassportApiConsentGrant,
  PassportApiRequestContext,
  PassportApiErrorCode,
  PassportApiResult,
  PassportExternalApiClient
} from "./externalApi";

export { localPassportApiClient, filterSummaryByScopes } from "./externalApi";

// Privacy boundaries
export type { PassportDataClass, ProductOwnedDataClass } from "./privacy";

export {
  PASSPORT_ALLOWED_DATA,
  PRODUCT_OWNED_DATA,
  PRODUCT_DATA_OWNERSHIP,
  isPassportDataClass,
  isProductOwnedDataClass,
  assertNotProductOwnedPayload
} from "./privacy";

export {
  appendPassportAuditEvent,
  getPassportAuditTimeline,
  clearPassportAuditTimeline
} from "./audit";

export type {
  BamSignalMemberProfile,
  BamSignalConciergeProfile,
  BamSignalProductProfiles,
  EcosystemProductProfileBinding
} from "./profiles";

export {
  createMemberProductProfile,
  createConciergeProductProfile
} from "./profiles";

export {
  syncWorkspaceFromPath,
  activateWorkspaceFromAuthSurface,
  rememberMemberWorkspacePath
} from "../workspaces/routing";

export {
  getSelectedWorkspaceId,
  getPreferredWorkspaceId,
  getAvailableWorkspaceIds,
  hasMultipleWorkspaces,
  markWorkspaceAvailable,
  selectWorkspace,
  rememberWorkspacePath,
  getLastWorkspacePath,
  resolveWorkspaceFromPath,
  resolvePostAuthWorkspacePath,
  resolveSwitchPath
} from "../workspaces/session";

export {
  WORKSPACE_REGISTRY,
  getWorkspaceDefinition,
  listShippedWorkspaces
} from "../workspaces/registry";

export type { WorkspaceId, WorkspaceDefinition, WorkspacePermission } from "../workspaces/types";

// Platform governance — constitutional principles, consent, explainability, disputes
export {
  CONSTITUTION_VERSION,
  CONSTITUTIONAL_PRINCIPLES,
  PASSPORT_PROHIBITIONS,
  PASSPORT_MISSION,
  getConstitutionalPrinciple,
  listConstitutionalPrinciples,
  buildPlaceholderTrustExplanation,
  buildPlaceholderTrustEvolutionExplanation,
  signalToExplanationFactor,
  recordConsentGrant,
  revokeConsentGrant,
  listConsentGrants,
  listActiveConsentGrants,
  getConsentAuditTrail,
  consentCoversScopes,
  submitDispute,
  listDisputes,
  mapDisputeToSignalReviewStatus,
  USER_VISIBILITY_SECTIONS,
  buildUserPassportVisibilitySnapshot,
  AI_USAGE_POLICY,
  FUTURE_TRUST_DIMENSIONS,
  PASSPORT_CAPABILITY_REGISTRY,
  getCapabilityDefinition,
  getCapabilityMaturity,
  getTrustDimensionMaturity,
  listPassportCapabilities,
  listCapabilitiesByMaturity,
  isAuthoritativeCapability,
  isCapabilityAtLeast,
  maturityLabel,
  PASSPORT_LIFECYCLE_STAGES,
  listLifecycleStages,
  TRUST_PROGRESSION_EVENT_REGISTRY,
  PASSPORT_JOURNEY_SECTIONS,
  PASSPORT_ACHIEVEMENT_REGISTRY,
  PASSPORT_MILESTONE_REGISTRY,
  PASSPORT_EVOLUTION_PHASES,
  LIVING_PASSPORT_PHILOSOPHY,
  DYNAMIC_TRUST_PHILOSOPHY,
  buildPlaceholderTrustTimeline,
  buildPlaceholderPassportJourney,
  TRUST_ENGINE_INPUT_CATEGORIES,
  LEGACY_PHILOSOPHY,
  LEGACY_EMERGENCE_PHILOSOPHY,
  LEGACY_CONTRIBUTION_REGISTRY,
  LEGACY_BADGE_REGISTRY,
  PASSPORT_ARCHITECTURE_LAYERS,
  buildPlaceholderLegacySnapshot,
  buildPlaceholderLegacyTimeline,
  legacyApiClientPlaceholder,
  TRUST_SIGNAL_EVIDENCE_CATEGORIES,
  PRODUCT_SIGNAL_TYPE_REGISTRY,
  SIGNAL_CONTRIBUTOR_REGISTRY,
  getSignalContributor,
  listSignalContributors,
  getSignalTypeDescriptor,
  listSignalTypesForContributor,
  isContributorAllowedSignalType,
  buildProvenanceQuestions,
  SIGNAL_CONSENT_GATE_REQUIREMENTS,
  SIGNAL_INGESTION_PIPELINE,
  listIngestionStages
} from "./governance";

export type {
  ConstitutionalPrincipleId,
  TrustSignalCategory,
  TrustSignalVerificationStatus,
  TrustSignalReviewStatus,
  TrustSignalRecord,
  TrustSignalExpiryPolicy,
  TrustSignalTypeRegistration,
  TrustSignalIngestionClient,
  TrustExplanationFactor,
  TrustDimensionExplanation,
  PassportTrustExplanation,
  TrustExplanationClient,
  PassportTrustEvolutionExplanation,
  ConsentGrantStatus,
  ConsentGrantRecord,
  ConsentAuditEntry,
  ConsentRequest,
  DisputeCategory,
  DisputeStatus,
  DisputeRecord,
  DisputeSubmission,
  DisputeResolutionClient,
  UserVisibilitySection,
  UserPassportVisibilitySnapshot,
  FutureTrustDimension,
  TrustMaturityLevel,
  PassportCapabilityId,
  PassportCapabilityDefinition,
  PassportLifecycleStageId,
  PassportLifecycleStage,
  TrustProgressionEventKind,
  PassportJourneySectionId,
  PassportAchievementId,
  PassportMilestoneId,
  PassportEvolutionPhaseId,
  TrustEngineInputCategory,
  LegacyContributionDimensionId,
  LegacyBadgeId,
  LegacySnapshot,
  LegacyApiClient,
  PassportArchitectureLayer,
  TrustSignal,
  ValidatedTrustSignal,
  TrustSignalEvidenceCategory,
  SignalContributorDefinition,
  SignalIngestionStage,
  SignalIngestionResult,
  SignalProvenanceRecord,
  PassportSignalEventType
} from "./governance";
