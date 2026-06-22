import {
  FUTURE_READY_TRUST_MILESTONE_CAPABILITIES,
  PREPARED_TRUST_MILESTONE_HONORS
} from "../constants/trustMilestones";
import {
  listArchitectureLegacyContributors,
  listArchitectureTrustJourneyTimelines,
  listArchitectureTrustMilestoneHonors,
  type LegacyContributorViewModel,
  type TrustJourneyTimelineViewModel,
  type TrustMilestoneHonorViewModel
} from "./trustMilestonesLogic";

export type TrustMilestonesBundle = {
  honors: TrustMilestoneHonorViewModel[];
  contributors: LegacyContributorViewModel[];
  journeys: TrustJourneyTimelineViewModel[];
  honorCount: number;
  futureReadyCapabilityCount: number;
};

export function getTrustMilestonesBundle(): TrustMilestonesBundle {
  return {
    honors: listArchitectureTrustMilestoneHonors(),
    contributors: listArchitectureLegacyContributors(),
    journeys: listArchitectureTrustJourneyTimelines(),
    honorCount: PREPARED_TRUST_MILESTONE_HONORS.length,
    futureReadyCapabilityCount: FUTURE_READY_TRUST_MILESTONE_CAPABILITIES.length
  };
}

export function getTrustMilestoneHonor(honorId: string): TrustMilestoneHonorViewModel | null {
  return listArchitectureTrustMilestoneHonors().find((honor) => honor.id === honorId) ?? null;
}
