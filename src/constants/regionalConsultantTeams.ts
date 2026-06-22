export const REGIONAL_CONSULTANT_TEAMS_BRAND = "Regional Consultant Teams™";
export const REGIONAL_CONSULTANT_TEAMS_TAGLINE =
  "Steward journeys by region — BamSignal members belong to the platform, consultants lead locally.";

export const REGIONAL_CONSULTANT_TEAM_REGIONS = [
  { id: "nigeria", label: "Nigeria", timezone: "WAT" },
  { id: "west-africa", label: "West Africa", timezone: "WAT / GMT" },
  { id: "uk", label: "UK", timezone: "GMT / BST" },
  { id: "canada", label: "Canada", timezone: "EST / PST" },
  { id: "usa", label: "USA", timezone: "EST / CST / PST" },
  { id: "middle-east", label: "Middle East", timezone: "GST / AST" },
  { id: "europe", label: "Europe", timezone: "CET / GMT" },
  { id: "australia", label: "Australia", timezone: "AEST / AEDT" }
] as const;

export type RegionalTeamId = (typeof REGIONAL_CONSULTANT_TEAM_REGIONS)[number]["id"];

export const REGIONAL_TEAM_ROLE_DEFINITIONS = [
  {
    id: "regional-lead",
    label: "Regional Lead",
    description: "Coordinates stewards, handoffs, and regional continuity."
  },
  {
    id: "senior-matchmaker",
    label: "Senior Matchmaker",
    description: "Leads Legacy and Global introductions with senior oversight."
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
  consultant_ada: "nigeria",
  consultant_emeka: "nigeria",
  consultant_fatima: "nigeria",
  consultant_james: "uk",
  consultant_sola: "west-africa"
};

/** Consultants designated as regional leads per region. */
export const REGIONAL_TEAM_LEAD_ASSIGNMENTS: Partial<Record<RegionalTeamId, string>> = {
  nigeria: "consultant_ada",
  uk: "consultant_james"
};

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

export const REGIONAL_TEAM_METRIC_LABELS = {
  activeMembers: "Active members",
  openApplications: "Open applications",
  consultations: "Consultations",
  introductions: "Introductions in progress",
  relationships: "Relationships"
} as const;
