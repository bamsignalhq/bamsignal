/**
 * Passport Trust Timeline — how the Passport evolved (Principle 11).
 * Separate from Audit: Audit = "what happened"; Timeline = positive milestones.
 *
 * @see docs/architecture/TRUST_EVOLUTION_MODEL.md
 */

import type { PassportProductId } from "../types";

export type TrustTimelineEventCategory =
  | "passport_created"
  | "identity_verified"
  | "product_joined"
  | "verification_completed"
  | "participation_milestone"
  | "trust_contributor_linked"
  | "achievement_earned"
  | "milestone_reached"
  | "years_good_standing"
  | "legacy_recognition";

/** Positive milestone entry — narrative evolution, not complete audit history. */
export type TrustTimelineEvent = {
  eventId: string;
  passportId: string;
  category: TrustTimelineEventCategory;
  headline: string;
  summary: string;
  occurredAt: string;
  originProduct: PassportProductId | "stankings";
  /** Optional link to achievement or milestone id. */
  milestoneRef: string | null;
  achievementRef: string | null;
  auditRef: string | null;
};

export type PassportTrustTimeline = {
  passportId: string;
  events: TrustTimelineEvent[];
  /** Timeline is curated milestones — audit holds complete history. */
  curated: true;
  generatedAt: string;
};

/** Future timeline API — not implemented. */
export interface PassportTrustTimelineClient {
  appendMilestone(event: Omit<TrustTimelineEvent, "eventId">): Promise<TrustTimelineEvent>;
  getTimeline(passportId: string): Promise<PassportTrustTimeline | null>;
}

/** Placeholder — returns empty curated timeline until milestone engine ships. */
export function buildPlaceholderTrustTimeline(passportId: string): PassportTrustTimeline {
  return {
    passportId,
    events: [],
    curated: true,
    generatedAt: new Date().toISOString()
  };
}
