/** Century Vision™ — 100-year vision documentation architecture. */

import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "./bamSignalAcademy";
import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const CENTURY_VISION_TITLE = "Century Vision™";
export const CENTURY_VISION_LABEL = "Century Vision";
export const PRINCIPLE_LABEL = "Principle";
export const VISION_TIMELINE_LABEL = "Vision Timeline";
export const FOUNDING_VALUES_LABEL = "Founding Values";
export const INSTITUTION_LABEL = "Institution";

export const CENTURY_VISION_GOOD_COPY = ["Century Vision", "Stewardship", "Legacy", "Institution"] as const;

export const CENTURY_VISION_FORBIDDEN_COPY = ["Mission Statement", "Startup Vision"] as const;

export const CENTURY_VISION_SUBCOPY =
  "Document the 100-year vision — Century Vision and Institution with dignity, never a mission statement or startup pitch.";
export const CENTURY_VISION_PURPOSE_COPY =
  "Prepare century vision architecture — founding values, principles, and timelines reserved, not published yet.";
export const CENTURY_VISION_RESERVED_COPY =
  "Architecture prepared. Century vision documents, principles, and timelines are not enabled yet.";

export { GROWING_TOGETHER_LABEL, LEARNING_LABEL, RELATIONSHIP_WISDOM_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type PreparedVisionDocumentId =
  | "why-bamsignal-exists"
  | "why-relationships-matter"
  | "why-families-matter"
  | "why-africa-deserves-institutions"
  | "why-legacy-matters"
  | "why-communities-matter";

export type PreparedVisionDocumentDefinition = {
  id: PreparedVisionDocumentId;
  title: string;
  description: string;
  valuesId: string;
  timelineId: string;
};

export const PREPARED_VISION_DOCUMENTS: PreparedVisionDocumentDefinition[] = [
  {
    id: "why-bamsignal-exists",
    title: "Why BamSignal exists",
    description: "Why BamSignal exists — founding purpose for a century of stewardship.",
    valuesId: "cvis_values_bamsignal",
    timelineId: "cvis_timeline_bamsignal"
  },
  {
    id: "why-relationships-matter",
    title: "Why relationships matter",
    description: "Why relationships matter — the heart of the Century Vision.",
    valuesId: "cvis_values_relationships",
    timelineId: "cvis_timeline_relationships"
  },
  {
    id: "why-families-matter",
    title: "Why families matter",
    description: "Why families matter — household legacy across generations.",
    valuesId: "cvis_values_families",
    timelineId: "cvis_timeline_families"
  },
  {
    id: "why-africa-deserves-institutions",
    title: "Why Africa deserves institutions",
    description: "Why Africa deserves institutions — enduring structures, not startup pitches.",
    valuesId: "cvis_values_africa",
    timelineId: "cvis_timeline_africa"
  },
  {
    id: "why-legacy-matters",
    title: "Why legacy matters",
    description: "Why legacy matters — stewardship honoured over decades and centuries.",
    valuesId: "cvis_values_legacy",
    timelineId: "cvis_timeline_legacy"
  },
  {
    id: "why-communities-matter",
    title: "Why communities matter",
    description: "Why communities matter — collective strength for the 100-year vision.",
    valuesId: "cvis_values_communities",
    timelineId: "cvis_timeline_communities"
  }
];

export type PreparedCenturyPrincipleId =
  | "trust"
  | "stewardship"
  | "service"
  | "family"
  | "faith"
  | "legacy"
  | "human-dignity"
  | "community";

export type PreparedCenturyPrincipleDefinition = {
  id: PreparedCenturyPrincipleId;
  title: string;
  description: string;
};

export const PREPARED_CENTURY_PRINCIPLES: PreparedCenturyPrincipleDefinition[] = [
  {
    id: "trust",
    title: "Trust",
    description: "Trust — foundation of the Century Vision institution."
  },
  {
    id: "stewardship",
    title: "Stewardship",
    description: "Stewardship — long-term care, not a startup vision."
  },
  {
    id: "service",
    title: "Service",
    description: "Service — institutions built to serve families and communities."
  },
  {
    id: "family",
    title: "Family",
    description: "Family — central to the 100-year vision."
  },
  {
    id: "faith",
    title: "Faith",
    description: "Faith — honoured with dignity in the Century Vision."
  },
  {
    id: "legacy",
    title: "Legacy",
    description: "Legacy — generations remembered and strengthened."
  },
  {
    id: "human-dignity",
    title: "Human Dignity",
    description: "Human Dignity — every person treated with respect."
  },
  {
    id: "community",
    title: "Community",
    description: "Community — collective stewardship across the century."
  }
];

export type PreparedFoundingValuesId =
  | "cvis_values_bamsignal"
  | "cvis_values_relationships"
  | "cvis_values_families"
  | "cvis_values_africa"
  | "cvis_values_legacy"
  | "cvis_values_communities";

export type PreparedFoundingValuesDefinition = {
  id: PreparedFoundingValuesId;
  title: string;
  summary: string;
  documentId: PreparedVisionDocumentId;
};

export const PREPARED_FOUNDING_VALUES: PreparedFoundingValuesDefinition[] =
  PREPARED_VISION_DOCUMENTS.map((document) => ({
    id: document.valuesId as PreparedFoundingValuesId,
    title: document.title,
    summary: `${document.title} — Founding Values documented, not a mission statement.`,
    documentId: document.id
  }));

export type VisionTimelineEntry = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export type PreparedVisionTimelineId =
  | "cvis_timeline_bamsignal"
  | "cvis_timeline_relationships"
  | "cvis_timeline_families"
  | "cvis_timeline_africa"
  | "cvis_timeline_legacy"
  | "cvis_timeline_communities";

export type PreparedVisionTimelineDefinition = {
  id: PreparedVisionTimelineId;
  title: string;
  summary: string;
  documentId: PreparedVisionDocumentId;
  entries: VisionTimelineEntry[];
};

export const PREPARED_VISION_TIMELINES: PreparedVisionTimelineDefinition[] =
  PREPARED_VISION_DOCUMENTS.map((document, index) => ({
    id: document.timelineId as PreparedVisionTimelineId,
    title: `${VISION_TIMELINE_LABEL}: ${document.title}`,
    summary: `100-year vision timeline for ${document.title.toLowerCase()} — architecture preview.`,
    documentId: document.id,
    entries: [
      {
        id: `cvis_timeline_entry_${document.id}`,
        label: "Century milestone reserved",
        recordedAt: new Date(Date.UTC(2026, 0, 1 + index, 12, 0, 0)).toISOString(),
        note: "Architecture preview — vision timeline not live yet."
      }
    ]
  }));

export function getPreparedVisionDocument(
  documentId: PreparedVisionDocumentId
): PreparedVisionDocumentDefinition | undefined {
  return PREPARED_VISION_DOCUMENTS.find((document) => document.id === documentId);
}
