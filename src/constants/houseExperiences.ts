/** House Experiences™ — curated experiences at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const HOUSE_EXPERIENCES_TITLE = "House Experiences™";
export const HOUSE_EXPERIENCES_LABEL = "House Experiences";
export const EXPERIENCE_CARD_LABEL = "Experience";
export const PRIVATE_DINING_LABEL = "Private Dining";
export const CELEBRATION_EXPERIENCE_LABEL = "Celebration";

export const HOUSE_EXPERIENCES_SUBCOPY =
  "Curated experiences at The BamSignal House™ — Gather and Celebrate with dignity, not headquarters events.";
export const HOUSE_EXPERIENCES_PURPOSE_COPY =
  "Prepare House Experiences architecture — dining, celebrations, and gatherings reserved, not bookings yet.";
export const HOUSE_EXPERIENCES_RESERVED_COPY =
  "Architecture prepared. House experiences, private dining, and celebrations are not enabled yet.";
export const HOUSE_EXPERIENCES_FUTURE_READY_COPY =
  "Future-ready capabilities documented only — bookings, VIP access, and reservations are not implemented.";

export { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL, GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type FutureReadyHouseExperienceCapabilityId = "bookings" | "vip-access" | "reservations";

export type FutureReadyHouseExperienceCapabilityDefinition = {
  id: FutureReadyHouseExperienceCapabilityId;
  title: string;
  description: string;
};

export const FUTURE_READY_HOUSE_EXPERIENCE_CAPABILITIES: FutureReadyHouseExperienceCapabilityDefinition[] =
  [
    {
      id: "bookings",
      title: "Bookings",
      description: "Bookings — architecture reserved, not implemented."
    },
    {
      id: "vip-access",
      title: "VIP access",
      description: "VIP access — architecture reserved, not implemented."
    },
    {
      id: "reservations",
      title: "Reservations",
      description: "Reservations — architecture reserved, not implemented."
    }
  ];

export type PreparedHouseExperienceKind = "experience" | "private-dining" | "celebration";

export type PreparedHouseExperienceItemId =
  | "singles-dinner"
  | "brunch-experience"
  | "couples-dinner"
  | "legacy-night"
  | "anniversary-celebration"
  | "private-introductions"
  | "family-gatherings"
  | "relationship-workshops"
  | "mentorship-sessions"
  | "founders-dinners";

export type PreparedHouseExperienceItemDefinition = {
  id: PreparedHouseExperienceItemId;
  title: string;
  description: string;
  kind: PreparedHouseExperienceKind;
};

export const PREPARED_HOUSE_EXPERIENCE_ITEMS: PreparedHouseExperienceItemDefinition[] = [
  {
    id: "singles-dinner",
    title: "Singles Dinner",
    description: "Singles Dinner — private dining with dignity at The BamSignal House™.",
    kind: "private-dining"
  },
  {
    id: "brunch-experience",
    title: "Brunch Experience",
    description: "Brunch Experience — morning Gather reserved, not a branch event.",
    kind: "private-dining"
  },
  {
    id: "couples-dinner",
    title: "Couples Dinner",
    description: "Couples Dinner — intimate dining for lasting partnerships.",
    kind: "private-dining"
  },
  {
    id: "legacy-night",
    title: "Legacy Night",
    description: "Legacy Night — celebration honouring multi-generational stories.",
    kind: "celebration"
  },
  {
    id: "anniversary-celebration",
    title: "Anniversary Celebration",
    description: "Anniversary Celebration — milestones celebrated with Community.",
    kind: "celebration"
  },
  {
    id: "private-introductions",
    title: "Private Introductions",
    description: "Private Introductions — dignified connections over shared meals.",
    kind: "private-dining"
  },
  {
    id: "family-gatherings",
    title: "Family Gatherings",
    description: "Family Gatherings — household Home experiences reserved.",
    kind: "experience"
  },
  {
    id: "relationship-workshops",
    title: "Relationship Workshops",
    description: "Relationship Workshops — learning together at the House.",
    kind: "experience"
  },
  {
    id: "mentorship-sessions",
    title: "Mentorship Sessions",
    description: "Mentorship Sessions — guided growth in physical spaces.",
    kind: "experience"
  },
  {
    id: "founders-dinners",
    title: "Founders Dinners",
    description: "Founders Dinners — pioneering couples honoured, not corporate dinners.",
    kind: "private-dining"
  }
];

export function getPreparedHouseExperienceItem(
  itemId: PreparedHouseExperienceItemId
): PreparedHouseExperienceItemDefinition | undefined {
  return PREPARED_HOUSE_EXPERIENCE_ITEMS.find((item) => item.id === itemId);
}
