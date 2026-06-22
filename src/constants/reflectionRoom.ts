/** Reflection Room™ — quiet sacred spaces at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const REFLECTION_ROOM_TITLE = "Reflection Room™";
export const REFLECTION_ROOM_LABEL = "Reflection Room";
export const REFLECTION_CARD_LABEL = "Reflection";
export const PRAYER_CARD_LABEL = "Prayer";
export const MEDITATION_CARD_LABEL = "Meditation";
export const FAITH_RESPECT_LABEL = "Faith respect";

export const REFLECTION_ROOM_SUBCOPY =
  "The Reflection Room™ at The BamSignal House™ — Prayer, Reflection, Meditation, and quiet moments with dignity for every faith.";
export const REFLECTION_ROOM_PURPOSE_COPY =
  "Prepare Reflection Room architecture — sacred quiet reserved, not chapels or headquarters prayer rooms.";
export const REFLECTION_ROOM_RESERVED_COPY =
  "Architecture prepared. Reflection Room spaces are not enabled yet.";
export const REFLECTION_ROOM_FAITH_RESPECT_COPY =
  "All traditions welcomed with respect — Christian, Muslim, Traditional, and other faiths honoured equally.";

export { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL, GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedFaithRespectId = "christian" | "muslim" | "traditional" | "other-faiths";

export type PreparedFaithRespectDefinition = {
  id: PreparedFaithRespectId;
  title: string;
  description: string;
};

export const PREPARED_FAITH_RESPECT_TRADITIONS: PreparedFaithRespectDefinition[] = [
  {
    id: "christian",
    title: "Christian",
    description: "Christian — Prayer and Reflection welcomed with dignity at the House."
  },
  {
    id: "muslim",
    title: "Muslim",
    description: "Muslim — sacred quiet and Prayer respected without compromise."
  },
  {
    id: "traditional",
    title: "Traditional",
    description: "Traditional — ancestral wisdom and quiet moments honoured."
  },
  {
    id: "other-faiths",
    title: "Other faiths",
    description: "Other faiths — every path to quiet Reflection treated with equal respect."
  }
];

export type PreparedReflectionPurposeKind = "prayer" | "reflection" | "meditation";

export type PreparedReflectionPurposeId =
  | "prayer"
  | "reflection"
  | "meditation"
  | "quiet-moments";

export type PreparedReflectionPurposeDefinition = {
  id: PreparedReflectionPurposeId;
  title: string;
  description: string;
  kind: PreparedReflectionPurposeKind;
};

export const PREPARED_REFLECTION_PURPOSES: PreparedReflectionPurposeDefinition[] = [
  {
    id: "prayer",
    title: "Prayer",
    description: "Prayer — sacred stillness for every faith tradition at the House.",
    kind: "prayer"
  },
  {
    id: "reflection",
    title: "Reflection",
    description: "Reflection — thoughtful pause for relationship wisdom and Legacy.",
    kind: "reflection"
  },
  {
    id: "meditation",
    title: "Meditation",
    description: "Meditation — guided quiet for inner calm, not headquarters wellness pods.",
    kind: "meditation"
  },
  {
    id: "quiet-moments",
    title: "Quiet moments",
    description: "Quiet moments — unhurried stillness reserved for Community and self.",
    kind: "reflection"
  }
];

export function getPreparedReflectionPurpose(
  purposeId: PreparedReflectionPurposeId
): PreparedReflectionPurposeDefinition | undefined {
  return PREPARED_REFLECTION_PURPOSES.find((purpose) => purpose.id === purposeId);
}

export function getPreparedFaithRespectTradition(
  traditionId: PreparedFaithRespectId
): PreparedFaithRespectDefinition | undefined {
  return PREPARED_FAITH_RESPECT_TRADITIONS.find((tradition) => tradition.id === traditionId);
}
