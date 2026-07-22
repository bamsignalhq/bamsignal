/**
 * Passport Journey — the user's narrative across the Stankings ecosystem.
 * Document architecture only; no UI in this sprint.
 *
 * @see docs/architecture/TRUST_EVOLUTION_MODEL.md
 */

import type { PassportLifecycleStageId } from "./lifecycle";
import type { TrustTimelineEvent } from "./timeline";

export type PassportJourneySectionId =
  | "identity"
  | "verification"
  | "trust"
  | "products_joined"
  | "achievements"
  | "milestones"
  | "years_active"
  | "future_contributions";

export type PassportJourneySection = {
  id: PassportJourneySectionId;
  label: string;
  description: string;
};

export const PASSPORT_JOURNEY_SECTIONS: readonly PassportJourneySection[] = [
  {
    id: "identity",
    label: "Identity",
    description: "Immutable Passport ID and core identity snapshot"
  },
  {
    id: "verification",
    label: "Verification",
    description: "Verification milestones completed over time"
  },
  {
    id: "trust",
    label: "Trust",
    description: "Multi-dimensional trust evolution — never one life score"
  },
  {
    id: "products_joined",
    label: "Products joined",
    description: "Stankings products connected to this Passport"
  },
  {
    id: "achievements",
    label: "Achievements",
    description: "Positive milestone badges — do not directly affect trust"
  },
  {
    id: "milestones",
    label: "Milestones",
    description: "Registered participation milestones across the ecosystem"
  },
  {
    id: "years_active",
    label: "Years active",
    description: "Duration of positive ecosystem participation"
  },
  {
    id: "future_contributions",
    label: "Future contributions",
    description: "Reserved contributors and dimensions not yet active"
  }
] as const;

/** Architecture contract for future Passport Journey dashboard. */
export type PassportJourneySnapshot = {
  passportId: string;
  lifecycleStage: PassportLifecycleStageId | null;
  sections: PassportJourneySectionId[];
  timelinePreview: TrustTimelineEvent[];
  narrativeSummary: string;
  generatedAt: string;
};

export function buildPlaceholderPassportJourney(passportId: string): PassportJourneySnapshot {
  return {
    passportId,
    lifecycleStage: "registered",
    sections: PASSPORT_JOURNEY_SECTIONS.map((s) => s.id),
    timelinePreview: [],
    narrativeSummary:
      "Your Stankings Digital Trust Passport journey will appear here as you participate " +
      "positively across the ecosystem — identity is permanent; trust evolves.",
    generatedAt: new Date().toISOString()
  };
}
