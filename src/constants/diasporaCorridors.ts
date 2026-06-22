/** Diaspora Corridors™ — international relationship pathways (human-first). */

export const DIASPORA_CORRIDORS_TITLE = "Diaspora Corridors™";
export const DIASPORA_CORRIDORS_SUBCOPY =
  "Journey Across Borders — global connections rooted in shared dreams.";
export const DIASPORA_CORRIDOR_LABEL = "Diaspora Corridor";
export const JOURNEY_ACROSS_BORDERS_LABEL = "Journey Across Borders";
export const GLOBAL_CONNECTIONS_LABEL = "Global Connections";
export const SHARED_DREAMS_LABEL = "Shared Dreams";

export const DIASPORA_CORRIDORS_PURPOSE_COPY =
  "Prepare international relationship pathways — human-first, relationship-first.";
export const DIASPORA_CORRIDORS_RESERVED_COPY =
  "Architecture prepared. Relocation support, diaspora advisors, and visa partnerships are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const DIASPORA_CORRIDORS_AVOID_COPY = [
  "International Match Market",
  "Migration Dating",
  "Long Distance Funnel"
] as const;

export type CorridorOriginId = "nigeria" | "ghana" | "kenya";

export type CorridorDestinationId =
  | "united-kingdom"
  | "canada"
  | "united-states"
  | "uae"
  | "south-africa"
  | "germany"
  | "ireland"
  | "australia"
  | "france"
  | "netherlands"
  | "belgium"
  | "italy"
  | "scandinavia";

export type CorridorStatusId = "emerging" | "growing" | "active" | "premium" | "legacy";

export type CorridorStatusDefinition = {
  id: CorridorStatusId;
  label: string;
  description: string;
};

export const CORRIDOR_STATUS_DEFINITIONS: CorridorStatusDefinition[] = [
  { id: "emerging", label: "Emerging", description: "A new corridor forming with care." },
  { id: "growing", label: "Growing", description: "Cross-border introductions building steadily." },
  { id: "active", label: "Active", description: "Warm pathways with dignity and intention." },
  { id: "premium", label: "Premium", description: "Reserved — elevated corridor experiences." },
  { id: "legacy", label: "Legacy", description: "Enduring couples and legacy families honored." }
];

export const CORRIDOR_STATUS_LABELS: Record<CorridorStatusId, string> = Object.fromEntries(
  CORRIDOR_STATUS_DEFINITIONS.map((item) => [item.id, item.label])
) as Record<CorridorStatusId, string>;

export const CORRIDOR_ORIGIN_LABELS: Record<CorridorOriginId, string> = {
  nigeria: "Nigeria",
  ghana: "Ghana",
  kenya: "Kenya"
};

export const CORRIDOR_DESTINATION_LABELS: Record<CorridorDestinationId, string> = {
  "united-kingdom": "United Kingdom",
  canada: "Canada",
  "united-states": "United States",
  uae: "UAE",
  "south-africa": "South Africa",
  germany: "Germany",
  ireland: "Ireland",
  australia: "Australia",
  france: "France",
  netherlands: "Netherlands",
  belgium: "Belgium",
  italy: "Italy",
  scandinavia: "Scandinavia"
};

export type DiasporaCorridorDefinition = {
  id: string;
  originId: CorridorOriginId;
  destinationId: CorridorDestinationId;
  status: CorridorStatusId;
  communityMaturity: string;
  successStoriesCount: number;
  legacyFamiliesCount: number;
  prepared: boolean;
};

export type FutureDiasporaCorridorDefinition = {
  id: string;
  originId: CorridorOriginId;
  destinationId: CorridorDestinationId;
};

