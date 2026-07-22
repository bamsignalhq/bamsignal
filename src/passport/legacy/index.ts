/**
 * Stankings Digital Trust Passport — Legacy layer (Foundation v1.2).
 * Distinct from Lifecycle, Timeline, Achievements, and Trust.
 *
 * @see docs/architecture/LEGACY_ARCHITECTURE.md
 */

export {
  LEGACY_PHILOSOPHY,
  LEGACY_EMERGENCE_PHILOSOPHY,
  LEGACY_STEWARDSHIP_NOTICE,
  LEGACY_PROHIBITIONS
} from "./philosophy";

export type {
  LegacyContributionDimensionId,
  LegacyContributionDimension,
  LegacyContributionRecord
} from "./contributions";

export {
  LEGACY_CONTRIBUTION_REGISTRY,
  getLegacyContributionDimension,
  listLegacyContributionDimensions
} from "./contributions";

export type { LegacyBadgeId, LegacyBadgeDefinition, LegacyBadgeRecord } from "./badges";
export { LEGACY_BADGE_REGISTRY, getLegacyBadgeDefinition, listLegacyBadgeDefinitions } from "./badges";

export type {
  LegacyTimelineEventCategory,
  LegacyTimelineEvent,
  PassportLegacyTimeline
} from "./timeline";

export { buildPlaceholderLegacyTimeline } from "./timeline";

export type {
  LegacyRecognitionStatus,
  LegacySnapshot,
  PassportArchitectureLayer
} from "./model";

export {
  PASSPORT_ARCHITECTURE_LAYERS,
  buildPlaceholderLegacySnapshot
} from "./model";

export type { LegacyRecognitionSubmission, LegacyApiClient } from "./api";
export { legacyApiClientPlaceholder } from "./api";
