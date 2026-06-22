/** Legacy Garden™ — outdoor reflection at The BamSignal House architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const LEGACY_GARDEN_TITLE = "Legacy Garden™";
export const LEGACY_GARDEN_LABEL = "Legacy Garden";
export const GARDEN_EXPERIENCE_LABEL = "Garden Experience";
export const MEMORY_TREE_LABEL = "Memory Tree";

export const LEGACY_GARDEN_SUBCOPY =
  "Legacy Garden™ at The BamSignal House™ — Reflection, Celebration, Photography, and quiet conversations among living Legacy.";
export const LEGACY_GARDEN_PURPOSE_COPY =
  "Prepare Legacy Garden architecture — outdoor spaces reserved, not headquarters grounds or branch parks.";
export const LEGACY_GARDEN_RESERVED_COPY =
  "Architecture prepared. Legacy Garden experiences are not enabled yet.";

export { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL, GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedLegacyGardenPurposeKind = "garden-experience" | "memory-tree";

export type PreparedLegacyGardenPurposeId =
  | "reflection"
  | "celebration"
  | "photography"
  | "quiet-conversations";

export type PreparedLegacyGardenPurposeDefinition = {
  id: PreparedLegacyGardenPurposeId;
  title: string;
  description: string;
  kind: PreparedLegacyGardenPurposeKind;
};

export const PREPARED_LEGACY_GARDEN_PURPOSES: PreparedLegacyGardenPurposeDefinition[] = [
  {
    id: "reflection",
    title: "Reflection",
    description: "Reflection — thoughtful pause among trees and Legacy plantings at the Garden.",
    kind: "garden-experience"
  },
  {
    id: "celebration",
    title: "Celebration",
    description: "Celebration — milestones honoured outdoors with dignity, not branch events.",
    kind: "garden-experience"
  },
  {
    id: "photography",
    title: "Photography",
    description: "Photography — timeless portraits captured in the Garden's natural light.",
    kind: "garden-experience"
  },
  {
    id: "quiet-conversations",
    title: "Quiet conversations",
    description: "Quiet conversations — unhurried dialogue beneath Memory Trees at the House.",
    kind: "memory-tree"
  }
];

export function getPreparedLegacyGardenPurpose(
  purposeId: PreparedLegacyGardenPurposeId
): PreparedLegacyGardenPurposeDefinition | undefined {
  return PREPARED_LEGACY_GARDEN_PURPOSES.find((purpose) => purpose.id === purposeId);
}
