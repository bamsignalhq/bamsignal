/** Research Partnerships™ — institutional relationships architecture. */

import { INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const RESEARCH_PARTNERSHIPS_TITLE = "Research Partnerships™";
export const RESEARCH_PARTNERSHIPS_LABEL = "Research Partnerships";
export const INSTITUTIONAL_RELATIONSHIPS_LABEL = "Institutional Relationships";
export const COLLABORATIONS_LABEL = "Collaborations";

export const RESEARCH_PARTNERSHIPS_SUBCOPY =
  "Institutional relationships and collaborations — BamSignal's partnership ecosystem for understanding relationships.";
export const RESEARCH_PARTNERSHIPS_PURPOSE_COPY =
  "Prepare institutional relationships — collaborations first, never sponsors or affiliates.";
export const RESEARCH_PARTNERSHIPS_RESERVED_COPY =
  "Architecture prepared. Joint studies, conferences, and annual reports are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const RESEARCH_PARTNERSHIPS_AVOID_COPY = ["Sponsors", "Affiliates"] as const;

export { INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PartnerCategoryId =
  | "universities"
  | "churches"
  | "mosques"
  | "ngos"
  | "family-organizations"
  | "psychologists"
  | "marriage-counselors"
  | "community-organizations";

export type PartnerCategoryDefinition = {
  id: PartnerCategoryId;
  label: string;
  description: string;
};

export const PARTNER_CATEGORIES: PartnerCategoryDefinition[] = [
  {
    id: "universities",
    label: "Universities",
    description: "Academic collaborations — dignity-first research partnerships."
  },
  {
    id: "churches",
    label: "Churches",
    description: "Faith community partnerships — respectful institutional relationships."
  },
  {
    id: "mosques",
    label: "Mosques",
    description: "Mosque partnerships — collaborations with care and consent."
  },
  {
    id: "ngos",
    label: "NGOs",
    description: "NGO collaborations — never sponsors or affiliates."
  },
  {
    id: "family-organizations",
    label: "Family organizations",
    description: "Family organization partnerships — human-first institutional framing."
  },
  {
    id: "psychologists",
    label: "Psychologists",
    description: "Psychologist collaborations — insights without surveillance."
  },
  {
    id: "marriage-counselors",
    label: "Marriage counselors",
    description: "Marriage counselor partnerships — consent-first collaborations."
  },
  {
    id: "community-organizations",
    label: "Community organizations",
    description: "Community organization relationships — local dignity first."
  }
];

export type PreparedInstitutionId =
  | "reserved-university"
  | "reserved-church"
  | "reserved-mosque"
  | "reserved-ngo"
  | "reserved-family-org"
  | "reserved-psychologist"
  | "reserved-marriage-counselor"
  | "reserved-community-org";

export type PreparedInstitutionDefinition = {
  id: PreparedInstitutionId;
  name: string;
  description: string;
  categoryId: PartnerCategoryId;
};

export const PREPARED_INSTITUTIONS: PreparedInstitutionDefinition[] = [
  {
    id: "reserved-university",
    name: "Reserved university partner",
    description: "Academic collaboration architecture prepared — not enabled yet.",
    categoryId: "universities"
  },
  {
    id: "reserved-church",
    name: "Reserved church partner",
    description: "Faith community partnership — respectful institutional relationship.",
    categoryId: "churches"
  },
  {
    id: "reserved-mosque",
    name: "Reserved mosque partner",
    description: "Mosque collaboration — consent-first framing.",
    categoryId: "mosques"
  },
  {
    id: "reserved-ngo",
    name: "Reserved NGO partner",
    description: "NGO collaboration — never a sponsor or affiliate.",
    categoryId: "ngos"
  },
  {
    id: "reserved-family-org",
    name: "Reserved family organization",
    description: "Family organization partnership — dignity-first.",
    categoryId: "family-organizations"
  },
  {
    id: "reserved-psychologist",
    name: "Reserved psychologist partner",
    description: "Psychologist collaboration — insights without scoring.",
    categoryId: "psychologists"
  },
  {
    id: "reserved-marriage-counselor",
    name: "Reserved marriage counselor",
    description: "Marriage counselor partnership — human-first collaborations.",
    categoryId: "marriage-counselors"
  },
  {
    id: "reserved-community-org",
    name: "Reserved community organization",
    description: "Community organization relationship — local dignity first.",
    categoryId: "community-organizations"
  }
];

export type PartnershipTimelineEntry = {
  id: string;
  institutionId: PreparedInstitutionId;
  label: string;
  recordedAt: string;
  note?: string;
};

export type ResearchPartnershipsFutureCapabilityId = "joint-studies" | "conferences" | "annual-reports";

export const RESEARCH_PARTNERSHIPS_FUTURE_CAPABILITIES: {
  id: ResearchPartnershipsFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "joint-studies",
    label: "Joint studies",
    description: "Reserved — joint research studies with consent and dignity."
  },
  {
    id: "conferences",
    label: "Conferences",
    description: "Reserved — institutional conferences and collaborations."
  },
  {
    id: "annual-reports",
    label: "Annual reports",
    description: "Reserved — partnership annual reports — never affiliate marketing."
  }
];

export function getPartnerCategory(categoryId: PartnerCategoryId): PartnerCategoryDefinition | undefined {
  return PARTNER_CATEGORIES.find((category) => category.id === categoryId);
}
