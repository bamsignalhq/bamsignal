/** Family Advisors™ — household guidance architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const FAMILY_ADVISORS_TITLE = "Family Advisors™";
export const FAMILY_ADVISORS_LABEL = "Family Advisors";
export const ADVISOR_PROFILE_LABEL = "Advisor Profile";

export const FAMILY_ADVISORS_SUBCOPY =
  "Trusted family advisors — guidance and support for households with dignity, not a marketplace.";
export const FAMILY_ADVISORS_PURPOSE_COPY =
  "Prepare family advisors architecture — household experts reserved, not booking or profiles yet.";
export const FAMILY_ADVISORS_RESERVED_COPY =
  "Architecture prepared. Advisor profiles and family matching are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedFamilyAdvisorSpecialtyId =
  | "parenting-advisors"
  | "family-mentors"
  | "financial-stewardship-advisors"
  | "intercultural-marriage-advisors";

export type PreparedFamilyAdvisorSpecialtyDefinition = {
  id: PreparedFamilyAdvisorSpecialtyId;
  title: string;
  description: string;
  advisorId: string;
};

export const PREPARED_FAMILY_ADVISOR_SPECIALTIES: PreparedFamilyAdvisorSpecialtyDefinition[] = [
  {
    id: "parenting-advisors",
    title: "Parenting Advisors",
    description: "Parenting advisors — growing together as a family with care.",
    advisorId: "fadv_advisor_parenting"
  },
  {
    id: "family-mentors",
    title: "Family Mentors",
    description: "Family mentors — household wisdom and relationship support.",
    advisorId: "fadv_advisor_mentors"
  },
  {
    id: "financial-stewardship-advisors",
    title: "Financial Stewardship Advisors",
    description: "Financial stewardship advisors — trusted guidance for shared futures.",
    advisorId: "fadv_advisor_financial"
  },
  {
    id: "intercultural-marriage-advisors",
    title: "Intercultural Marriage Advisors",
    description: "Intercultural marriage advisors — unity across cultural lines.",
    advisorId: "fadv_advisor_intercultural"
  }
];

export type PreparedFamilyAdvisorId =
  | "fadv_advisor_parenting"
  | "fadv_advisor_mentors"
  | "fadv_advisor_financial"
  | "fadv_advisor_intercultural";

export type PreparedFamilyAdvisorDefinition = {
  id: PreparedFamilyAdvisorId;
  name: string;
  title: string;
  focus: string;
  specialtyId: PreparedFamilyAdvisorSpecialtyId;
};

export const PREPARED_FAMILY_ADVISORS: PreparedFamilyAdvisorDefinition[] =
  PREPARED_FAMILY_ADVISOR_SPECIALTIES.map((specialty) => ({
    id: specialty.advisorId as PreparedFamilyAdvisorId,
    name: "Reserved advisor",
    title: `${specialty.title} profile`,
    focus: specialty.description,
    specialtyId: specialty.id
  }));

export type AdvisorTimelineEntry = {
  id: string;
  advisorId: PreparedFamilyAdvisorId;
  label: string;
  recordedAt: string;
  note?: string;
};

export function getPreparedFamilyAdvisorSpecialty(
  specialtyId: PreparedFamilyAdvisorSpecialtyId
): PreparedFamilyAdvisorSpecialtyDefinition | undefined {
  return PREPARED_FAMILY_ADVISOR_SPECIALTIES.find((specialty) => specialty.id === specialtyId);
}
