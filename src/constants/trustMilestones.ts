/** Trust Milestones™ — long-term stewardship celebration architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const TRUST_MILESTONES_TITLE = "Trust Milestones™";
export const TRUST_MILESTONES_LABEL = "Trust Milestones";
export const TRUST_MILESTONE_ITEM_LABEL = "Trust Milestone";
export const LEGACY_CONTRIBUTOR_LABEL = "Legacy Contributor";
export const TRUST_JOURNEY_LABEL = "Trust Journey";
export const LIFETIME_STEWARD_LABEL = "Lifetime Steward";

export const TRUST_MILESTONES_GOOD_COPY = [
  "Trust Journey",
  "Legacy Contributor",
  "Lifetime Steward"
] as const;

export const TRUST_MILESTONES_FORBIDDEN_COPY = ["Years Worked", "Employee Badge"] as const;

export const TRUST_MILESTONES_SUBCOPY =
  "Celebrate long-term stewardship — Trust Journey milestones with dignity, never employee badges or years-worked tallies.";
export const TRUST_MILESTONES_PURPOSE_COPY =
  "Prepare trust milestones architecture — stewardship honours reserved, not awards or celebrations yet.";
export const TRUST_MILESTONES_RESERVED_COPY =
  "Architecture prepared. Trust milestones, journey timelines, and legacy contributor profiles are not enabled yet.";
export const TRUST_MILESTONES_FUTURE_READY_COPY =
  "Future-ready capabilities documented only — awards, recognition dinners, and legacy celebrations are not implemented.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type FutureReadyTrustMilestoneCapabilityId =
  | "awards"
  | "recognition-dinners"
  | "legacy-celebrations";

export type FutureReadyTrustMilestoneCapabilityDefinition = {
  id: FutureReadyTrustMilestoneCapabilityId;
  title: string;
  description: string;
};

export const FUTURE_READY_TRUST_MILESTONE_CAPABILITIES: FutureReadyTrustMilestoneCapabilityDefinition[] =
  [
    {
      id: "awards",
      title: "Awards",
      description: "Stewardship awards — architecture reserved, not implemented."
    },
    {
      id: "recognition-dinners",
      title: "Recognition dinners",
      description: "Recognition dinners — architecture reserved, not implemented."
    },
    {
      id: "legacy-celebrations",
      title: "Legacy celebrations",
      description: "Legacy celebrations — architecture reserved, not implemented."
    }
  ];

export type PreparedTrustMilestoneHonorId =
  | "one-year-trusted"
  | "five-years-trusted"
  | "ten-years-trusted"
  | "founders-trust"
  | "legacy-trusted"
  | "lifetime-contributor";

export type PreparedTrustMilestoneHonorDefinition = {
  id: PreparedTrustMilestoneHonorId;
  title: string;
  description: string;
  contributorId: string;
  journeySummary: string;
};

export const PREPARED_TRUST_MILESTONE_HONORS: PreparedTrustMilestoneHonorDefinition[] = [
  {
    id: "one-year-trusted",
    title: "1 Year Trusted",
    description: "1 Year Trusted — first chapter of the Trust Journey honoured.",
    contributorId: "tms_contributor_one_year",
    journeySummary: "Trust Journey: one year of dependable stewardship."
  },
  {
    id: "five-years-trusted",
    title: "5 Years Trusted",
    description: "5 Years Trusted — sustained presence on the Trust Journey.",
    contributorId: "tms_contributor_five_years",
    journeySummary: "Trust Journey: five years of consistent stewardship."
  },
  {
    id: "ten-years-trusted",
    title: "10 Years Trusted",
    description: "10 Years Trusted — decade of trusted guidance celebrated.",
    contributorId: "tms_contributor_ten_years",
    journeySummary: "Trust Journey: ten years of lasting contribution."
  },
  {
    id: "founders-trust",
    title: "Founders Trust",
    description: "Founders Trust — pioneers who shaped the stewardship path.",
    contributorId: "tms_contributor_founders",
    journeySummary: "Trust Journey: founders honoured for early stewardship."
  },
  {
    id: "legacy-trusted",
    title: "Legacy Trusted",
    description: "Legacy Trusted — impact recognised across generations.",
    contributorId: "tms_contributor_legacy",
    journeySummary: "Trust Journey: legacy standing with community confidence."
  },
  {
    id: "lifetime-contributor",
    title: "Lifetime Contributor",
    description: "Lifetime Contributor — Lifetime Steward honoured for enduring service.",
    contributorId: "tms_contributor_lifetime",
    journeySummary: "Trust Journey: lifetime stewardship celebrated with dignity."
  }
];

export type PreparedLegacyContributorId =
  | "tms_contributor_one_year"
  | "tms_contributor_five_years"
  | "tms_contributor_ten_years"
  | "tms_contributor_founders"
  | "tms_contributor_legacy"
  | "tms_contributor_lifetime";

export type PreparedLegacyContributorDefinition = {
  id: PreparedLegacyContributorId;
  name: string;
  title: string;
  focus: string;
  honorId: PreparedTrustMilestoneHonorId;
  stewardLabel: string;
};

export const PREPARED_LEGACY_CONTRIBUTORS: PreparedLegacyContributorDefinition[] =
  PREPARED_TRUST_MILESTONE_HONORS.map((honor) => ({
    id: honor.contributorId as PreparedLegacyContributorId,
    name: "Reserved contributor",
    title: `${honor.title} profile`,
    focus: honor.description,
    honorId: honor.id,
    stewardLabel:
      honor.id === "lifetime-contributor" ? LIFETIME_STEWARD_LABEL : LEGACY_CONTRIBUTOR_LABEL
  }));

export type TrustJourneyTimelineEntry = {
  id: string;
  honorId: PreparedTrustMilestoneHonorId;
  label: string;
  recordedAt: string;
  note?: string;
};

export const PREPARED_TRUST_JOURNEY_TIMELINE_ENTRIES: TrustJourneyTimelineEntry[] =
  PREPARED_TRUST_MILESTONE_HONORS.map((honor, index) => ({
    id: `tms_journey_${honor.id}`,
    honorId: honor.id,
    label: `${TRUST_JOURNEY_LABEL}: ${honor.title}`,
    recordedAt: new Date(Date.UTC(2026, 0, 1 + index, 12, 0, 0)).toISOString(),
    note: "Architecture preview — stewardship milestone not live yet."
  }));

export function getPreparedTrustMilestoneHonor(
  honorId: PreparedTrustMilestoneHonorId
): PreparedTrustMilestoneHonorDefinition | undefined {
  return PREPARED_TRUST_MILESTONE_HONORS.find((honor) => honor.id === honorId);
}

export function getTrustJourneyEntriesForHonor(honorId: PreparedTrustMilestoneHonorId): TrustJourneyTimelineEntry[] {
  return PREPARED_TRUST_JOURNEY_TIMELINE_ENTRIES.filter((entry) => entry.honorId === honorId);
}
