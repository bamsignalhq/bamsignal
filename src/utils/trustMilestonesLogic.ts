import type {
  PreparedLegacyContributorDefinition,
  PreparedLegacyContributorId,
  PreparedTrustMilestoneHonorDefinition,
  PreparedTrustMilestoneHonorId,
  TrustJourneyTimelineEntry
} from "../constants/trustMilestones";
import {
  PREPARED_LEGACY_CONTRIBUTORS,
  PREPARED_TRUST_JOURNEY_TIMELINE_ENTRIES,
  PREPARED_TRUST_MILESTONE_HONORS,
  TRUST_JOURNEY_LABEL
} from "../constants/trustMilestones";

export type TrustMilestoneHonorViewModel = {
  id: PreparedTrustMilestoneHonorId;
  title: string;
  description: string;
  journeySummary: string;
  statusLabel: string;
};

export type LegacyContributorViewModel = {
  id: PreparedLegacyContributorId;
  name: string;
  title: string;
  focus: string;
  honorTitle: string;
  stewardLabel: string;
  statusLabel: string;
};

export type TrustJourneyTimelineViewModel = {
  honorId: PreparedTrustMilestoneHonorId;
  honorTitle: string;
  trustJourneyLabel: string;
  entries: TrustJourneyTimelineEntry[];
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildTrustMilestoneHonorViewModel(
  honor: PreparedTrustMilestoneHonorDefinition
): TrustMilestoneHonorViewModel {
  return {
    id: honor.id,
    title: honor.title,
    description: honor.description,
    journeySummary: honor.journeySummary,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildLegacyContributorViewModel(
  contributor: PreparedLegacyContributorDefinition
): LegacyContributorViewModel {
  const honor = PREPARED_TRUST_MILESTONE_HONORS.find((item) => item.id === contributor.honorId);
  return {
    id: contributor.id,
    name: contributor.name,
    title: contributor.title,
    focus: contributor.focus,
    honorTitle: honor?.title ?? contributor.honorId,
    stewardLabel: contributor.stewardLabel,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildTrustJourneyTimelineViewModel(
  honorId: PreparedTrustMilestoneHonorId
): TrustJourneyTimelineViewModel {
  const honor = PREPARED_TRUST_MILESTONE_HONORS.find((item) => item.id === honorId);
  return {
    honorId,
    honorTitle: honor?.title ?? honorId,
    trustJourneyLabel: TRUST_JOURNEY_LABEL,
    entries: PREPARED_TRUST_JOURNEY_TIMELINE_ENTRIES.filter((entry) => entry.honorId === honorId),
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureTrustMilestoneHonors(): TrustMilestoneHonorViewModel[] {
  return [...PREPARED_TRUST_MILESTONE_HONORS.map(buildTrustMilestoneHonorViewModel)];
}

export function listArchitectureLegacyContributors(): LegacyContributorViewModel[] {
  return [...PREPARED_LEGACY_CONTRIBUTORS.map(buildLegacyContributorViewModel)];
}

export function listArchitectureTrustJourneyTimelines(): TrustJourneyTimelineViewModel[] {
  return PREPARED_TRUST_MILESTONE_HONORS.map((honor) => buildTrustJourneyTimelineViewModel(honor.id));
}
