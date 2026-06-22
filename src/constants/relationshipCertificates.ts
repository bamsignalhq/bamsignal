/** Relationship Certificates™ — milestone recognition architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const RELATIONSHIP_CERTIFICATES_TITLE = "Relationship Certificates™";
export const RELATIONSHIP_CERTIFICATES_LABEL = "Relationship Certificates";
export const CERTIFICATE_LABEL = "Certificate";

export const RELATIONSHIP_CERTIFICATES_SUBCOPY =
  "Milestone recognition with dignity — prepared certificates for relationship journeys, not training credentials.";
export const RELATIONSHIP_CERTIFICATES_PURPOSE_COPY =
  "Prepare relationship certificates — honoring growth and commitment, not exams or completion tracking yet.";
export const RELATIONSHIP_CERTIFICATES_RESERVED_COPY =
  "Architecture prepared. Issuance and verification are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedCertificateId =
  | "dating-intentionally"
  | "premarital-journey"
  | "communication-excellence"
  | "marriage-enrichment"
  | "parenting-foundations"
  | "diaspora-couples";

export type PreparedCertificateDefinition = {
  id: PreparedCertificateId;
  title: string;
  description: string;
  badgeId: string;
};

export const PREPARED_CERTIFICATES: PreparedCertificateDefinition[] = [
  {
    id: "dating-intentionally",
    title: "Dating Intentionally",
    description: "Dating intentionally — relationship wisdom recognized with dignity.",
    badgeId: "rcert_badge_dating"
  },
  {
    id: "premarital-journey",
    title: "Premarital Journey",
    description: "Premarital journey completion — preparing for forever honored.",
    badgeId: "rcert_badge_premarital"
  },
  {
    id: "communication-excellence",
    title: "Communication Excellence",
    description: "Communication excellence — growing together recognized.",
    badgeId: "rcert_badge_communication"
  },
  {
    id: "marriage-enrichment",
    title: "Marriage Enrichment",
    description: "Marriage enrichment — relationship wisdom milestone prepared.",
    badgeId: "rcert_badge_marriage"
  },
  {
    id: "parenting-foundations",
    title: "Parenting Foundations",
    description: "Parenting foundations — family growth recognized with care.",
    badgeId: "rcert_badge_parenting"
  },
  {
    id: "diaspora-couples",
    title: "Diaspora Couples",
    description: "Diaspora couples — Journey Across Borders milestone honored.",
    badgeId: "rcert_badge_diaspora"
  }
];

export type PreparedAchievementBadgeDefinition = {
  id: string;
  label: string;
  tier: string;
  focus: string;
  certificateId: PreparedCertificateId;
};

export const PREPARED_ACHIEVEMENT_BADGES: PreparedAchievementBadgeDefinition[] =
  PREPARED_CERTIFICATES.map((certificate) => ({
    id: certificate.badgeId,
    label: "Reserved badge",
    tier: "Architecture prepared",
    focus: certificate.description,
    certificateId: certificate.id
  }));

export function getPreparedCertificate(
  certificateId: PreparedCertificateId
): PreparedCertificateDefinition | undefined {
  return PREPARED_CERTIFICATES.find((certificate) => certificate.id === certificateId);
}
