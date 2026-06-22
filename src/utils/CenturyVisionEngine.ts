import {
  PREPARED_CENTURY_PRINCIPLES,
  PREPARED_VISION_DOCUMENTS
} from "../constants/centuryVision";
import {
  listArchitectureFoundingValues,
  listArchitecturePrinciples,
  listArchitectureVisionTimelines,
  type FoundingValuesViewModel,
  type PrincipleViewModel,
  type VisionTimelineViewModel
} from "./centuryVisionLogic";

export type CenturyVisionBundle = {
  principles: PrincipleViewModel[];
  timelines: VisionTimelineViewModel[];
  foundingValues: FoundingValuesViewModel[];
  documentCount: number;
  principleCount: number;
};

export function getCenturyVisionBundle(): CenturyVisionBundle {
  return {
    principles: listArchitecturePrinciples(),
    timelines: listArchitectureVisionTimelines(),
    foundingValues: listArchitectureFoundingValues(),
    documentCount: PREPARED_VISION_DOCUMENTS.length,
    principleCount: PREPARED_CENTURY_PRINCIPLES.length
  };
}

export function getCenturyPrinciple(principleId: string): PrincipleViewModel | null {
  return listArchitecturePrinciples().find((principle) => principle.id === principleId) ?? null;
}
