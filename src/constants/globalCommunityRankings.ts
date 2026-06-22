/** Global Community Rankings™ — community maturity architecture (not popularity). */

export const GLOBAL_COMMUNITY_RANKINGS_TITLE = "Global Community Rankings™";
export const GLOBAL_COMMUNITY_RANKINGS_SUBCOPY =
  "Community Journey — measuring maturity with care, never competition.";
export const COMMUNITY_GROWTH_LABEL = "Community Growth";
export const COMMUNITY_JOURNEY_LABEL = "Community Journey";
export const LEGACY_COMMUNITY_LABEL = "Legacy Community";
export const GROWING_TOGETHER_LABEL = "Growing Together";

export const GLOBAL_COMMUNITY_RANKINGS_PURPOSE_COPY =
  "Measure community maturity — not popularity. Prepared for long-term growth.";
export const GLOBAL_COMMUNITY_RANKINGS_RESERVED_COPY =
  "Architecture prepared. Regional ambassadors, legacy events, and community celebrations are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const GLOBAL_COMMUNITY_RANKINGS_AVOID_COPY = [
  "Top City",
  "Most Popular",
  "Winner",
  "Leaderboard",
  "Rankings",
  "Popularity scores",
  "Competition"
] as const;

export type CommunityMaturityLevelId =
  | "emerging-community"
  | "growing-community"
  | "active-community"
  | "premium-community"
  | "legacy-community";

export type CommunityMaturityLevelDefinition = {
  id: CommunityMaturityLevelId;
  label: string;
  description: string;
  order: number;
};

export const COMMUNITY_MATURITY_LEVELS: CommunityMaturityLevelDefinition[] = [
  {
    id: "emerging-community",
    label: "Emerging Community",
    description: "A new community taking root — warm beginnings.",
    order: 10
  },
  {
    id: "growing-community",
    label: "Growing Community",
    description: "Introductions and gatherings building steadily.",
    order: 20
  },
  {
    id: "active-community",
    label: "Active Community",
    description: "Regular engagement with dignity and intention.",
    order: 30
  },
  {
    id: "premium-community",
    label: "Premium Community",
    description: "Elevated community maturity — reserved experiences ahead.",
    order: 40
  },
  {
    id: "legacy-community",
    label: "Legacy Community",
    description: "Enduring couples, families, and legacy honored locally.",
    order: 50
  }
];

export const COMMUNITY_MATURITY_LEVEL_LABELS: Record<CommunityMaturityLevelId, string> =
  Object.fromEntries(COMMUNITY_MATURITY_LEVELS.map((level) => [level.id, level.label])) as Record<
    CommunityMaturityLevelId,
    string
  >;

export type CommunityMaturityFactorId =
  | "member-activity"
  | "successful-introductions"
  | "relationships-formed"
  | "marriages"
  | "legacy-families"
  | "events"
  | "community-engagement";

export type CommunityMaturityFactorDefinition = {
  id: CommunityMaturityFactorId;
  label: string;
  description: string;
};

export const COMMUNITY_MATURITY_FACTORS: CommunityMaturityFactorDefinition[] = [
  {
    id: "member-activity",
    label: "Member activity",
    description: "Steady participation — never a popularity score."
  },
  {
    id: "successful-introductions",
    label: "Successful introductions",
    description: "Thoughtful introductions through Signal Concierge."
  },
  {
    id: "relationships-formed",
    label: "Relationships formed",
    description: "Relationships taking shape with intention."
  },
  {
    id: "marriages",
    label: "Marriages",
    description: "Marriages celebrated with dignity."
  },
  {
    id: "legacy-families",
    label: "Legacy families",
    description: "Legacy families honored without sensitive data."
  },
  {
    id: "events",
    label: "Events",
    description: "Signal Events™ gatherings reserved locally."
  },
  {
    id: "community-engagement",
    label: "Community engagement",
    description: "Warm engagement — not competition."
  }
];

export type CommunityMaturityFutureCapability =
  | "regional-ambassadors"
  | "legacy-events"
  | "community-celebrations";

export const COMMUNITY_MATURITY_FUTURE_CAPABILITIES: {
  id: CommunityMaturityFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "regional-ambassadors",
    label: "Regional ambassadors",
    description: "Reserved — dignified local community stewards."
  },
  {
    id: "legacy-events",
    label: "Legacy events",
    description: "Reserved — legacy celebrations in mature communities."
  },
  {
    id: "community-celebrations",
    label: "Community celebrations",
    description: "Reserved — warm milestones without competition."
  }
];

export type CommunityMaturityMilestoneEntry = {
  id: string;
  factorId: CommunityMaturityFactorId;
  recordedAt: string;
  note?: string;
};

export function communityMaturityLevelLabel(level: CommunityMaturityLevelId): string {
  return COMMUNITY_MATURITY_LEVEL_LABELS[level];
}

export function getCommunityMaturityLevelDefinition(
  level: CommunityMaturityLevelId
): CommunityMaturityLevelDefinition | undefined {
  return COMMUNITY_MATURITY_LEVELS.find((item) => item.id === level);
}

export function getCommunityMaturityFactorDefinition(
  factorId: CommunityMaturityFactorId
): CommunityMaturityFactorDefinition | undefined {
  return COMMUNITY_MATURITY_FACTORS.find((item) => item.id === factorId);
}
