import { CONCIERGE_JOURNEY_MILESTONE_SEED } from "../data/conciergeJourneyMilestoneSeed";
import { LOVE_THROUGH_YEARS_ARCHITECTURE_JOURNEY_ID } from "../data/loveThroughYearsSeed";
import type { LegacyQuoteEntry } from "../constants/relationshipLegacyQuotes";
import {
  buildLoveThroughYearsPhotoSlots,
  buildLoveThroughYearsTimeline,
  countReachedPhases,
  filterLegacyQuotesForJourney,
  type LoveThroughYearsTimelineRow
} from "./loveThroughYearsLogic";
import { ensureJourneyMilestoneTimeline } from "./journeyMilestoneStore";
import { getRelationshipLegacyQuotesArchitectureTimeline } from "./RelationshipLegacyQuotesEngine";
import type { LoveThroughYearsPhotoSlot } from "../constants/loveThroughYears";

export type LoveThroughYearsBundle = {
  journeyId: string;
  timeline: LoveThroughYearsTimelineRow[];
  reachedCount: number;
  photoSlots: LoveThroughYearsPhotoSlot[];
  quotes: LegacyQuoteEntry[];
};

function resolveMilestones(journeyId: string) {
  const seeded = CONCIERGE_JOURNEY_MILESTONE_SEED.find((item) => item.journeyId === journeyId);
  if (seeded) return seeded.milestones;
  return ensureJourneyMilestoneTimeline(journeyId).milestones;
}

export function getLoveThroughYearsBundle(journeyId: string): LoveThroughYearsBundle {
  const milestones = resolveMilestones(journeyId);
  const timeline = buildLoveThroughYearsTimeline(milestones);
  const quotes = filterLegacyQuotesForJourney(
    getRelationshipLegacyQuotesArchitectureTimeline(),
    journeyId
  );

  return {
    journeyId,
    timeline,
    reachedCount: countReachedPhases(timeline),
    photoSlots: buildLoveThroughYearsPhotoSlots(timeline),
    quotes
  };
}

export function getLoveThroughYearsArchitectureBundle(): LoveThroughYearsBundle {
  return getLoveThroughYearsBundle(LOVE_THROUGH_YEARS_ARCHITECTURE_JOURNEY_ID);
}
