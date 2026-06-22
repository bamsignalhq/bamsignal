import { FAMILY_MILESTONE_ARCHITECTURE_SEED } from "../constants/familyMilestones";
import { CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED } from "../data/conciergeRelationshipLegacyIndexSeed";
import { LEGACY_FAMILIES_ARCHITECTURE_JOURNEY_ID } from "../data/legacyFamiliesSeed";
import type { FamilyMilestoneTimelineEntry } from "../constants/familyMilestones";
import {
  buildLegacyFamiliesViewModel,
  buildLegacyFamilyDisplayRows,
  type LegacyFamiliesViewModel,
  type LegacyFamilyDisplayRow
} from "./legacyFamiliesLogic";
import { milestoneYearById } from "./relationshipLegacyIndexLogic";
import { ensureJourneyMilestoneTimeline } from "./journeyMilestoneStore";
import { getRelationshipLegacyIndex } from "./relationshipLegacyIndexStore";

export type LegacyFamiliesBundle = {
  journeyId: string;
  family: LegacyFamiliesViewModel;
  displayRows: LegacyFamilyDisplayRow[];
  milestoneEntries: FamilyMilestoneTimelineEntry[];
};

function resolveLegacyIndex(journeyId: string) {
  return (
    getRelationshipLegacyIndex(journeyId) ??
    CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED.find((record) => record.journeyId === journeyId) ??
    null
  );
}

export function getLegacyFamiliesBundle(journeyId: string): LegacyFamiliesBundle {
  const index = resolveLegacyIndex(journeyId);
  const milestones = ensureJourneyMilestoneTimeline(journeyId).milestones;
  const marriedYear = milestoneYearById(milestones, "married");
  const legacyFamily = index?.legacyFamily;

  const family = buildLegacyFamiliesViewModel({
    journeyId,
    marriageYear: marriedYear,
    childrenCount: legacyFamily?.childrenCount ?? 0,
    currentCountry: legacyFamily?.currentCountry ?? "",
    registrationCountry: index?.country ?? "Nigeria",
    legacyIndexStatus: index?.legacyStatus ?? "legacy-family",
    growthHistory: legacyFamily?.history ?? [],
    familyMilestonesCount: FAMILY_MILESTONE_ARCHITECTURE_SEED.length
  });

  return {
    journeyId,
    family,
    displayRows: buildLegacyFamilyDisplayRows(family),
    milestoneEntries: FAMILY_MILESTONE_ARCHITECTURE_SEED
  };
}

export function getLegacyFamiliesArchitectureBundle(): LegacyFamiliesBundle {
  return getLegacyFamiliesBundle(LEGACY_FAMILIES_ARCHITECTURE_JOURNEY_ID);
}
