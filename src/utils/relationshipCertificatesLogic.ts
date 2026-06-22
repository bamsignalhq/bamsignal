import type {
  PreparedAchievementBadgeDefinition,
  PreparedCertificateDefinition,
  PreparedCertificateId
} from "../constants/relationshipCertificates";
import { PREPARED_ACHIEVEMENT_BADGES, PREPARED_CERTIFICATES } from "../constants/relationshipCertificates";

export type CertificateViewModel = {
  id: PreparedCertificateId;
  title: string;
  description: string;
  badgeLabel: string;
  statusLabel: string;
};

export type AchievementBadgeViewModel = {
  id: string;
  label: string;
  tier: string;
  focus: string;
  certificateTitle: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildCertificateViewModel(
  certificate: PreparedCertificateDefinition
): CertificateViewModel {
  const badge = PREPARED_ACHIEVEMENT_BADGES.find((item) => item.id === certificate.badgeId);
  return {
    id: certificate.id,
    title: certificate.title,
    description: certificate.description,
    badgeLabel: badge?.label ?? "Reserved badge",
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildAchievementBadgeViewModel(
  badge: PreparedAchievementBadgeDefinition
): AchievementBadgeViewModel {
  const certificate = PREPARED_CERTIFICATES.find((item) => item.id === badge.certificateId);
  return {
    id: badge.id,
    label: badge.label,
    tier: badge.tier,
    focus: badge.focus,
    certificateTitle: certificate?.title ?? badge.certificateId,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureCertificates(): CertificateViewModel[] {
  return [...PREPARED_CERTIFICATES.map(buildCertificateViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export function listArchitectureAchievementBadges(): AchievementBadgeViewModel[] {
  return [...PREPARED_ACHIEVEMENT_BADGES.map(buildAchievementBadgeViewModel)].sort((a, b) =>
    a.certificateTitle.localeCompare(b.certificateTitle)
  );
}
