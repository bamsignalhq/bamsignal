import type {
  ExpertTimelineEntry,
  PreparedVerifiedBadgeDefinition,
  PreparedVerifiedBadgeId,
  PreparedVerifiedProfessionalDefinition,
  PreparedVerifiedProfessionalId
} from "../constants/verifiedProfessionals";
import { PREPARED_VERIFIED_BADGES, PREPARED_VERIFIED_PROFESSIONALS } from "../constants/verifiedProfessionals";

export type ProfessionalProfileViewModel = {
  id: PreparedVerifiedProfessionalId;
  name: string;
  title: string;
  focus: string;
  badgeTitle: string;
  statusLabel: string;
  timeline: ExpertTimelineEntry[];
};

export type ProfessionalBadgeViewModel = {
  id: PreparedVerifiedBadgeId;
  title: string;
  description: string;
  professionalName: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

function buildExpertTimeline(
  professional: PreparedVerifiedProfessionalDefinition
): ExpertTimelineEntry[] {
  const base = new Date("2026-06-20T00:00:00.000Z").getTime();
  const steps = [
    { label: "Verification architecture prepared", note: "Verified professionals — not live yet." },
    { label: "Expert badge reserved", note: professional.focus },
    { label: "Timeline reserved", note: "No licenses or reviews yet." }
  ];
  return steps.map((step, index) => ({
    id: `vp_timeline_${professional.id}_${index}`,
    professionalId: professional.id,
    label: step.label,
    recordedAt: new Date(base + index * 18 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildProfessionalProfileViewModel(
  professional: PreparedVerifiedProfessionalDefinition
): ProfessionalProfileViewModel {
  const badge = PREPARED_VERIFIED_BADGES.find((item) => item.id === professional.badgeId);
  return {
    id: professional.id,
    name: professional.name,
    title: professional.title,
    focus: professional.focus,
    badgeTitle: badge?.title ?? professional.badgeId,
    statusLabel: ARCHITECTURE_STATUS,
    timeline: buildExpertTimeline(professional)
  };
}

export function buildProfessionalBadgeViewModel(
  badge: PreparedVerifiedBadgeDefinition
): ProfessionalBadgeViewModel {
  const professional = PREPARED_VERIFIED_PROFESSIONALS.find(
    (item) => item.id === badge.professionalId
  );
  return {
    id: badge.id,
    title: badge.title,
    description: badge.description,
    professionalName: professional?.name ?? "Reserved professional",
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitectureProfessionalProfiles(): ProfessionalProfileViewModel[] {
  return [...PREPARED_VERIFIED_PROFESSIONALS.map(buildProfessionalProfileViewModel)].sort((a, b) =>
    a.badgeTitle.localeCompare(b.badgeTitle)
  );
}

export function listArchitectureProfessionalBadges(): ProfessionalBadgeViewModel[] {
  return [...PREPARED_VERIFIED_BADGES.map(buildProfessionalBadgeViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}
