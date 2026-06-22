/** BamSignal Institute™ — research and insights architecture (prepared, not enabled). */

export const BAMSIGNAL_INSTITUTE_TITLE = "BamSignal Institute™";
export const BAMSIGNAL_INSTITUTE_SUBCOPY =
  "Understanding Relationships — the research and insights arm of BamSignal.";
export const INSIGHTS_LABEL = "Insights";
export const RESEARCH_LABEL = "Research";
export const UNDERSTANDING_RELATIONSHIPS_LABEL = "Understanding Relationships";
export const AFRICAN_RELATIONSHIP_CULTURE_LABEL = "African Relationship Culture";

export const BAMSIGNAL_INSTITUTE_PURPOSE_COPY =
  "Create the research and insights arm — dignity-first understanding, never data mining.";
export const BAMSIGNAL_INSTITUTE_RESERVED_COPY =
  "Architecture prepared. Annual reports, white papers, research partnerships, and universities are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const BAMSIGNAL_INSTITUTE_AVOID_COPY = ["Analytics", "Statistics Dashboard", "Data Mining"] as const;

export type ResearchAreaId =
  | "african-relationship-culture"
  | "marriage-trends"
  | "dating-intentions"
  | "faith-and-relationships"
  | "diaspora-families"
  | "communication-patterns"
  | "generational-differences"
  | "family-values"
  | "long-distance-relationships"
  | "relocation-and-marriage";

export type ResearchAreaDefinition = {
  id: ResearchAreaId;
  title: string;
  description: string;
};

export const RESEARCH_AREAS: ResearchAreaDefinition[] = [
  {
    id: "african-relationship-culture",
    title: "African Relationship Culture",
    description: "Understanding relationships rooted in African culture — dignity first."
  },
  {
    id: "marriage-trends",
    title: "Marriage Trends",
    description: "Marriage trends observed with care — never popularity scoring."
  },
  {
    id: "dating-intentions",
    title: "Dating Intentions",
    description: "Dating intentions — human-first insights, not funnel analytics."
  },
  {
    id: "faith-and-relationships",
    title: "Faith and Relationships",
    description: "Faith and relationships — respectful research pathways."
  },
  {
    id: "diaspora-families",
    title: "Diaspora Families",
    description: "Diaspora families — Journey Across Borders with research dignity."
  },
  {
    id: "communication-patterns",
    title: "Communication Patterns",
    description: "Communication patterns — insights without surveillance."
  },
  {
    id: "generational-differences",
    title: "Generational Differences",
    description: "Generational differences — warm understanding across ages."
  },
  {
    id: "family-values",
    title: "Family Values",
    description: "Family values preserved — consent-first research architecture."
  },
  {
    id: "long-distance-relationships",
    title: "Long Distance Relationships",
    description: "Long distance relationships — corridor insights with privacy."
  },
  {
    id: "relocation-and-marriage",
    title: "Relocation and Marriage",
    description: "Relocation and marriage — diaspora research prepared with care."
  }
];

export type ResearchReportSeed = {
  id: string;
  areaId: ResearchAreaId;
  title: string;
  summary: string;
  recordedAt: string;
  privateByDefault: boolean;
};

export const RESEARCH_REPORTS_ARCHITECTURE_SEED: ResearchReportSeed[] = [
  {
    id: "bi_report_african_culture",
    areaId: "african-relationship-culture",
    title: "African Relationship Culture — preview",
    summary: "Research report reserved — insights prepared, not published yet.",
    recordedAt: "2026-04-01T00:00:00.000Z",
    privateByDefault: true
  },
  {
    id: "bi_report_marriage_trends",
    areaId: "marriage-trends",
    title: "Marriage Trends — preview",
    summary: "Annual insights pathway reserved — never a statistics dashboard.",
    recordedAt: "2026-04-15T00:00:00.000Z",
    privateByDefault: true
  },
  {
    id: "bi_report_diaspora_families",
    areaId: "diaspora-families",
    title: "Diaspora Families — preview",
    summary: "White paper architecture prepared — consent required before release.",
    recordedAt: "2026-05-01T00:00:00.000Z",
    privateByDefault: true
  }
];

export type InstituteFutureCapabilityId =
  | "annual-reports"
  | "white-papers"
  | "research-partnerships"
  | "universities";

export const INSTITUTE_FUTURE_CAPABILITIES: {
  id: InstituteFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "annual-reports",
    label: "Annual reports",
    description: "Reserved — annual relationship insights reports."
  },
  {
    id: "white-papers",
    label: "White papers",
    description: "Reserved — white papers with dignity and consent."
  },
  {
    id: "research-partnerships",
    label: "Research partnerships",
    description: "Reserved — research partnerships — never data mining."
  },
  {
    id: "universities",
    label: "Universities",
    description: "Reserved — university research collaborations."
  }
];

export function getResearchArea(id: ResearchAreaId): ResearchAreaDefinition | undefined {
  return RESEARCH_AREAS.find((area) => area.id === id);
}
