/** City Ambassadors™ — community stewardship architecture (prepared, not enabled). */

export const CITY_AMBASSADORS_TITLE = "City Ambassadors™";
export const CITY_AMBASSADORS_SUBCOPY =
  "Community stewardship prepared with dignity — never sales, never influence chasing.";
export const COMMUNITY_AMBASSADOR_LABEL = "Community Ambassador";
export const STEWARD_LABEL = "Steward";
export const LEGACY_ADVOCATE_LABEL = "Legacy Advocate";
export const COMMUNITY_BUILDER_LABEL = "Community Builder";

export const CITY_AMBASSADORS_PURPOSE_COPY =
  "Prepare community stewardship — ambassadors as stewards, not salespeople.";
export const CITY_AMBASSADORS_RESERVED_COPY =
  "Architecture prepared. Community events, couple dinners, singles brunches, anniversary celebrations, and legacy gatherings are not enabled yet.";
export const CITY_AMBASSADORS_NEVER_SALESPERSON_COPY =
  "Never a salesperson — stewardship and relationship culture only.";

/** Reserved — never use in member-facing copy. */
export const CITY_AMBASSADORS_AVOID_COPY = ["Representative", "Sales Agent", "Influencer"] as const;

export type CityAmbassadorRoleId =
  | "community-steward"
  | "event-host"
  | "legacy-advocate"
  | "relationship-culture-builder";

export type CityAmbassadorRoleDefinition = {
  id: CityAmbassadorRoleId;
  label: string;
  description: string;
};

export const CITY_AMBASSADOR_ROLES: CityAmbassadorRoleDefinition[] = [
  {
    id: "community-steward",
    label: STEWARD_LABEL,
    description: "Community steward — local care and dignity first."
  },
  {
    id: "event-host",
    label: "Event host",
    description: "Warm gatherings — never a party crowd or funnel."
  },
  {
    id: "legacy-advocate",
    label: LEGACY_ADVOCATE_LABEL,
    description: "Legacy advocate — honoring couples and families with consent."
  },
  {
    id: "relationship-culture-builder",
    label: COMMUNITY_BUILDER_LABEL,
    description: "Relationship culture builder — human-first community growth."
  }
];

export const CITY_AMBASSADOR_ROLE_LABELS: Record<CityAmbassadorRoleId, string> = Object.fromEntries(
  CITY_AMBASSADOR_ROLES.map((role) => [role.id, role.label])
) as Record<CityAmbassadorRoleId, string>;

export type CityAmbassadorFutureCapabilityId =
  | "community-events"
  | "couple-dinners"
  | "singles-brunches"
  | "anniversary-celebrations"
  | "legacy-gatherings";

export const CITY_AMBASSADOR_FUTURE_CAPABILITIES: {
  id: CityAmbassadorFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "community-events",
    label: "Community events",
    description: "Reserved — ambassador-hosted community events."
  },
  {
    id: "couple-dinners",
    label: "Couple dinners",
    description: "Reserved — intimate couple dinners with stewardship."
  },
  {
    id: "singles-brunches",
    label: "Singles brunches",
    description: "Reserved — warm singles brunches — never a sales floor."
  },
  {
    id: "anniversary-celebrations",
    label: "Anniversary celebrations",
    description: "Reserved — milestone celebrations with dignity."
  },
  {
    id: "legacy-gatherings",
    label: "Legacy gatherings",
    description: "Reserved — legacy gatherings for enduring couples."
  }
];

export type PreparedCityAmbassadorSlug =
  | "lagos"
  | "abuja"
  | "london"
  | "toronto"
  | "houston"
  | "atlanta"
  | "dubai"
  | "johannesburg"
  | "sydney";

export type PreparedCityAmbassadorDefinition = {
  slug: PreparedCityAmbassadorSlug;
  title: string;
  description: string;
  primaryRole: CityAmbassadorRoleId;
};

export const PREPARED_CITY_AMBASSADORS: PreparedCityAmbassadorDefinition[] = [
  {
    slug: "lagos",
    title: "Lagos Ambassador",
    description: "Nigeria flagship — community steward for local identity.",
    primaryRole: "community-steward"
  },
  {
    slug: "abuja",
    title: "Abuja Ambassador",
    description: "Capital stewardship — relationship culture builder.",
    primaryRole: "relationship-culture-builder"
  },
  {
    slug: "london",
    title: "London Ambassador",
    description: "Diaspora legacy advocate — dignity across borders.",
    primaryRole: "legacy-advocate"
  },
  {
    slug: "toronto",
    title: "Toronto Ambassador",
    description: "Canadian diaspora — community builder with care.",
    primaryRole: "relationship-culture-builder"
  },
  {
    slug: "houston",
    title: "Houston Ambassador",
    description: "Texas diaspora — warm event host stewardship.",
    primaryRole: "event-host"
  },
  {
    slug: "atlanta",
    title: "Atlanta Ambassador",
    description: "Southern diaspora — community steward prepared.",
    primaryRole: "community-steward"
  },
  {
    slug: "dubai",
    title: "Dubai Ambassador",
    description: "UAE diaspora — legacy advocate architecture.",
    primaryRole: "legacy-advocate"
  },
  {
    slug: "johannesburg",
    title: "Johannesburg Ambassador",
    description: "South Africa — emerging stewardship pathway.",
    primaryRole: "community-steward"
  },
  {
    slug: "sydney",
    title: "Sydney Ambassador",
    description: "Australia diaspora — relationship culture builder.",
    primaryRole: "relationship-culture-builder"
  }
];

export type AmbassadorJourneyStep = {
  id: string;
  ambassadorSlug: PreparedCityAmbassadorSlug;
  label: string;
  recordedAt: string;
  note?: string;
};

export function cityAmbassadorRoleLabel(role: CityAmbassadorRoleId): string {
  return CITY_AMBASSADOR_ROLE_LABELS[role];
}

export function getPreparedCityAmbassador(
  slug: PreparedCityAmbassadorSlug
): PreparedCityAmbassadorDefinition | undefined {
  return PREPARED_CITY_AMBASSADORS.find((ambassador) => ambassador.slug === slug);
}
