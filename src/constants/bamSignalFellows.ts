/** BamSignal Fellows™ — expert network architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const BAMSIGNAL_FELLOWS_TITLE = "BamSignal Fellows™";
export const BAMSIGNAL_FELLOWS_LABEL = "BamSignal Fellows";
export const FELLOW_LABEL = "Fellow";

export const BAMSIGNAL_FELLOWS_SUBCOPY =
  "Expert network architecture — relationship wisdom leaders prepared with dignity, not a directory yet.";
export const BAMSIGNAL_FELLOWS_PURPOSE_COPY =
  "Prepare BamSignal Fellows — coaches, mentors, and advisors reserved, not booking or profiles yet.";
export const BAMSIGNAL_FELLOWS_RESERVED_COPY =
  "Architecture prepared. Fellow profiles and expert timelines are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedFellowSpecialtyId =
  | "relationship-coaches"
  | "marriage-mentors"
  | "researchers"
  | "family-advisors"
  | "faith-leaders"
  | "diaspora-specialists";

export type PreparedFellowSpecialtyDefinition = {
  id: PreparedFellowSpecialtyId;
  title: string;
  description: string;
};

export const PREPARED_FELLOW_SPECIALTIES: PreparedFellowSpecialtyDefinition[] = [
  {
    id: "relationship-coaches",
    title: "Relationship Coaches",
    description: "Relationship coaches — growing together with expert dignity."
  },
  {
    id: "marriage-mentors",
    title: "Marriage Mentors",
    description: "Marriage mentors — relationship wisdom for couples."
  },
  {
    id: "researchers",
    title: "Researchers",
    description: "Researchers — evidence and insight for the Institute."
  },
  {
    id: "family-advisors",
    title: "Family Advisors",
    description: "Family advisors — guidance for households with care."
  },
  {
    id: "faith-leaders",
    title: "Faith Leaders",
    description: "Faith leaders — respectful counsel and community wisdom."
  },
  {
    id: "diaspora-specialists",
    title: "Diaspora Specialists",
    description: "Diaspora specialists — Journey Across Borders expertise."
  }
];

export type PreparedFellowId =
  | "bsf_fellow_coaches"
  | "bsf_fellow_mentors"
  | "bsf_fellow_researchers"
  | "bsf_fellow_family"
  | "bsf_fellow_faith"
  | "bsf_fellow_diaspora";

export type PreparedFellowDefinition = {
  id: PreparedFellowId;
  name: string;
  title: string;
  focus: string;
  specialtyId: PreparedFellowSpecialtyId;
};

export const PREPARED_FELLOWS: PreparedFellowDefinition[] = [
  {
    id: "bsf_fellow_coaches",
    name: "Reserved fellow",
    title: "Relationship Coaches fellow",
    focus: "Relationship coaches — growing together with expert dignity.",
    specialtyId: "relationship-coaches"
  },
  {
    id: "bsf_fellow_mentors",
    name: "Reserved fellow",
    title: "Marriage Mentors fellow",
    focus: "Marriage mentors — relationship wisdom for couples.",
    specialtyId: "marriage-mentors"
  },
  {
    id: "bsf_fellow_researchers",
    name: "Reserved fellow",
    title: "Researchers fellow",
    focus: "Researchers — evidence and insight for the Institute.",
    specialtyId: "researchers"
  },
  {
    id: "bsf_fellow_family",
    name: "Reserved fellow",
    title: "Family Advisors fellow",
    focus: "Family advisors — guidance for households with care.",
    specialtyId: "family-advisors"
  },
  {
    id: "bsf_fellow_faith",
    name: "Reserved fellow",
    title: "Faith Leaders fellow",
    focus: "Faith leaders — respectful counsel and community wisdom.",
    specialtyId: "faith-leaders"
  },
  {
    id: "bsf_fellow_diaspora",
    name: "Reserved fellow",
    title: "Diaspora Specialists fellow",
    focus: "Diaspora specialists — Journey Across Borders expertise.",
    specialtyId: "diaspora-specialists"
  }
];

export type ExpertTimelineEntry = {
  id: string;
  fellowId: PreparedFellowId;
  label: string;
  recordedAt: string;
  note?: string;
};

export function getPreparedFellowSpecialty(
  specialtyId: PreparedFellowSpecialtyId
): PreparedFellowSpecialtyDefinition | undefined {
  return PREPARED_FELLOW_SPECIALTIES.find((specialty) => specialty.id === specialtyId);
}
