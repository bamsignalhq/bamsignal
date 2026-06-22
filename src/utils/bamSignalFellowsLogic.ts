import type {
  ExpertTimelineEntry,
  PreparedFellowDefinition,
  PreparedFellowId
} from "../constants/bamSignalFellows";
import { PREPARED_FELLOW_SPECIALTIES, PREPARED_FELLOWS } from "../constants/bamSignalFellows";

export type FellowViewModel = {
  id: PreparedFellowId;
  name: string;
  title: string;
  focus: string;
  specialtyTitle: string;
  statusLabel: string;
  timeline: ExpertTimelineEntry[];
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

function buildExpertTimeline(fellow: PreparedFellowDefinition): ExpertTimelineEntry[] {
  const base = new Date("2026-06-01T00:00:00.000Z").getTime();
  const steps = [
    { label: "Fellow architecture prepared", note: "Expert network — not enabled yet." },
    { label: "Specialty defined", note: fellow.focus },
    { label: "Expert timeline reserved", note: "No profiles or booking yet." }
  ];
  return steps.map((step, index) => ({
    id: `bsf_timeline_${fellow.id}_${index}`,
    fellowId: fellow.id,
    label: step.label,
    recordedAt: new Date(base + index * 30 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildFellowViewModel(fellow: PreparedFellowDefinition): FellowViewModel {
  const specialty = PREPARED_FELLOW_SPECIALTIES.find((item) => item.id === fellow.specialtyId);
  return {
    id: fellow.id,
    name: fellow.name,
    title: fellow.title,
    focus: fellow.focus,
    specialtyTitle: specialty?.title ?? fellow.specialtyId,
    statusLabel: ARCHITECTURE_STATUS,
    timeline: buildExpertTimeline(fellow)
  };
}

export function listArchitectureFellows(): FellowViewModel[] {
  return [...PREPARED_FELLOWS.map(buildFellowViewModel)].sort((a, b) =>
    a.specialtyTitle.localeCompare(b.specialtyTitle)
  );
}
