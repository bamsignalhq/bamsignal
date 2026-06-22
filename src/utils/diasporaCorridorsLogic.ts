import type {
  CorridorStatusId,
  DiasporaCorridorDefinition,
  DiasporaCorridorDisplayId,
  DiasporaCorridorTimelineEntry
} from "../constants/diasporaCorridors";
import {
  CORRIDOR_DESTINATION_LABELS,
  CORRIDOR_ORIGIN_LABELS,
  corridorRouteLabel,
  corridorStatusLabel
} from "../constants/diasporaCorridors";

export type DiasporaCorridorDisplayRow = {
  id: DiasporaCorridorDisplayId;
  label: string;
  value?: string;
  reached: boolean;
};

export type DiasporaCorridorViewModel = {
  id: string;
  routeLabel: string;
  originLabel: string;
  destinationLabel: string;
  status: CorridorStatusId;
  statusLabel: string;
  communityMaturity: string;
  successStoriesCount: number;
  legacyFamiliesCount: number;
  displayRows: DiasporaCorridorDisplayRow[];
  timeline: DiasporaCorridorTimelineEntry[];
};

const DISPLAY_FIELD_LABELS: Record<DiasporaCorridorDisplayId, string> = {
  origin: "Origin",
  destination: "Destination",
  "community-maturity": "Community maturity",
  "success-stories": "Success stories",
  "legacy-families": "Legacy families"
};

function buildTimeline(corridor: DiasporaCorridorDefinition): DiasporaCorridorTimelineEntry[] {
  const base = new Date("2025-06-01T00:00:00.000Z").getTime();
  const steps = [
    { label: "Corridor architecture prepared", note: "Human-first pathway reserved." },
    { label: "Community maturity mapped", note: corridor.communityMaturity },
    { label: "Success stories preserved", note: "Private by default — consent required." }
  ];
  if (corridor.legacyFamiliesCount > 0) {
    steps.push({ label: "Legacy families honored", note: "No sensitive data." });
  }
  return steps.map((step, index) => ({
    id: `dc_timeline_${corridor.id}_${index}`,
    corridorId: corridor.id,
    label: step.label,
    recordedAt: new Date(base + index * 60 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildDiasporaCorridorViewModel(
  corridor: DiasporaCorridorDefinition
): DiasporaCorridorViewModel {
  const originLabel = CORRIDOR_ORIGIN_LABELS[corridor.originId];
  const destinationLabel = CORRIDOR_DESTINATION_LABELS[corridor.destinationId];

  const values: Partial<Record<DiasporaCorridorDisplayId, string>> = {
    origin: originLabel,
    destination: destinationLabel,
    "community-maturity": corridor.communityMaturity,
    "success-stories": `${corridor.successStoriesCount} preserved with consent`,
    "legacy-families": `${corridor.legacyFamiliesCount} legacy families honored`
  };

  const displayRows: DiasporaCorridorDisplayRow[] = (
    Object.keys(DISPLAY_FIELD_LABELS) as DiasporaCorridorDisplayId[]
  ).map((id) => ({
    id,
    label: DISPLAY_FIELD_LABELS[id],
    value: values[id],
    reached: Boolean(values[id])
  }));

  return {
    id: corridor.id,
    routeLabel: corridorRouteLabel(corridor.originId, corridor.destinationId),
    originLabel,
    destinationLabel,
    status: corridor.status,
    statusLabel: corridorStatusLabel(corridor.status),
    communityMaturity: corridor.communityMaturity,
    successStoriesCount: corridor.successStoriesCount,
    legacyFamiliesCount: corridor.legacyFamiliesCount,
    displayRows,
    timeline: buildTimeline(corridor)
  };
}

export function sortCorridorsForDisplay(
  corridors: DiasporaCorridorViewModel[]
): DiasporaCorridorViewModel[] {
  return [...corridors].sort((a, b) => a.routeLabel.localeCompare(b.routeLabel));
}
