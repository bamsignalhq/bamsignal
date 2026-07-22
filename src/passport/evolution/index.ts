/**
 * Stankings Digital Trust Passport — Evolution & progression architecture (v1.1).
 * Extends Foundation v1.0 without redefining frozen contracts.
 *
 * @see docs/architecture/TRUST_EVOLUTION_MODEL.md
 */

export type { PassportLifecycleStageId, PassportLifecycleStage } from "./lifecycle";
export {
  PASSPORT_LIFECYCLE_STAGES,
  getLifecycleStage,
  listLifecycleStages
} from "./lifecycle";

export type {
  TrustProgressionEventKind,
  TrustProgressionEventDescriptor,
  TrustProgressionEventRecord,
  TrustProgressionClient
} from "./progression";
export {
  TRUST_PROGRESSION_EVENT_REGISTRY,
  getProgressionEventDescriptor,
  listProgressionEventKinds
} from "./progression";

export type {
  TrustTimelineEventCategory,
  TrustTimelineEvent,
  PassportTrustTimeline,
  PassportTrustTimelineClient
} from "./timeline";
export { buildPlaceholderTrustTimeline } from "./timeline";

export type {
  PassportJourneySectionId,
  PassportJourneySection,
  PassportJourneySnapshot
} from "./journey";
export { PASSPORT_JOURNEY_SECTIONS, buildPlaceholderPassportJourney } from "./journey";

export type {
  PassportAchievementId,
  PassportAchievementDefinition,
  PassportAchievementRecord
} from "./achievements";
export {
  PASSPORT_ACHIEVEMENT_REGISTRY,
  getAchievementDefinition,
  listAchievementDefinitions
} from "./achievements";

export type {
  PassportMilestoneId,
  PassportMilestoneDefinition,
  PassportMilestoneRecord
} from "./milestones";
export {
  PASSPORT_MILESTONE_REGISTRY,
  getMilestoneDefinition,
  listMilestoneDefinitions
} from "./milestones";

export type { PassportEvolutionPhaseId, PassportEvolutionPhase } from "./evolutionModel";
export {
  PASSPORT_EVOLUTION_PHASES,
  LIVING_PASSPORT_PHILOSOPHY,
  DYNAMIC_TRUST_PHILOSOPHY,
  listEvolutionPhases
} from "./evolutionModel";

export type {
  TrustEngineHumanReviewRef,
  TrustEngineInputBundle,
  TrustEngineClient,
  TrustEngineInputCategory
} from "./trustEngineContract";
export { TRUST_ENGINE_INPUT_CATEGORIES } from "./trustEngineContract";
