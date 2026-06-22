/** Diaspora Services™ — cross-border support architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const DIASPORA_SERVICES_TITLE = "Diaspora Services™";
export const DIASPORA_SERVICES_LABEL = "Diaspora Services";
export const IMMIGRATION_PARTNER_LABEL = "Immigration Partner";
export const DIASPORA_ADVISOR_LABEL = "Diaspora Advisor";
export const DIASPORA_SERVICE_LABEL = "Diaspora Service";

export const DIASPORA_SERVICES_SUBCOPY =
  "Relocation, immigration, and family integration — dignified cross-border support, not a vendor marketplace.";
export const DIASPORA_SERVICES_PURPOSE_COPY =
  "Prepare diaspora services architecture — partners and advisors reserved, not booking or referrals yet.";
export const DIASPORA_SERVICES_RESERVED_COPY =
  "Architecture prepared. Immigration partners and diaspora advisor profiles are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedDiasporaServiceId =
  | "relocation-specialists"
  | "immigration-advisors"
  | "settlement-support"
  | "family-integration"
  | "cross-border-marriage-support";

export type PreparedDiasporaServiceDefinition = {
  id: PreparedDiasporaServiceId;
  title: string;
  description: string;
  partnerId: string;
  advisorId: string;
};

export const PREPARED_DIASPORA_SERVICES: PreparedDiasporaServiceDefinition[] = [
  {
    id: "relocation-specialists",
    title: "Relocation Specialists",
    description: "Relocation specialists — dignified moves across borders with care.",
    partnerId: "dias_partner_relocation",
    advisorId: "dias_advisor_relocation"
  },
  {
    id: "immigration-advisors",
    title: "Immigration Advisors",
    description: "Immigration advisors — trusted guidance for lawful pathways.",
    partnerId: "dias_partner_immigration",
    advisorId: "dias_advisor_immigration"
  },
  {
    id: "settlement-support",
    title: "Settlement Support",
    description: "Settlement support — settling in with dignity and practical care.",
    partnerId: "dias_partner_settlement",
    advisorId: "dias_advisor_settlement"
  },
  {
    id: "family-integration",
    title: "Family Integration",
    description: "Family integration — households united across borders.",
    partnerId: "dias_partner_family",
    advisorId: "dias_advisor_family"
  },
  {
    id: "cross-border-marriage-support",
    title: "Cross-border Marriage Support",
    description: "Cross-border marriage support — relationship wisdom for international unions.",
    partnerId: "dias_partner_marriage",
    advisorId: "dias_advisor_marriage"
  }
];

export type PreparedImmigrationPartnerId =
  | "dias_partner_relocation"
  | "dias_partner_immigration"
  | "dias_partner_settlement"
  | "dias_partner_family"
  | "dias_partner_marriage";

export type PreparedImmigrationPartnerDefinition = {
  id: PreparedImmigrationPartnerId;
  name: string;
  title: string;
  focus: string;
  serviceId: PreparedDiasporaServiceId;
};

export const PREPARED_IMMIGRATION_PARTNERS: PreparedImmigrationPartnerDefinition[] =
  PREPARED_DIASPORA_SERVICES.map((service) => ({
    id: service.partnerId as PreparedImmigrationPartnerId,
    name: "Reserved partner",
    title: `${service.title} partner`,
    focus: service.description,
    serviceId: service.id
  }));

export type PreparedDiasporaAdvisorId =
  | "dias_advisor_relocation"
  | "dias_advisor_immigration"
  | "dias_advisor_settlement"
  | "dias_advisor_family"
  | "dias_advisor_marriage";

export type PreparedDiasporaAdvisorDefinition = {
  id: PreparedDiasporaAdvisorId;
  name: string;
  title: string;
  focus: string;
  serviceId: PreparedDiasporaServiceId;
};

export const PREPARED_DIASPORA_ADVISORS: PreparedDiasporaAdvisorDefinition[] =
  PREPARED_DIASPORA_SERVICES.map((service) => ({
    id: service.advisorId as PreparedDiasporaAdvisorId,
    name: "Reserved advisor",
    title: `${service.title} advisor`,
    focus: service.description,
    serviceId: service.id
  }));

export function getPreparedDiasporaService(
  serviceId: PreparedDiasporaServiceId
): PreparedDiasporaServiceDefinition | undefined {
  return PREPARED_DIASPORA_SERVICES.find((service) => service.id === serviceId);
}
