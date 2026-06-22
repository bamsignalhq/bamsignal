/** BamSignal Observatory™ — relationship observatory architecture. */

import { INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const BAMSIGNAL_OBSERVATORY_TITLE = "BamSignal Observatory™";
export const OBSERVATORY_LABEL = "Observatory";
export const RELATIONSHIP_TRENDS_LABEL = "Relationship Trends";
export const COMMUNITIES_LABEL = "Communities";
export const LEGACY_LABEL = "Legacy";

export const BAMSIGNAL_OBSERVATORY_SUBCOPY =
  "A relationship observatory — think World Bank for relationships, with dignity first.";
export const BAMSIGNAL_OBSERVATORY_PURPOSE_COPY =
  "Create a relationship observatory — trends and communities, never analytics or metrics dashboards.";
export const BAMSIGNAL_OBSERVATORY_RESERVED_COPY =
  "Architecture prepared. Dashboards, visual reports, and country studies are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const BAMSIGNAL_OBSERVATORY_AVOID_COPY = ["Analytics", "Metrics"] as const;

export { INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type ObservatorySectionId =
  | "relationship-dashboard"
  | "marriage-trends"
  | "community-growth"
  | "legacy-families"
  | "diaspora-corridors"
  | "annual-reports";

export type ObservatorySectionDefinition = {
  id: ObservatorySectionId;
  title: string;
  description: string;
};

export const OBSERVATORY_SECTIONS: ObservatorySectionDefinition[] = [
  {
    id: "relationship-dashboard",
    title: "Relationship Dashboard",
    description: "Observatory overview — understanding relationships, never analytics."
  },
  {
    id: "marriage-trends",
    title: "Marriage Trends",
    description: "Relationship trends observed with care — dignity-first framing."
  },
  {
    id: "community-growth",
    title: "Community Growth",
    description: "Communities growing with local dignity — not metrics dashboards."
  },
  {
    id: "legacy-families",
    title: "Legacy Families",
    description: "Legacy families preserved — consent-first observatory pathways."
  },
  {
    id: "diaspora-corridors",
    title: "Diaspora Corridors",
    description: "Diaspora corridors — Journey Across Borders with observatory care."
  },
  {
    id: "annual-reports",
    title: "Annual Reports",
    description: "Annual observatory reports — insights prepared, not published yet."
  }
];

export type BamSignalObservatoryFutureCapabilityId = "dashboards" | "visual-reports" | "country-studies";

export const BAMSIGNAL_OBSERVATORY_FUTURE_CAPABILITIES: {
  id: BamSignalObservatoryFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "dashboards",
    label: "Dashboards",
    description: "Reserved — observatory dashboards with dignity-first design."
  },
  {
    id: "visual-reports",
    label: "Visual reports",
    description: "Reserved — visual reports — never metrics-heavy analytics."
  },
  {
    id: "country-studies",
    label: "Country studies",
    description: "Reserved — country studies on understanding relationships."
  }
];

export function getObservatorySection(
  sectionId: ObservatorySectionId
): ObservatorySectionDefinition | undefined {
  return OBSERVATORY_SECTIONS.find((section) => section.id === sectionId);
}