export const PREPARED_DIASPORA_CORRIDORS: DiasporaCorridorDefinition[] = [
  {
    id: "nigeria-uk",
    originId: "nigeria",
    destinationId: "united-kingdom",
    status: "active",
    communityMaturity: "Growing Community",
    successStoriesCount: 12,
    legacyFamiliesCount: 4,
    prepared: true
  },
  {
    id: "nigeria-canada",
    originId: "nigeria",
    destinationId: "canada",
    status: "growing",
    communityMaturity: "Active Community",
    successStoriesCount: 9,
    legacyFamiliesCount: 3,
    prepared: true
  },
  {
    id: "nigeria-usa",
    originId: "nigeria",
    destinationId: "united-states",
    status: "active",
    communityMaturity: "Active Community",
    successStoriesCount: 14,
    legacyFamiliesCount: 5,
    prepared: true
  },
  {
    id: "nigeria-uae",
    originId: "nigeria",
    destinationId: "uae",
    status: "growing",
    communityMaturity: "Growing Community",
    successStoriesCount: 6,
    legacyFamiliesCount: 2,
    prepared: true
  },
  {
    id: "nigeria-south-africa",
    originId: "nigeria",
    destinationId: "south-africa",
    status: "emerging",
    communityMaturity: "Emerging Community",
    successStoriesCount: 3,
    legacyFamiliesCount: 1,
    prepared: true
  },
  {
    id: "nigeria-germany",
    originId: "nigeria",
    destinationId: "germany",
    status: "growing",
    communityMaturity: "Growing Community",
    successStoriesCount: 5,
    legacyFamiliesCount: 1,
    prepared: true
  },
  {
    id: "nigeria-ireland",
    originId: "nigeria",
    destinationId: "ireland",
    status: "emerging",
    communityMaturity: "Emerging Community",
    successStoriesCount: 4,
    legacyFamiliesCount: 1,
    prepared: true
  },
  {
    id: "nigeria-australia",
    originId: "nigeria",
    destinationId: "australia",
    status: "growing",
    communityMaturity: "Growing Community",
    successStoriesCount: 7,
    legacyFamiliesCount: 2,
    prepared: true
  },
  {
    id: "ghana-uk",
    originId: "ghana",
    destinationId: "united-kingdom",
    status: "growing",
    communityMaturity: "Growing Community",
    successStoriesCount: 5,
    legacyFamiliesCount: 2,
    prepared: true
  },
  {
    id: "ghana-canada",
    originId: "ghana",
    destinationId: "canada",
    status: "emerging",
    communityMaturity: "Emerging Community",
    successStoriesCount: 3,
    legacyFamiliesCount: 1,
    prepared: true
  }
];

export const FUTURE_DIASPORA_CORRIDORS: FutureDiasporaCorridorDefinition[] = [
  { id: "kenya-uk", originId: "kenya", destinationId: "united-kingdom" },
  { id: "kenya-canada", originId: "kenya", destinationId: "canada" },
  { id: "nigeria-france", originId: "nigeria", destinationId: "france" },
  { id: "nigeria-netherlands", originId: "nigeria", destinationId: "netherlands" },
  { id: "nigeria-belgium", originId: "nigeria", destinationId: "belgium" },
  { id: "nigeria-italy", originId: "nigeria", destinationId: "italy" },
  { id: "nigeria-scandinavia", originId: "nigeria", destinationId: "scandinavia" }
];

export type DiasporaCorridorFutureCapability =
  | "relocation-support"
  | "diaspora-advisors"
  | "visa-guidance-partnerships"
  | "family-integration-support"
  | "legacy-communities";

export const DIASPORA_CORRIDOR_FUTURE_CAPABILITIES: {
  id: DiasporaCorridorFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "relocation-support",
    label: "Relocation support",
    description: "Reserved — dignified relocation guidance for couples."
  },
  {
    id: "diaspora-advisors",
    label: "Diaspora advisors",
    description: "Reserved — human-first advisors along each corridor."
  },
  {
    id: "visa-guidance-partnerships",
    label: "Visa guidance partnerships",
    description: "Reserved — trusted partnerships without funnel language."
  },
  {
    id: "family-integration-support",
    label: "Family integration support",
    description: "Reserved — family integration with privacy first."
  },
  {
    id: "legacy-communities",
    label: "Legacy communities",
    description: "Reserved — legacy families honored across borders."
  }
];

export type DiasporaCorridorDisplayId =
  | "origin"
  | "destination"
  | "community-maturity"
  | "success-stories"
  | "legacy-families";

export type DiasporaCorridorTimelineEntry = {
  id: string;
  corridorId: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export function corridorStatusLabel(status: CorridorStatusId): string {
  return CORRIDOR_STATUS_LABELS[status];
}

export function corridorRouteLabel(originId: CorridorOriginId, destinationId: CorridorDestinationId): string {
  return `${CORRIDOR_ORIGIN_LABELS[originId]} ↔ ${CORRIDOR_DESTINATION_LABELS[destinationId]}`;
}

export function getPreparedDiasporaCorridor(id: string): DiasporaCorridorDefinition | undefined {
  return PREPARED_DIASPORA_CORRIDORS.find((corridor) => corridor.id === id);
}
