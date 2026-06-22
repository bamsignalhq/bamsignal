import { milestoneYearFromDate } from "../constants/journeyMilestones";
import type { LegacyExperienceDisplayId } from "../constants/relationshipLegacyExperience";
import { LEGACY_EXPERIENCE_DISPLAY_FIELDS } from "../constants/relationshipLegacyExperience";
import type { LegacyQuoteEntry } from "../constants/relationshipLegacyQuotes";
import type { JourneyMilestoneEntry } from "../types/journeyMilestone";
import { milestoneYearById, type LegacyProfileViewModel } from "./relationshipLegacyIndexLogic";

export type LegacyExperienceDisplayRow = {
  id: LegacyExperienceDisplayId;
  label: string;
  value?: string;
  reached: boolean;
};

export function buildLegacyExperienceDisplayRows(
  profile: LegacyProfileViewModel,
  quotes: LegacyQuoteEntry[] = [],
  milestones: JourneyMilestoneEntry[] = []
): LegacyExperienceDisplayRow[] {
  const anniversarySummary = profile.anniversaryMilestones.length
    ? `${profile.anniversaryMilestones.length} anniversary milestone${
        profile.anniversaryMilestones.length === 1 ? "" : "s"
      }`
    : undefined;
  const familySummary = profile.legacyFamily
    ? `${profile.legacyFamily.childrenCount} children · ${profile.legacyFamily.currentCountry}`
    : undefined;
  const quoteSummary = quotes.length
    ? `${quotes.length} legacy quote${quotes.length === 1 ? "" : "s"}`
    : undefined;

  const values: Partial<Record<LegacyExperienceDisplayId, string>> = {
    "journey-id": profile.journeyId,
    met: profile.metYear,
    relationship: milestoneYearById(milestones, "relationship-formed"),
    engaged: profile.engagedYear,
    married: profile.marriedYear,
    anniversaries: anniversarySummary,
    "family-milestones": familySummary,
    "legacy-quotes": quoteSummary
  };

  return LEGACY_EXPERIENCE_DISPLAY_FIELDS.map((field) => ({
    id: field.id,
    label: field.label,
    value: values[field.id],
    reached: Boolean(values[field.id])
  }));
}

export function formatLegacyMilestoneYear(milestoneAt: string): string {
  return milestoneYearFromDate(milestoneAt);
}
