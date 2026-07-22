/**
 * Legacy Timeline — decades-scale contribution narrative.
 * Separate from Trust Timeline (milestones) and Audit (complete history).
 *
 * @see docs/architecture/LEGACY_ARCHITECTURE.md
 */

import type { LegacyBadgeId } from "./badges";
import type { LegacyContributionDimensionId } from "./contributions";

export type LegacyTimelineEventCategory =
  | "passport_created"
  | "identity_verified"
  | "first_business"
  | "marketplace_milestone"
  | "organization_founded"
  | "community_recognition"
  | "contribution_recognized"
  | "legacy_status_emerged";

/** Long-horizon legacy event — years and decades, not daily audit noise. */
export type LegacyTimelineEvent = {
  eventId: string;
  passportId: string;
  category: LegacyTimelineEventCategory;
  year: number;
  headline: string;
  summary: string;
  contributionDimension: LegacyContributionDimensionId | null;
  badgeRef: LegacyBadgeId | null;
  auditRef: string | null;
};

export type PassportLegacyTimeline = {
  passportId: string;
  events: LegacyTimelineEvent[];
  /** Legacy timeline is curated long-horizon narrative — not audit or trust timeline. */
  horizon: "legacy";
  generatedAt: string;
};

export function buildPlaceholderLegacyTimeline(passportId: string): PassportLegacyTimeline {
  return {
    passportId,
    events: [],
    horizon: "legacy",
    generatedAt: new Date().toISOString()
  };
}
