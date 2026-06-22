export const REGIONAL_CONSULTANT_TEAMS_BRAND = "Regional Consultant Teams™";
export const REGIONAL_CONSULTANT_TEAMS_TAGLINE =
  "Steward journeys by region — BamSignal members belong to the platform, consultants lead locally.";

export const REGIONAL_CONSULTANT_TEAM_REGIONS = [
  { id: "lagos", label: "Lagos", timezone: "WAT" },
  { id: "abuja", label: "Abuja", timezone: "WAT" },
  { id: "port-harcourt", label: "Port Harcourt", timezone: "WAT" },
  { id: "south-east", label: "South East", timezone: "WAT" },
  { id: "northern-nigeria", label: "Northern Nigeria", timezone: "WAT" },
  { id: "uk", label: "UK", timezone: "GMT / BST" },
  { id: "canada", label: "Canada", timezone: "EST / PST" },
  { id: "usa", label: "USA", timezone: "EST / CST / PST" },
  { id: "uae", label: "UAE", timezone: "GST" },
  { id: "global", label: "Global", timezone: "UTC" }
] as const;

export type RegionalTeamId = (typeof REGIONAL_CONSULTANT_TEAM_REGIONS)[number]["id"];

export const REGIONAL_TEAM_ROLE_DEFINITIONS = [
  {
    id: "regional-director",
    label: "Regional Director",
    description: "Leads the regional team, handoffs, and institutional continuity."
  },
  {
    id: "senior-matchmaker",
    label: "Senior Matchmaker",
    description: "Leads Legacy and Global introductions with senior oversight."
  },
  {
    id: "consultant",
    label: "Consultant",
    description: "Guides members through the full concierge journey."
  },
  {
    id: "compatibility-specialist",
    label: "Compatibility Specialist",
    description: "Reviews applications and compatibility signals."
  },
  {
    id: "family-values-advisor",
    label: "Family Values Advisor",
    description: "Supports Legacy members with family alignment."
  },
  {
    id: "diaspora-consultant",
    label: "Diaspora Consultant",
    description: "Guides members across borders and relocation goals."
  }
] as const;

export type RegionalTeamRoleId = (typeof REGIONAL_TEAM_ROLE_DEFINITIONS)[number]["id"];

export const REGIONAL_TEAM_ROLE_LABELS: Record<RegionalTeamRoleId, string> = Object.fromEntries(
  REGIONAL_TEAM_ROLE_DEFINITIONS.map((role) => [role.id, role.label])
) as Record<RegionalTeamRoleId, string>;

/** Primary region assignment for seeded consultants — expandable via directory later. */
export const REGIONAL_CONSULTANT_REGION_ASSIGNMENTS: Record<string, RegionalTeamId> = {
  consultant_ada: "lagos",
  consultant_emeka: "abuja",
  consultant_fatima: "northern-nigeria",
  consultant_james: "uk",
  consultant_sola: "global"
};

/** Regional directors per region. */
export const REGIONAL_TEAM_DIRECTOR_ASSIGNMENTS: Partial<Record<RegionalTeamId, string>> = {
  lagos: "consultant_ada",
  uk: "consultant_james",
  global: "consultant_sola"
};

/** @deprecated Use REGIONAL_TEAM_DIRECTOR_ASSIGNMENTS */
export const REGIONAL_TEAM_LEAD_ASSIGNMENTS = REGIONAL_TEAM_DIRECTOR_ASSIGNMENTS;

export const REGIONAL_TEAM_METRIC_LABELS = {
  members: "Members",
  consultants: "Consultants",
  introductions: "Introductions",
  relationships: "Relationships",
  engagements: "Engagements",
  marriages: "Marriages",
  legacyFamilies: "Legacy Families"
} as const;

/** Documented future modules — not implemented in this release. */
export const REGIONAL_CONSULTANT_TEAMS_FUTURE_MODULES = [
  {
    id: "local-offices",
    label: "Local Offices",
    description: "Physical concierge desks in key cities."
  },
  {
    id: "city-ambassadors",
    label: "City Ambassadors",
    description: "Community stewards aligned to city chapters."
  },
  {
    id: "faith-network",
    label: "Faith Network",
    description: "Faith-aligned consultant lanes with opt-in routing."
  }
] as const;
