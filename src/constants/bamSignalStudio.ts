/** BamSignal Studio™ — production architecture for relationship media. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";
import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL } from "./bamSignalHouse";

export const BAMSIGNAL_STUDIO_TITLE = "BamSignal Studio™";
export const BAMSIGNAL_STUDIO_LABEL = "BamSignal Studio";
export const PODCAST_STUDIO_LABEL = "Podcast Studio";
export const DOCUMENTARY_STUDIO_LABEL = "Documentary Studio";
export const CREATOR_STUDIO_LABEL = "Creator Studio";

export const BAMSIGNAL_STUDIO_SUBCOPY =
  "BamSignal Studio™ — Podcasts, Documentaries, Interviews, Masterclasses, and Storytelling for relationship Legacy.";
export const BAMSIGNAL_STUDIO_PURPOSE_COPY =
  "Prepare BamSignal Studio architecture — production reserved, not broadcasting or headquarters media yet.";
export const BAMSIGNAL_STUDIO_RESERVED_COPY =
  "Architecture prepared. BamSignal Studio production is not enabled yet.";

export { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, BAMSIGNAL_HOUSE_LABEL, GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedStudioProductionKind = "podcast" | "documentary" | "creator";

export type PreparedStudioProductionId =
  | "podcasts"
  | "documentaries"
  | "interviews"
  | "masterclasses"
  | "storytelling";

export type PreparedStudioProductionDefinition = {
  id: PreparedStudioProductionId;
  title: string;
  description: string;
  kind: PreparedStudioProductionKind;
};

export const PREPARED_STUDIO_PRODUCTIONS: PreparedStudioProductionDefinition[] = [
  {
    id: "podcasts",
    title: "Podcasts",
    description: "Podcasts — audio storytelling from BamSignal Studio™, not headquarters broadcasts.",
    kind: "podcast"
  },
  {
    id: "documentaries",
    title: "Documentaries",
    description: "Documentaries — visual Legacy narratives produced with dignity.",
    kind: "documentary"
  },
  {
    id: "interviews",
    title: "Interviews",
    description: "Interviews — meaningful conversations captured at the Studio.",
    kind: "podcast"
  },
  {
    id: "masterclasses",
    title: "Masterclasses",
    description: "Masterclasses — relationship wisdom taught, not branch office training.",
    kind: "creator"
  },
  {
    id: "storytelling",
    title: "Storytelling",
    description: "Storytelling — Community voices and Legacy stories prepared for the world.",
    kind: "creator"
  }
];

export function getPreparedStudioProduction(
  productionId: PreparedStudioProductionId
): PreparedStudioProductionDefinition | undefined {
  return PREPARED_STUDIO_PRODUCTIONS.find((production) => production.id === productionId);
}
