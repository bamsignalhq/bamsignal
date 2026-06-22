import { PREPARED_CERTIFICATES } from "../constants/relationshipCertificates";
import {
  listArchitectureAchievementBadges,
  listArchitectureCertificates,
  type AchievementBadgeViewModel,
  type CertificateViewModel
} from "./relationshipCertificatesLogic";

export type RelationshipCertificatesBundle = {
  certificates: CertificateViewModel[];
  badges: AchievementBadgeViewModel[];
  certificateCount: number;
};

export function getRelationshipCertificatesBundle(): RelationshipCertificatesBundle {
  return {
    certificates: listArchitectureCertificates(),
    badges: listArchitectureAchievementBadges(),
    certificateCount: PREPARED_CERTIFICATES.length
  };
}

export function getCertificate(certificateId: string): CertificateViewModel | null {
  return listArchitectureCertificates().find((certificate) => certificate.id === certificateId) ?? null;
}
