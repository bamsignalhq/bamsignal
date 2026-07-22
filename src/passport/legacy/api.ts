/**
 * Legacy APIs — interfaces only. No scoring. No AI decisions.
 *
 * @see docs/architecture/LEGACY_ARCHITECTURE.md
 */

import type { LegacyBadgeId, LegacyBadgeRecord } from "./badges";
import type { LegacyContributionDimensionId, LegacyContributionRecord } from "./contributions";
import type { LegacySnapshot } from "./model";
import { buildPlaceholderLegacySnapshot } from "./model";
import type { LegacyTimelineEvent, PassportLegacyTimeline } from "./timeline";
import { buildPlaceholderLegacyTimeline } from "./timeline";

export type LegacyRecognitionSubmission = {
  passportId: string;
  badgeId: LegacyBadgeId;
  contributionDimension: LegacyContributionDimensionId;
  headline: string;
  evidenceRef: string;
  /** Principle 12 + Principle 9 — human review mandatory. */
  reviewerRef: string;
};

/** Future Legacy service — server-side emergence, never client-calculated. */
export interface LegacyApiClient {
  getLegacySnapshot(passportId: string): Promise<LegacySnapshot | null>;
  getLegacyTimeline(passportId: string): Promise<PassportLegacyTimeline | null>;
  listContributions(passportId: string): Promise<LegacyContributionRecord[]>;
  listBadges(passportId: string): Promise<LegacyBadgeRecord[]>;
  /** Human-reviewed recognition only — not arbitrary grant. */
  submitRecognition(submission: LegacyRecognitionSubmission): Promise<LegacyBadgeRecord | null>;
  appendTimelineEvent(event: Omit<LegacyTimelineEvent, "eventId">): Promise<LegacyTimelineEvent>;
}

/** Placeholder client — all methods return empty/emerged-not-yet state. */
export const legacyApiClientPlaceholder: LegacyApiClient = {
  async getLegacySnapshot(passportId) {
    return buildPlaceholderLegacySnapshot(passportId);
  },
  async getLegacyTimeline(passportId) {
    return buildPlaceholderLegacyTimeline(passportId);
  },
  async listContributions() {
    return [];
  },
  async listBadges() {
    return [];
  },
  async submitRecognition() {
    return null;
  },
  async appendTimelineEvent(event) {
    return { ...event, eventId: `legacy_${Date.now()}` };
  }
};
