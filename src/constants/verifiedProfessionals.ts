/** Verified Professionals™ — verification architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const VERIFIED_PROFESSIONALS_TITLE = "Verified Professionals™";
export const VERIFIED_PROFESSIONALS_LABEL = "Verified Professionals";
export const VERIFIED_PROFILE_LABEL = "Verified Profile";

export const VERIFIED_PROFESSIONALS_SUBCOPY =
  "Verified relationship experts — trusted professionals with dignity, not a marketplace or vendor directory.";
export const VERIFIED_PROFESSIONALS_PURPOSE_COPY =
  "Prepare verified professionals architecture — expert badges reserved, not licenses or reviews yet.";
export const VERIFIED_PROFESSIONALS_RESERVED_COPY =
  "Architecture prepared. Licenses, certifications, and reviews are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedVerifiedBadgeId =
  | "verified-coach"
  | "verified-mentor"
  | "verified-family-advisor"
  | "verified-therapist"
  | "verified-faith-leader"
  | "verified-planner"
  | "verified-immigration-partner";

export type PreparedVerifiedBadgeDefinition = {
  id: PreparedVerifiedBadgeId;
  title: string;
  description: string;
  professionalId: string;
};

export const PREPARED_VERIFIED_BADGES: PreparedVerifiedBadgeDefinition[] = [
  {
    id: "verified-coach",
    title: "Verified Coach",
    description: "Verified coach — trusted guidance with dignity.",
    professionalId: "vp_prof_coach"
  },
  {
    id: "verified-mentor",
    title: "Verified Mentor",
    description: "Verified mentor — relationship wisdom for couples.",
    professionalId: "vp_prof_mentor"
  },
  {
    id: "verified-family-advisor",
    title: "Verified Family Advisor",
    description: "Verified family advisor — household support with care.",
    professionalId: "vp_prof_family"
  },
  {
    id: "verified-therapist",
    title: "Verified Therapist",
    description: "Verified therapist — professional support reserved.",
    professionalId: "vp_prof_therapist"
  },
  {
    id: "verified-faith-leader",
    title: "Verified Faith Leader",
    description: "Verified faith leader — respectful counsel and wisdom.",
    professionalId: "vp_prof_faith"
  },
  {
    id: "verified-planner",
    title: "Verified Planner",
    description: "Verified planner — celebration guidance, not vendor framing.",
    professionalId: "vp_prof_planner"
  },
  {
    id: "verified-immigration-partner",
    title: "Verified Immigration Partner",
    description: "Verified immigration partner — diaspora journey support.",
    professionalId: "vp_prof_immigration"
  }
];

export type PreparedVerifiedProfessionalId =
  | "vp_prof_coach"
  | "vp_prof_mentor"
  | "vp_prof_family"
  | "vp_prof_therapist"
  | "vp_prof_faith"
  | "vp_prof_planner"
  | "vp_prof_immigration";

export type PreparedVerifiedProfessionalDefinition = {
  id: PreparedVerifiedProfessionalId;
  name: string;
  title: string;
  focus: string;
  badgeId: PreparedVerifiedBadgeId;
};

export const PREPARED_VERIFIED_PROFESSIONALS: PreparedVerifiedProfessionalDefinition[] =
  PREPARED_VERIFIED_BADGES.map((badge) => ({
    id: badge.professionalId as PreparedVerifiedProfessionalId,
    name: "Reserved professional",
    title: `${badge.title} profile`,
    focus: badge.description,
    badgeId: badge.id
  }));

export type ExpertTimelineEntry = {
  id: string;
  professionalId: PreparedVerifiedProfessionalId;
  label: string;
  recordedAt: string;
  note?: string;
};

export type VerifiedProfessionalsFutureCapabilityId = "licenses" | "certifications" | "reviews";

export const VERIFIED_PROFESSIONALS_FUTURE_CAPABILITIES: {
  id: VerifiedProfessionalsFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "licenses",
    label: "Licenses",
    description: "Reserved — professional license verification with dignity."
  },
  {
    id: "certifications",
    label: "Certifications",
    description: "Reserved — certification records — never surveillance framing."
  },
  {
    id: "reviews",
    label: "Reviews",
    description: "Reserved — member reviews — not marketplace ratings."
  }
];

export function getPreparedVerifiedBadge(
  badgeId: PreparedVerifiedBadgeId
): PreparedVerifiedBadgeDefinition | undefined {
  return PREPARED_VERIFIED_BADGES.find((badge) => badge.id === badgeId);
}
