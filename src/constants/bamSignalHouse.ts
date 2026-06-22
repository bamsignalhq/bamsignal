/** The BamSignal House™ — physical spaces around the world architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const BAMSIGNAL_HOUSE_TITLE = "The BamSignal House™";
export const BAMSIGNAL_HOUSE_LABEL = "The BamSignal House";
export const HOUSE_LOCATION_LABEL = "House Location";
export const HOUSE_EXPERIENCE_LABEL = "House Experience";
export const HOUSE_TIMELINE_LABEL = "House Timeline";
export const HOUSE_PRINCIPLE_LABEL = "House Principle";

export const BAMSIGNAL_HOUSE_GOOD_COPY = [
  "The BamSignal House™",
  "Home",
  "Gather",
  "Celebrate",
  "Legacy",
  "Community"
] as const;

export const BAMSIGNAL_HOUSE_FORBIDDEN_COPY = ["Headquarters", "Campus", "Office", "Branch"] as const;

export const BAMSIGNAL_HOUSE_SUBCOPY =
  "Physical spaces around the world — Home to Gather, Celebrate, and build Legacy with Community, never headquarters or branch offices.";
export const BAMSIGNAL_HOUSE_PURPOSE_COPY =
  "Prepare physical spaces architecture — founding houses, experiences, and timelines reserved, not openings yet.";
export const BAMSIGNAL_HOUSE_RESERVED_COPY =
  "Architecture prepared. House locations, experiences, timelines, and principles are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedFoundingHouseId =
  | "lagos"
  | "abuja"
  | "london"
  | "toronto"
  | "houston"
  | "atlanta"
  | "dubai"
  | "johannesburg"
  | "sydney";

export type PreparedFoundingHouseDefinition = {
  id: PreparedFoundingHouseId;
  title: string;
  description: string;
  timelineId: string;
};

export const PREPARED_FOUNDING_HOUSES: PreparedFoundingHouseDefinition[] = [
  {
    id: "lagos",
    title: "Lagos",
    description: "Lagos — founding House to Gather and Celebrate, not a headquarters.",
    timelineId: "bsho_timeline_lagos"
  },
  {
    id: "abuja",
    title: "Abuja",
    description: "Abuja — Home for Community and Legacy across Nigeria.",
    timelineId: "bsho_timeline_abuja"
  },
  {
    id: "london",
    title: "London",
    description: "London — diaspora House to Gather with dignity, not a branch office.",
    timelineId: "bsho_timeline_london"
  },
  {
    id: "toronto",
    title: "Toronto",
    description: "Toronto — North American Home for families and Community.",
    timelineId: "bsho_timeline_toronto"
  },
  {
    id: "houston",
    title: "Houston",
    description: "Houston — founding House for Celebrate and Legacy.",
    timelineId: "bsho_timeline_houston"
  },
  {
    id: "atlanta",
    title: "Atlanta",
    description: "Atlanta — Community House reserved, not a campus.",
    timelineId: "bsho_timeline_atlanta"
  },
  {
    id: "dubai",
    title: "Dubai",
    description: "Dubai — cross-continental Home to Gather and Celebrate.",
    timelineId: "bsho_timeline_dubai"
  },
  {
    id: "johannesburg",
    title: "Johannesburg",
    description: "Johannesburg — African House for Legacy and Community.",
    timelineId: "bsho_timeline_johannesburg"
  },
  {
    id: "sydney",
    title: "Sydney",
    description: "Sydney — Pacific Home for families, not an office.",
    timelineId: "bsho_timeline_sydney"
  }
];

export type PreparedHouseExperienceId = "home" | "gather" | "celebrate" | "legacy" | "community";

export type PreparedHouseExperienceDefinition = {
  id: PreparedHouseExperienceId;
  title: string;
  description: string;
};

export const PREPARED_HOUSE_EXPERIENCES: PreparedHouseExperienceDefinition[] = [
  {
    id: "home",
    title: "Home",
    description: "Home — warm welcome at The BamSignal House™, not a corporate office."
  },
  {
    id: "gather",
    title: "Gather",
    description: "Gather — community spaces to meet with dignity."
  },
  {
    id: "celebrate",
    title: "Celebrate",
    description: "Celebrate — milestones honoured in physical spaces."
  },
  {
    id: "legacy",
    title: "Legacy",
    description: "Legacy — multi-generational gatherings reserved."
  },
  {
    id: "community",
    title: "Community",
    description: "Community — local stewardship, not a branch network."
  }
];

export type PreparedHousePrincipleId =
  | "the-bamsignal-house"
  | "home"
  | "gather"
  | "celebrate"
  | "legacy"
  | "community";

export type PreparedHousePrincipleDefinition = {
  id: PreparedHousePrincipleId;
  title: string;
  description: string;
};

export const PREPARED_HOUSE_PRINCIPLES: PreparedHousePrincipleDefinition[] =
  BAMSIGNAL_HOUSE_GOOD_COPY.map((title) => {
    const idByTitle: Record<string, PreparedHousePrincipleId> = {
      "The BamSignal House™": "the-bamsignal-house",
      Home: "home",
      Gather: "gather",
      Celebrate: "celebrate",
      Legacy: "legacy",
      Community: "community"
    };
    return {
      id: idByTitle[title],
      title,
      description: `${title} — House principle reserved, not ${BAMSIGNAL_HOUSE_FORBIDDEN_COPY[0].toLowerCase()} language.`
    };
  });

export type HouseTimelineEntry = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export type PreparedHouseTimelineId =
  | "bsho_timeline_lagos"
  | "bsho_timeline_abuja"
  | "bsho_timeline_london"
  | "bsho_timeline_toronto"
  | "bsho_timeline_houston"
  | "bsho_timeline_atlanta"
  | "bsho_timeline_dubai"
  | "bsho_timeline_johannesburg"
  | "bsho_timeline_sydney";

export type PreparedHouseTimelineDefinition = {
  id: PreparedHouseTimelineId;
  title: string;
  summary: string;
  houseId: PreparedFoundingHouseId;
  entries: HouseTimelineEntry[];
};

export const PREPARED_HOUSE_TIMELINES: PreparedHouseTimelineDefinition[] =
  PREPARED_FOUNDING_HOUSES.map((house, index) => ({
    id: house.timelineId as PreparedHouseTimelineId,
    title: `${HOUSE_TIMELINE_LABEL}: ${house.title}`,
    summary: `Founding House timeline for ${house.title} — architecture preview.`,
    houseId: house.id,
    entries: [
      {
        id: `bsho_timeline_entry_${house.id}`,
        label: "Founding House milestone reserved",
        recordedAt: new Date(Date.UTC(2026, 0, 1 + index, 12, 0, 0)).toISOString(),
        note: "Architecture preview — house opening not scheduled yet."
      }
    ]
  }));

export function getPreparedFoundingHouse(
  houseId: PreparedFoundingHouseId
): PreparedFoundingHouseDefinition | undefined {
  return PREPARED_FOUNDING_HOUSES.find((house) => house.id === houseId);
}
