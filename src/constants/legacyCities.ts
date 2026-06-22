/** Legacy Cities™ — long-term community identity architecture. */

import type { CommunityMaturityLevelId } from "./globalCommunityRankings";
import {
  COMMUNITY_JOURNEY_LABEL,
  COMMUNITY_MATURITY_LEVELS,
  GROWING_TOGETHER_LABEL,
  communityMaturityLevelLabel
} from "./globalCommunityRankings";

export const LEGACY_CITIES_TITLE = "Legacy Cities™";
export const LEGACY_CITIES_SUBCOPY =
  "Community Journey — long-term community identity prepared with dignity.";
export const LEGACY_CITY_LABEL = "Legacy City";
export const LEGACY_COMMUNITY_IDENTITY_LABEL = "Community Identity";

export const LEGACY_CITIES_PURPOSE_COPY =
  "Prepare long-term community identity — growing together, never competing.";
export const LEGACY_CITIES_RESERVED_COPY =
  "Architecture prepared. Events, anniversary celebrations, couple dinners, legacy families, founders couples, and community ambassadors are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const LEGACY_CITIES_AVOID_COPY = ["Top City", "Leaderboard"] as const;

export { COMMUNITY_MATURITY_LEVELS, COMMUNITY_JOURNEY_LABEL, GROWING_TOGETHER_LABEL, communityMaturityLevelLabel };
export type { CommunityMaturityLevelId };

export type LegacyCityFutureCapabilityId =
  | "events"
  | "anniversary-celebrations"
  | "couple-dinners"
  | "legacy-families"
  | "founders-couples"
  | "community-ambassadors";

export const LEGACY_CITY_FUTURE_CAPABILITIES: {
  id: LegacyCityFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "events",
    label: "Events",
    description: "Reserved — Signal Events™ gatherings for legacy cities."
  },
  {
    id: "anniversary-celebrations",
    label: "Anniversary celebrations",
    description: "Reserved — milestone celebrations with dignity."
  },
  {
    id: "couple-dinners",
    label: "Couple dinners",
    description: "Reserved — intimate couple dinners in legacy communities."
  },
  {
    id: "legacy-families",
    label: "Legacy families",
    description: "Reserved — legacy families honored locally."
  },
  {
    id: "founders-couples",
    label: "Founders couples",
    description: "Reserved — founders couples recognized with care."
  },
  {
    id: "community-ambassadors",
    label: "Community ambassadors",
    description: "Reserved — local ambassadors for community identity."
  }
];

export type PreparedLegacyCitySlug =
  | "lagos"
  | "abuja"
  | "london"
  | "toronto"
  | "houston"
  | "atlanta"
  | "dubai"
  | "johannesburg"
  | "sydney";

export type LegacyCityDefinition = {
  slug: PreparedLegacyCitySlug;
  title: string;
  description: string;
  communityLevel: CommunityMaturityLevelId;
};

export const PREPARED_LEGACY_CITIES: LegacyCityDefinition[] = [
  {
    slug: "lagos",
    title: "Lagos Legacy Community",
    description: "Nigeria's flagship — a legacy city growing together.",
    communityLevel: "legacy-community"
  },
  {
    slug: "abuja",
    title: "Abuja Legacy Community",
    description: "Capital community identity — warm and intentional.",
    communityLevel: "premium-community"
  },
  {
    slug: "london",
    title: "London Legacy Community",
    description: "Diaspora legacy city — community journey across borders.",
    communityLevel: "premium-community"
  },
  {
    slug: "toronto",
    title: "Toronto Legacy Community",
    description: "Canadian diaspora — active community identity prepared.",
    communityLevel: "active-community"
  },
  {
    slug: "houston",
    title: "Houston Legacy Community",
    description: "Texas diaspora — growing together with care.",
    communityLevel: "growing-community"
  },
  {
    slug: "atlanta",
    title: "Atlanta Legacy Community",
    description: "Southern diaspora — community journey in progress.",
    communityLevel: "growing-community"
  },
  {
    slug: "dubai",
    title: "Dubai Legacy Community",
    description: "UAE diaspora — active legacy city architecture.",
    communityLevel: "active-community"
  },
  {
    slug: "johannesburg",
    title: "Johannesburg Legacy Community",
    description: "South Africa — emerging community identity prepared.",
    communityLevel: "emerging-community"
  },
  {
    slug: "sydney",
    title: "Sydney Legacy Community",
    description: "Australia diaspora — growing legacy community.",
    communityLevel: "growing-community"
  }
];

export type LegacyCityTimelineEntry = {
  id: string;
  citySlug: PreparedLegacyCitySlug;
  label: string;
  recordedAt: string;
  note?: string;
};

export type LegacyCityDisplayId =
  | "region"
  | "community-level"
  | "identity"
  | "diaspora"
  | "ambassadors";

export function getPreparedLegacyCity(slug: PreparedLegacyCitySlug): LegacyCityDefinition | undefined {
  return PREPARED_LEGACY_CITIES.find((city) => city.slug === slug);
}
