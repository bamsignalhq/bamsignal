/** Legacy Professionals™ — multi-decade expert ecosystem architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const LEGACY_PROFESSIONALS_TITLE = "Legacy Professionals™";
export const LEGACY_PROFESSIONALS_LABEL = "Legacy Professionals";
export const LEGACY_PROFESSIONAL_LABEL = "Legacy Professional";
export const LEGACY_ROLE_LABEL = "Legacy Role";
export const PROFESSIONAL_JOURNEY_LABEL = "Professional Journey";
export const TRUSTED_ADVISOR_LABEL = "Trusted Advisor";
export const LIFETIME_STEWARD_LABEL = "Lifetime Steward";
export const HALL_OF_TRUST_LABEL = "Hall of Trust";
export const LEGACY_PROFESSIONAL_BADGE_LABEL = "Legacy Professional Badge";
export const LEGACY_CONTRIBUTION_LABEL = "Legacy Contribution";

export const LEGACY_PROFESSIONALS_GOOD_COPY = [
  "Legacy Professional",
  "Trusted Advisor",
  "Lifetime Steward",
  "Hall of Trust"
] as const;

export const LEGACY_PROFESSIONALS_FORBIDDEN_COPY = ["Senior Employee", "Veteran"] as const;

export const LEGACY_PROFESSIONALS_SUBCOPY =
  "Multi-decade expert ecosystem — Legacy Professionals and Trusted Advisors with dignity, never senior employees or veterans.";
export const LEGACY_PROFESSIONALS_PURPOSE_COPY =
  "Prepare multi-decade expert ecosystem — legacy roles and journeys reserved, not fellowships or awards yet.";
export const LEGACY_PROFESSIONALS_RESERVED_COPY =
  "Architecture prepared. Legacy professional profiles, roles, and journeys are not enabled yet.";
export const LEGACY_PROFESSIONALS_FUTURE_READY_COPY =
  "Future-ready capabilities documented only — legacy awards, professional fellowships, Hall of Trust, and lifetime stewardship are not implemented.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type FutureReadyLegacyProfessionalCapabilityId =
  | "legacy-awards"
  | "professional-fellowships"
  | "hall-of-trust"
  | "lifetime-stewardship";

export type FutureReadyLegacyProfessionalCapabilityDefinition = {
  id: FutureReadyLegacyProfessionalCapabilityId;
  title: string;
  description: string;
};

export const FUTURE_READY_LEGACY_PROFESSIONAL_CAPABILITIES: FutureReadyLegacyProfessionalCapabilityDefinition[] =
  [
    {
      id: "legacy-awards",
      title: "Legacy awards",
      description: "Legacy awards — architecture reserved, not implemented."
    },
    {
      id: "professional-fellowships",
      title: "Professional fellowships",
      description: "Professional fellowships — architecture reserved, not implemented."
    },
    {
      id: "hall-of-trust",
      title: "Hall of Trust",
      description: "Hall of Trust — architecture reserved, not implemented."
    },
    {
      id: "lifetime-stewardship",
      title: "Lifetime stewardship",
      description: "Lifetime stewardship — architecture reserved, not implemented."
    }
  ];

export type PreparedLegacyRoleId =
  | "legacy-coaches"
  | "legacy-mentors"
  | "legacy-advisors"
  | "legacy-family-specialists"
  | "legacy-diaspora-experts";

export type PreparedLegacyRoleDefinition = {
  id: PreparedLegacyRoleId;
  title: string;
  description: string;
  professionalId: string;
  journeyId: string;
};

export const PREPARED_LEGACY_ROLES: PreparedLegacyRoleDefinition[] = [
  {
    id: "legacy-coaches",
    title: "Legacy Coaches",
    description: "Legacy Coaches — multi-decade guidance with trusted stewardship.",
    professionalId: "lgpr_prof_coaches",
    journeyId: "lgpr_journey_coaches"
  },
  {
    id: "legacy-mentors",
    title: "Legacy Mentors",
    description: "Legacy Mentors — Lifetime Steward wisdom across generations.",
    professionalId: "lgpr_prof_mentors",
    journeyId: "lgpr_journey_mentors"
  },
  {
    id: "legacy-advisors",
    title: "Legacy Advisors",
    description: "Legacy Advisors — Trusted Advisor standing earned over decades.",
    professionalId: "lgpr_prof_advisors",
    journeyId: "lgpr_journey_advisors"
  },
  {
    id: "legacy-family-specialists",
    title: "Legacy Family Specialists",
    description: "Legacy Family Specialists — household wisdom with lasting impact.",
    professionalId: "lgpr_prof_family",
    journeyId: "lgpr_journey_family"
  },
  {
    id: "legacy-diaspora-experts",
    title: "Legacy Diaspora Experts",
    description: "Legacy Diaspora Experts — cross-border expertise honoured with dignity.",
    professionalId: "lgpr_prof_diaspora",
    journeyId: "lgpr_journey_diaspora"
  }
];

export type PreparedLegacyProfessionalId =
  | "lgpr_prof_coaches"
  | "lgpr_prof_mentors"
  | "lgpr_prof_advisors"
  | "lgpr_prof_family"
  | "lgpr_prof_diaspora";

export type PreparedLegacyProfessionalDefinition = {
  id: PreparedLegacyProfessionalId;
  name: string;
  title: string;
  focus: string;
  roleId: PreparedLegacyRoleId;
  stewardLabel: string;
};

export const PREPARED_LEGACY_PROFESSIONALS: PreparedLegacyProfessionalDefinition[] =
  PREPARED_LEGACY_ROLES.map((role) => ({
    id: role.professionalId as PreparedLegacyProfessionalId,
    name: "Reserved legacy professional",
    title: `${role.title} profile`,
    focus: role.description,
    roleId: role.id,
    stewardLabel: TRUSTED_ADVISOR_LABEL
  }));

export type PreparedProfessionalJourneyId =
  | "lgpr_journey_coaches"
  | "lgpr_journey_mentors"
  | "lgpr_journey_advisors"
  | "lgpr_journey_family"
  | "lgpr_journey_diaspora";

export type ProfessionalJourneyEntry = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export type PreparedProfessionalJourneyDefinition = {
  id: PreparedProfessionalJourneyId;
  title: string;
  summary: string;
  roleId: PreparedLegacyRoleId;
  entries: ProfessionalJourneyEntry[];
};

export const PREPARED_PROFESSIONAL_JOURNEYS: PreparedProfessionalJourneyDefinition[] =
  PREPARED_LEGACY_ROLES.map((role, index) => ({
    id: role.journeyId as PreparedProfessionalJourneyId,
    title: `${PROFESSIONAL_JOURNEY_LABEL}: ${role.title}`,
    summary: `Multi-decade ${role.title.toLowerCase()} journey — architecture preview.`,
    roleId: role.id,
    entries: [
      {
        id: `lgpr_journey_entry_${role.id}`,
        label: `${LEGACY_PROFESSIONAL_LABEL} milestone reserved`,
        recordedAt: new Date(Date.UTC(2026, 0, 1 + index, 12, 0, 0)).toISOString(),
        note: "Architecture preview — professional journey not live yet."
      }
    ]
  }));

export type PreparedLegacyProfessionalBadgeId =
  | "lgpr_badge_coaches"
  | "lgpr_badge_mentors"
  | "lgpr_badge_advisors"
  | "lgpr_badge_family"
  | "lgpr_badge_diaspora";

export type PreparedLegacyProfessionalBadgeDefinition = {
  id: PreparedLegacyProfessionalBadgeId;
  title: string;
  description: string;
  roleId: PreparedLegacyRoleId;
  honorLabel: string;
};

export const PREPARED_LEGACY_PROFESSIONAL_BADGES: PreparedLegacyProfessionalBadgeDefinition[] =
  PREPARED_LEGACY_ROLES.map((role) => {
    const badgeIdByRole: Record<PreparedLegacyRoleId, PreparedLegacyProfessionalBadgeId> = {
      "legacy-coaches": "lgpr_badge_coaches",
      "legacy-mentors": "lgpr_badge_mentors",
      "legacy-advisors": "lgpr_badge_advisors",
      "legacy-family-specialists": "lgpr_badge_family",
      "legacy-diaspora-experts": "lgpr_badge_diaspora"
    };
    return {
      id: badgeIdByRole[role.id],
      title: `${role.title} badge`,
      description: `${role.title} — ${HALL_OF_TRUST_LABEL} honour reserved, not a veteran pin.`,
      roleId: role.id,
      honorLabel: HALL_OF_TRUST_LABEL
    };
  });

export type PreparedLegacyContributionId =
  | "lgpr_contribution_coaches"
  | "lgpr_contribution_mentors"
  | "lgpr_contribution_advisors"
  | "lgpr_contribution_family"
  | "lgpr_contribution_diaspora";

export type PreparedLegacyContributionDefinition = {
  id: PreparedLegacyContributionId;
  title: string;
  summary: string;
  roleId: PreparedLegacyRoleId;
  stewardLabel: string;
};

export const PREPARED_LEGACY_CONTRIBUTIONS: PreparedLegacyContributionDefinition[] =
  PREPARED_LEGACY_ROLES.map((role) => {
    const contributionIdByRole: Record<PreparedLegacyRoleId, PreparedLegacyContributionId> = {
      "legacy-coaches": "lgpr_contribution_coaches",
      "legacy-mentors": "lgpr_contribution_mentors",
      "legacy-advisors": "lgpr_contribution_advisors",
      "legacy-family-specialists": "lgpr_contribution_family",
      "legacy-diaspora-experts": "lgpr_contribution_diaspora"
    };
    return {
      id: contributionIdByRole[role.id],
      title: `${role.title} contribution`,
      summary: `Multi-decade ${role.title.toLowerCase()} contribution — ${LIFETIME_STEWARD_LABEL} honour, not senior employment.`,
      roleId: role.id,
      stewardLabel: LIFETIME_STEWARD_LABEL
    };
  });

export function getPreparedLegacyRole(roleId: PreparedLegacyRoleId): PreparedLegacyRoleDefinition | undefined {
  return PREPARED_LEGACY_ROLES.find((role) => role.id === roleId);
}
