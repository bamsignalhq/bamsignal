/** Global Relationship Map™ — worldwide legacy visualization architecture. */

import { JOURNEY_ACROSS_BORDERS_LABEL } from "./diasporaCorridors";

export const GLOBAL_RELATIONSHIP_MAP_TITLE = "Global Relationship Map™";
export const GLOBAL_RELATIONSHIP_MAP_SUBCOPY =
  "Journey Across Borders — BamSignal's worldwide legacy prepared with dignity.";
export const GLOBAL_RELATIONSHIP_MAP_LABEL = "Global Relationship Map";
export const COMMUNITIES_CONNECTED_LABEL = "Communities Connected";

export const GLOBAL_RELATIONSHIP_MAP_PURPOSE_COPY =
  "Visualize BamSignal's worldwide legacy — cities, communities, and corridors connected with care.";
export const GLOBAL_RELATIONSHIP_MAP_RESERVED_COPY =
  "Architecture prepared. Interactive world map, legacy families, success stories, and events are not enabled yet.";
export const GLOBAL_RELATIONSHIP_MAP_STATIC_COPY =
  "Static architecture preview — not an interactive map yet.";

/** Reserved — never use in member-facing copy. */
export const GLOBAL_RELATIONSHIP_MAP_AVOID_COPY = ["Heat Map", "User Distribution"] as const;

export { JOURNEY_ACROSS_BORDERS_LABEL };

export type RelationshipMapLayerId =
  | "cities"
  | "communities"
  | "legacy-cities"
  | "founders-cities";

export const RELATIONSHIP_MAP_LAYER_LABELS: Record<RelationshipMapLayerId, string> = {
  cities: "Cities",
  communities: "Communities",
  "legacy-cities": "Legacy cities",
  "founders-cities": "Founders cities"
};

export type RelationshipMapFutureCapabilityId =
  | "interactive-world-map"
  | "legacy-families"
  | "success-stories"
  | "events";

export const RELATIONSHIP_MAP_FUTURE_CAPABILITIES: {
  id: RelationshipMapFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "interactive-world-map",
    label: "Interactive world map",
    description: "Reserved — interactive legacy map with dignity and consent."
  },
  {
    id: "legacy-families",
    label: "Legacy families",
    description: "Reserved — legacy families on the worldwide map."
  },
  {
    id: "success-stories",
    label: "Success stories",
    description: "Reserved — consent-first success stories across corridors."
  },
  {
    id: "events",
    label: "Events",
    description: "Reserved — Signal Events™ on the global relationship map."
  }
];

export type FoundersCitySlug = "lagos" | "abuja" | "london" | "toronto";

export type FoundersCityDefinition = {
  slug: FoundersCitySlug;
  title: string;
  description: string;
};

/** Architecture preview — founders cities tied to earliest Signal Concierge stories. */
export const FOUNDERS_CITIES: FoundersCityDefinition[] = [
  {
    slug: "lagos",
    title: "Lagos Founders City",
    description: "Nigeria flagship — celebrating the first stories."
  },
  {
    slug: "abuja",
    title: "Abuja Founders City",
    description: "Capital founders heritage — earliest couples honored."
  },
  {
    slug: "london",
    title: "London Founders City",
    description: "Diaspora founders city — Journey Across Borders."
  },
  {
    slug: "toronto",
    title: "Toronto Founders City",
    description: "Canadian diaspora — founders couples recognized with care."
  }
];

export type RelationshipMapCorridorEntry = {
  id: string;
  routeLabel: string;
  originLabel: string;
  destinationLabel: string;
  statusLabel: string;
  communityMaturity: string;
};

export function relationshipMapLayerLabel(layer: RelationshipMapLayerId): string {
  return RELATIONSHIP_MAP_LAYER_LABELS[layer];
}
