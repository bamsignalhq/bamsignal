import { milestoneYearFromDate } from "../constants/journeyMilestones";
import {
  LOVE_THROUGH_YEARS_PHASES,
  type LoveThroughYearsPhaseId,
  type LoveThroughYearsPhotoSlot
} from "../constants/loveThroughYears";
import type { LegacyQuoteEntry } from "../constants/relationshipLegacyQuotes";
import type { JourneyMilestoneEntry } from "../types/journeyMilestone";

export type LoveThroughYearsTimelineRow = {
  phaseId: LoveThroughYearsPhaseId;
  label: string;
  reached: boolean;
  milestoneAt?: string;
  year?: string;
  note?: string;
};

export function buildLoveThroughYearsTimeline(
  milestones: JourneyMilestoneEntry[]
): LoveThroughYearsTimelineRow[] {
  const byMilestoneId = new Map(milestones.map((entry) => [entry.id, entry]));

  return LOVE_THROUGH_YEARS_PHASES.map((phase) => {
    const entry = byMilestoneId.get(phase.milestoneId);
    return {
      phaseId: phase.id,
      label: phase.label,
      reached: Boolean(entry),
      milestoneAt: entry?.milestoneAt,
      year: entry?.milestoneAt ? milestoneYearFromDate(entry.milestoneAt) : undefined,
      note: entry?.note
    };
  });
}

export function buildLoveThroughYearsPhotoSlots(
  timeline: LoveThroughYearsTimelineRow[]
): LoveThroughYearsPhotoSlot[] {
  return timeline.map((row) => ({
    id: `lty_photo_${row.phaseId}`,
    phaseId: row.phaseId,
    label: row.label,
    status: "reserved" as const
  }));
}

export function filterLegacyQuotesForJourney(
  quotes: LegacyQuoteEntry[],
  journeyId: string
): LegacyQuoteEntry[] {
  return quotes.filter((quote) => quote.journeyId === journeyId);
}

export function countReachedPhases(timeline: LoveThroughYearsTimelineRow[]): number {
  return timeline.filter((row) => row.reached).length;
}
