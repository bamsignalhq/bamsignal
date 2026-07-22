/**
 * Legacy Model — recognition that emerges over time, never calculated directly.
 *
 * @see docs/architecture/LEGACY_ARCHITECTURE.md
 */

import type { LegacyBadgeRecord } from "./badges";
import type { LegacyContributionRecord } from "./contributions";
import type { PassportLegacyTimeline } from "./timeline";

/**
 * Legacy recognition status — emerges from sustained participation.
 * Not a score. Not a lifecycle stage. Not a trust dimension.
 */
export type LegacyRecognitionStatus =
  | "not_yet_emerged"
  | "emerging"
  | "recognized"
  | "under_review";

export type LegacySnapshot = {
  passportId: string;
  status: LegacyRecognitionStatus;
  /** Human-readable summary — what has this person contributed? */
  contributionSummary: string;
  contributions: LegacyContributionRecord[];
  badges: LegacyBadgeRecord[];
  timeline: PassportLegacyTimeline;
  /** SKL = Stankings Legacy — individual namespace encodes lifelong journey. */
  stewardshipNotice: string;
  /** Legacy emerges — never directly calculated in client code. */
  derived: false;
  generatedAt: string;
};

/** Full architecture stack position — documented layer order. */
export const PASSPORT_ARCHITECTURE_LAYERS = [
  "identity",
  "verification",
  "trust",
  "reputation",
  "audit",
  "journey",
  "timeline",
  "achievements",
  "legacy"
] as const;

export type PassportArchitectureLayer = (typeof PASSPORT_ARCHITECTURE_LAYERS)[number];

export function buildPlaceholderLegacySnapshot(passportId: string): LegacySnapshot {
  return {
    passportId,
    status: "not_yet_emerged",
    contributionSummary:
      "Legacy recognition emerges from years of verified participation and meaningful contribution. " +
      "It cannot be purchased, granted arbitrarily, or inherited.",
    contributions: [],
    badges: [],
    timeline: {
      passportId,
      events: [],
      horizon: "legacy",
      generatedAt: new Date().toISOString()
    },
    stewardshipNotice:
      "Legacy represents stewardship rather than status — what remains after decades of trustworthy participation.",
    derived: false,
    generatedAt: new Date().toISOString()
  };
}
