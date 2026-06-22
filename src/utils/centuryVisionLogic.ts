import type {
  PreparedCenturyPrincipleDefinition,
  PreparedCenturyPrincipleId,
  PreparedFoundingValuesDefinition,
  PreparedFoundingValuesId,
  PreparedVisionTimelineDefinition,
  PreparedVisionTimelineId
} from "../constants/centuryVision";
import {
  FOUNDING_VALUES_LABEL,
  PREPARED_CENTURY_PRINCIPLES,
  PREPARED_FOUNDING_VALUES,
  PREPARED_VISION_DOCUMENTS,
  PREPARED_VISION_TIMELINES,
  PRINCIPLE_LABEL,
  VISION_TIMELINE_LABEL
} from "../constants/centuryVision";

export type PrincipleViewModel = {
  id: PreparedCenturyPrincipleId;
  title: string;
  description: string;
  principleLabel: string;
  statusLabel: string;
};

export type VisionTimelineViewModel = {
  id: PreparedVisionTimelineId;
  title: string;
  summary: string;
  documentTitle: string;
  timelineLabel: string;
  entries: PreparedVisionTimelineDefinition["entries"];
  statusLabel: string;
};

export type FoundingValuesViewModel = {
  id: PreparedFoundingValuesId;
  title: string;
  summary: string;
  documentTitle: string;
  valuesLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildPrincipleViewModel(principle: PreparedCenturyPrincipleDefinition): PrincipleViewModel {
  return {
    id: principle.id,
    title: principle.title,
    description: principle.description,
    principleLabel: PRINCIPLE_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildVisionTimelineViewModel(
  timeline: PreparedVisionTimelineDefinition
): VisionTimelineViewModel {
  const document = PREPARED_VISION_DOCUMENTS.find((item) => item.id === timeline.documentId);
  return {
    id: timeline.id,
    title: timeline.title,
    summary: timeline.summary,
    documentTitle: document?.title ?? timeline.documentId,
    timelineLabel: VISION_TIMELINE_LABEL,
    entries: timeline.entries,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildFoundingValuesViewModel(values: PreparedFoundingValuesDefinition): FoundingValuesViewModel {
  const document = PREPARED_VISION_DOCUMENTS.find((item) => item.id === values.documentId);
  return {
    id: values.id,
    title: values.title,
    summary: values.summary,
    documentTitle: document?.title ?? values.documentId,
    valuesLabel: FOUNDING_VALUES_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitecturePrinciples(): PrincipleViewModel[] {
  return [...PREPARED_CENTURY_PRINCIPLES.map(buildPrincipleViewModel)];
}

export function listArchitectureVisionTimelines(): VisionTimelineViewModel[] {
  return [...PREPARED_VISION_TIMELINES.map(buildVisionTimelineViewModel)].sort((a, b) =>
    a.documentTitle.localeCompare(b.documentTitle)
  );
}

export function listArchitectureFoundingValues(): FoundingValuesViewModel[] {
  return [...PREPARED_FOUNDING_VALUES.map(buildFoundingValuesViewModel)].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}
