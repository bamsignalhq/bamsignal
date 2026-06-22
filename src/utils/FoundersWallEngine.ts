import type { JourneyStoryCategoryId } from "../constants/journeyStoryCategories";
import type { FoundersCoupleSeed } from "../constants/foundersWall";
import { CONCIERGE_JOURNEY_MILESTONE_SEED } from "../data/conciergeJourneyMilestoneSeed";
import { CONCIERGE_JOURNEY_STORY_PROFILE_SEED } from "../data/conciergeJourneyStoryProfileSeed";
import { CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED } from "../data/conciergeRelationshipLegacyIndexSeed";
import { FOUNDERS_WALL_ARCHITECTURE_COUPLES } from "../data/foundersWallSeed";
import {
  buildFoundersCoupleViewModel,
  sortFoundersCouples,
  type FoundersCoupleViewModel
} from "./foundersWallLogic";
import { milestoneYearById } from "./relationshipLegacyIndexLogic";
import { ensureJourneyMilestoneTimeline } from "./journeyMilestoneStore";
import { getJourneyStoryProfile } from "./journeyStoryCategories";
import { getRelationshipLegacyIndex } from "./relationshipLegacyIndexStore";

export type FoundersWallBundle = {
  couples: FoundersCoupleViewModel[];
};

function resolveStoryCategoryIds(journeyId: string, fallback: string[]): JourneyStoryCategoryId[] {
  const seeded = CONCIERGE_JOURNEY_STORY_PROFILE_SEED.find((item) => item.journeyId === journeyId);
  const stored = getJourneyStoryProfile(journeyId);
  const categories = stored?.categories?.length
    ? stored.categories
    : seeded?.categories ?? [];
  if (categories.length) {
    return categories.map((entry) => entry.id);
  }
  return fallback as JourneyStoryCategoryId[];
}

function resolveLegacyStatus(journeyId: string, fallback: FoundersCoupleSeed["legacyStatus"]) {
  const stored = getRelationshipLegacyIndex(journeyId);
  const seeded = CONCIERGE_RELATIONSHIP_LEGACY_INDEX_SEED.find((item) => item.journeyId === journeyId);
  return stored?.legacyStatus ?? seeded?.legacyStatus ?? fallback;
}

function resolveYears(journeyId: string, seed: FoundersCoupleSeed) {
  const seededTimeline = CONCIERGE_JOURNEY_MILESTONE_SEED.find((item) => item.journeyId === journeyId);
  const milestones = seededTimeline?.milestones ?? ensureJourneyMilestoneTimeline(journeyId).milestones;
  return {
    yearMet: milestoneYearById(milestones, "met") ?? seed.yearMet,
    marriageYear: milestoneYearById(milestones, "married") ?? seed.marriageYear
  };
}

function buildCoupleFromSeed(seed: FoundersCoupleSeed): FoundersCoupleViewModel {
  const years = resolveYears(seed.journeyId, seed);
  return buildFoundersCoupleViewModel({
    journeyId: seed.journeyId,
    founderOrder: seed.founderOrder,
    yearMet: years.yearMet,
    marriageYear: years.marriageYear,
    storyCategoryIds: resolveStoryCategoryIds(seed.journeyId, seed.storyCategoryIds),
    legacyStatus: resolveLegacyStatus(seed.journeyId, seed.legacyStatus),
    honoredAt: seed.honoredAt
  });
}

export function getFoundersWallBundle(): FoundersWallBundle {
  return {
    couples: sortFoundersCouples(FOUNDERS_WALL_ARCHITECTURE_COUPLES.map(buildCoupleFromSeed))
  };
}

export function getFoundersCouple(journeyId: string): FoundersCoupleViewModel | null {
  const seed = FOUNDERS_WALL_ARCHITECTURE_COUPLES.find((couple) => couple.journeyId === journeyId);
  if (!seed) return null;
  return buildCoupleFromSeed(seed);
}
