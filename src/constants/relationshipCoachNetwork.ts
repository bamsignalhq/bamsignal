/** Relationship Coach Network™ — coach network architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const RELATIONSHIP_COACH_NETWORK_TITLE = "Relationship Coach Network™";
export const RELATIONSHIP_COACH_NETWORK_LABEL = "Relationship Coach Network";
export const COACH_PROFILE_LABEL = "Coach Profile";
export const COACH_BADGE_LABEL = "Coach Badge";

export const RELATIONSHIP_COACH_NETWORK_SUBCOPY =
  "Trusted relationship coaches — guidance and support with dignity, not a marketplace or vendor directory.";
export const RELATIONSHIP_COACH_NETWORK_PURPOSE_COPY =
  "Prepare relationship coach network — expert coaches reserved, not booking or profiles yet.";
export const RELATIONSHIP_COACH_NETWORK_RESERVED_COPY =
  "Architecture prepared. Coach profiles and network matching are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedCoachSpecialtyId =
  | "communication-coach"
  | "dating-coach"
  | "marriage-coach"
  | "conflict-coach"
  | "intimacy-coach"
  | "diaspora-coach";

export type PreparedCoachSpecialtyDefinition = {
  id: PreparedCoachSpecialtyId;
  title: string;
  description: string;
  coachId: string;
};

export const PREPARED_COACH_SPECIALTIES: PreparedCoachSpecialtyDefinition[] = [
  {
    id: "communication-coach",
    title: "Communication Coach",
    description: "Communication coach — growing together with expert guidance.",
    coachId: "rcn_coach_communication"
  },
  {
    id: "dating-coach",
    title: "Dating Coach",
    description: "Dating coach — intentional relationship wisdom.",
    coachId: "rcn_coach_dating"
  },
  {
    id: "marriage-coach",
    title: "Marriage Coach",
    description: "Marriage coach — support for couples with dignity.",
    coachId: "rcn_coach_marriage"
  },
  {
    id: "conflict-coach",
    title: "Conflict Coach",
    description: "Conflict coach — healthy resolution and relationship wisdom.",
    coachId: "rcn_coach_conflict"
  },
  {
    id: "intimacy-coach",
    title: "Intimacy Coach",
    description: "Intimacy coach — connection guidance with care.",
    coachId: "rcn_coach_intimacy"
  },
  {
    id: "diaspora-coach",
    title: "Diaspora Coach",
    description: "Diaspora coach — Journey Across Borders expertise.",
    coachId: "rcn_coach_diaspora"
  }
];

export type PreparedCoachId =
  | "rcn_coach_communication"
  | "rcn_coach_dating"
  | "rcn_coach_marriage"
  | "rcn_coach_conflict"
  | "rcn_coach_intimacy"
  | "rcn_coach_diaspora";

export type PreparedCoachDefinition = {
  id: PreparedCoachId;
  name: string;
  title: string;
  focus: string;
  specialtyId: PreparedCoachSpecialtyId;
};

export const PREPARED_COACHES: PreparedCoachDefinition[] = PREPARED_COACH_SPECIALTIES.map(
  (specialty) => ({
    id: specialty.coachId as PreparedCoachId,
    name: "Reserved coach",
    title: `${specialty.title} profile`,
    focus: specialty.description,
    specialtyId: specialty.id
  })
);

export function getPreparedCoachSpecialty(
  specialtyId: PreparedCoachSpecialtyId
): PreparedCoachSpecialtyDefinition | undefined {
  return PREPARED_COACH_SPECIALTIES.find((specialty) => specialty.id === specialtyId);
}
