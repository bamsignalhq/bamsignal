/** Life Partners™ — legacy and stewardship architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const LIFE_PARTNERS_TITLE = "Life Partners™";
export const LIFE_PARTNERS_LABEL = "Life Partners";
export const LIFE_PARTNER_LABEL = "Life Partner";
export const LEGACY_ADVISOR_LABEL = "Legacy Advisor";
export const LIFE_PARTNER_SPECIALTY_LABEL = "Partner Specialty";

export const LIFE_PARTNERS_SUBCOPY =
  "Financial, legal, and legacy partners — trusted stewardship for families, not a marketplace.";
export const LIFE_PARTNERS_PURPOSE_COPY =
  "Prepare life partners architecture — partners and legacy advisors reserved, not referrals yet.";
export const LIFE_PARTNERS_RESERVED_COPY =
  "Architecture prepared. Life partner profiles and legacy advisor connections are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedLifePartnerSpecialtyId =
  | "financial-advisors"
  | "estate-planners"
  | "insurance-partners"
  | "family-lawyers"
  | "legacy-advisors";

export type PreparedLifePartnerSpecialtyDefinition = {
  id: PreparedLifePartnerSpecialtyId;
  title: string;
  description: string;
  partnerId: string;
  advisorId: string;
};

export const PREPARED_LIFE_PARTNER_SPECIALTIES: PreparedLifePartnerSpecialtyDefinition[] = [
  {
    id: "financial-advisors",
    title: "Financial Advisors",
    description: "Financial advisors — stewardship and shared futures with dignity.",
    partnerId: "lpr_partner_financial",
    advisorId: "lpr_advisor_financial"
  },
  {
    id: "estate-planners",
    title: "Estate Planners",
    description: "Estate planners — thoughtful planning for what families leave behind.",
    partnerId: "lpr_partner_estate",
    advisorId: "lpr_advisor_estate"
  },
  {
    id: "insurance-partners",
    title: "Insurance Partners",
    description: "Insurance partners — protection for households with care.",
    partnerId: "lpr_partner_insurance",
    advisorId: "lpr_advisor_insurance"
  },
  {
    id: "family-lawyers",
    title: "Family Lawyers",
    description: "Family lawyers — legal guidance with respect for family unity.",
    partnerId: "lpr_partner_lawyers",
    advisorId: "lpr_advisor_lawyers"
  },
  {
    id: "legacy-advisors",
    title: "Legacy Advisors",
    description: "Legacy advisors — wisdom for generations and lasting impact.",
    partnerId: "lpr_partner_legacy",
    advisorId: "lpr_advisor_legacy"
  }
];

export type PreparedLifePartnerId =
  | "lpr_partner_financial"
  | "lpr_partner_estate"
  | "lpr_partner_insurance"
  | "lpr_partner_lawyers"
  | "lpr_partner_legacy";

export type PreparedLifePartnerDefinition = {
  id: PreparedLifePartnerId;
  name: string;
  title: string;
  focus: string;
  specialtyId: PreparedLifePartnerSpecialtyId;
};

export const PREPARED_LIFE_PARTNERS: PreparedLifePartnerDefinition[] =
  PREPARED_LIFE_PARTNER_SPECIALTIES.map((specialty) => ({
    id: specialty.partnerId as PreparedLifePartnerId,
    name: "Reserved partner",
    title: `${specialty.title} profile`,
    focus: specialty.description,
    specialtyId: specialty.id
  }));

export type PreparedLegacyAdvisorId =
  | "lpr_advisor_financial"
  | "lpr_advisor_estate"
  | "lpr_advisor_insurance"
  | "lpr_advisor_lawyers"
  | "lpr_advisor_legacy";

export type PreparedLegacyAdvisorDefinition = {
  id: PreparedLegacyAdvisorId;
  name: string;
  title: string;
  focus: string;
  specialtyId: PreparedLifePartnerSpecialtyId;
};

export const PREPARED_LEGACY_ADVISORS: PreparedLegacyAdvisorDefinition[] =
  PREPARED_LIFE_PARTNER_SPECIALTIES.map((specialty) => ({
    id: specialty.advisorId as PreparedLegacyAdvisorId,
    name: "Reserved advisor",
    title: `${specialty.title} legacy counsel`,
    focus: specialty.description,
    specialtyId: specialty.id
  }));

export function getPreparedLifePartnerSpecialty(
  specialtyId: PreparedLifePartnerSpecialtyId
): PreparedLifePartnerSpecialtyDefinition | undefined {
  return PREPARED_LIFE_PARTNER_SPECIALTIES.find((specialty) => specialty.id === specialtyId);
}
