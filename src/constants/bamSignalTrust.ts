/** BamSignal Trust™ — trusted professionals ecosystem architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const BAMSIGNAL_TRUST_TITLE = "BamSignal Trust™";
export const BAMSIGNAL_TRUST_LABEL = "BamSignal Trust";
export const TRUSTED_PROFESSIONAL_LABEL = "Trusted Professional";

export const BAMSIGNAL_TRUST_HERO_COPY = "Trusted Professionals";
export const BAMSIGNAL_TRUST_GUIDANCE_COPY = "Guidance";
export const BAMSIGNAL_TRUST_SUPPORT_COPY = "Support";
export const BAMSIGNAL_TRUST_EXPERTS_COPY = "Relationship Experts";

export const BAMSIGNAL_TRUST_SUBCOPY =
  "Trusted professionals — guidance and support from relationship experts, not a marketplace or vendor directory.";
export const BAMSIGNAL_TRUST_PURPOSE_COPY =
  "Prepare a trusted ecosystem of professionals — dignity-first expert network, not service providers or vendors.";
export const BAMSIGNAL_TRUST_RESERVED_COPY =
  "Architecture prepared. Professional profiles, verification, and booking are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedTrustCategoryId =
  | "relationship-coaches"
  | "marriage-mentors"
  | "family-advisors"
  | "psychologists"
  | "therapists"
  | "financial-advisors"
  | "immigration-consultants"
  | "wedding-planners"
  | "faith-leaders"
  | "diaspora-specialists"
  | "legal-advisors";

export type PreparedTrustCategoryDefinition = {
  id: PreparedTrustCategoryId;
  title: string;
  description: string;
  professionalId: string;
};

export const PREPARED_TRUST_CATEGORIES: PreparedTrustCategoryDefinition[] = [
  {
    id: "relationship-coaches",
    title: "Relationship Coaches",
    description: "Relationship coaches — trusted guidance and support with dignity.",
    professionalId: "bst_prof_coaches"
  },
  {
    id: "marriage-mentors",
    title: "Marriage Mentors",
    description: "Marriage mentors — relationship experts for couples.",
    professionalId: "bst_prof_mentors"
  },
  {
    id: "family-advisors",
    title: "Family Advisors",
    description: "Family advisors — trusted support for households.",
    professionalId: "bst_prof_family"
  },
  {
    id: "psychologists",
    title: "Psychologists",
    description: "Psychologists — professional guidance with care.",
    professionalId: "bst_prof_psychologists"
  },
  {
    id: "therapists",
    title: "Therapists",
    description: "Therapists — support and relationship wisdom.",
    professionalId: "bst_prof_therapists"
  },
  {
    id: "financial-advisors",
    title: "Financial Advisors",
    description: "Financial advisors — trusted guidance for shared futures.",
    professionalId: "bst_prof_financial"
  },
  {
    id: "immigration-consultants",
    title: "Immigration Consultants",
    description: "Immigration consultants — diaspora journey support.",
    professionalId: "bst_prof_immigration"
  },
  {
    id: "wedding-planners",
    title: "Wedding Planners",
    description: "Wedding planners — celebration guidance, not vendor marketplace.",
    professionalId: "bst_prof_wedding"
  },
  {
    id: "faith-leaders",
    title: "Faith Leaders",
    description: "Faith leaders — respectful counsel and community wisdom.",
    professionalId: "bst_prof_faith"
  },
  {
    id: "diaspora-specialists",
    title: "Diaspora Specialists",
    description: "Diaspora specialists — Journey Across Borders expertise.",
    professionalId: "bst_prof_diaspora"
  },
  {
    id: "legal-advisors",
    title: "Legal Advisors",
    description: "Legal advisors — trusted professional guidance.",
    professionalId: "bst_prof_legal"
  }
];

export type PreparedTrustedProfessionalId =
  | "bst_prof_coaches"
  | "bst_prof_mentors"
  | "bst_prof_family"
  | "bst_prof_psychologists"
  | "bst_prof_therapists"
  | "bst_prof_financial"
  | "bst_prof_immigration"
  | "bst_prof_wedding"
  | "bst_prof_faith"
  | "bst_prof_diaspora"
  | "bst_prof_legal";

export type PreparedTrustedProfessionalDefinition = {
  id: PreparedTrustedProfessionalId;
  name: string;
  title: string;
  focus: string;
  categoryId: PreparedTrustCategoryId;
};

export const PREPARED_TRUSTED_PROFESSIONALS: PreparedTrustedProfessionalDefinition[] =
  PREPARED_TRUST_CATEGORIES.map((category) => ({
    id: category.professionalId as PreparedTrustedProfessionalId,
    name: "Reserved professional",
    title: `${category.title} expert`,
    focus: category.description,
    categoryId: category.id
  }));

export type TrustTimelineEntry = {
  id: string;
  categoryId: PreparedTrustCategoryId;
  label: string;
  recordedAt: string;
  note?: string;
};

export function getPreparedTrustCategory(
  categoryId: PreparedTrustCategoryId
): PreparedTrustCategoryDefinition | undefined {
  return PREPARED_TRUST_CATEGORIES.find((category) => category.id === categoryId);
}
