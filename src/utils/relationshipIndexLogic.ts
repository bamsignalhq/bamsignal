import type {
  PreparedRelationshipIndexDefinition,
  PreparedRelationshipIndexId,
  RelationshipIndexTimelineEntry
} from "../constants/relationshipIndex";
import { PREPARED_RELATIONSHIP_INDICES } from "../constants/relationshipIndex";

export type RelationshipIndexViewModel = {
  id: PreparedRelationshipIndexId;
  title: string;
  description: string;
  indicatorYear: number;
  statusLabel: string;
  timeline: RelationshipIndexTimelineEntry[];
};

function buildIndexTimeline(index: PreparedRelationshipIndexDefinition): RelationshipIndexTimelineEntry[] {
  const base = new Date(`${index.indicatorYear - 1}-06-01T00:00:00.000Z`).getTime();
  const steps = [
    { label: "Index architecture prepared", note: "Yearly indicator — not published yet." },
    { label: "Indicator framing defined", note: index.description },
    { label: "Insights pathway reserved", note: "Never ratings, scores, or leaderboards." }
  ];
  return steps.map((step, stepIndex) => ({
    id: `rix_timeline_${index.id}_${stepIndex}`,
    indexId: index.id,
    label: step.label,
    recordedAt: new Date(base + stepIndex * 50 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildRelationshipIndexViewModel(
  index: PreparedRelationshipIndexDefinition
): RelationshipIndexViewModel {
  return {
    id: index.id,
    title: index.title,
    description: index.description,
    indicatorYear: index.indicatorYear,
    statusLabel: "Architecture prepared — not published yet",
    timeline: buildIndexTimeline(index)
  };
}

export function sortRelationshipIndices(indices: RelationshipIndexViewModel[]): RelationshipIndexViewModel[] {
  return [...indices].sort((a, b) => a.title.localeCompare(b.title));
}

export function listArchitectureRelationshipIndices(): RelationshipIndexViewModel[] {
  return sortRelationshipIndices(PREPARED_RELATIONSHIP_INDICES.map(buildRelationshipIndexViewModel));
}

export function listGeneralRelationshipIndices(): RelationshipIndexViewModel[] {
  return listArchitectureRelationshipIndices().filter((index) => {
    const definition = PREPARED_RELATIONSHIP_INDICES.find((item) => item.id === index.id);
    return definition?.kind === "general";
  });
}

export function listCommunityRelationshipIndices(): RelationshipIndexViewModel[] {
  return listArchitectureRelationshipIndices().filter((index) => {
    const definition = PREPARED_RELATIONSHIP_INDICES.find((item) => item.id === index.id);
    return definition?.kind === "community";
  });
}
