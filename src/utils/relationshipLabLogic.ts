import type {
  LabTimelineEntry,
  PreparedResearchLabDefinition,
  PreparedResearchLabId
} from "../constants/relationshipLab";
import { LAB_CATEGORIES, PREPARED_RESEARCH_LABS, getLabCategory } from "../constants/relationshipLab";

export type ResearchLabViewModel = {
  id: PreparedResearchLabId;
  title: string;
  description: string;
  categoryLabel: string;
  statusLabel: string;
  timeline: LabTimelineEntry[];
};

function buildLabTimeline(lab: PreparedResearchLabDefinition): LabTimelineEntry[] {
  const base = new Date("2026-05-01T00:00:00.000Z").getTime();
  const steps = [
    { label: "Lab architecture prepared", note: "Specialized division — not enabled yet." },
    { label: "Research framing defined", note: lab.description },
    { label: "Insights pathway reserved", note: "Never testing or experiments on members." }
  ];
  return steps.map((step, index) => ({
    id: `rl_timeline_${lab.id}_${index}`,
    labId: lab.id,
    label: step.label,
    recordedAt: new Date(base + index * 40 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildResearchLabViewModel(lab: PreparedResearchLabDefinition): ResearchLabViewModel {
  const category = getLabCategory(lab.categoryId);
  return {
    id: lab.id,
    title: lab.title,
    description: lab.description,
    categoryLabel: category?.label ?? lab.categoryId,
    statusLabel: "Architecture prepared — not enabled yet",
    timeline: buildLabTimeline(lab)
  };
}

export function sortResearchLabs(labs: ResearchLabViewModel[]): ResearchLabViewModel[] {
  return [...labs].sort((a, b) => a.title.localeCompare(b.title));
}

export function listArchitectureResearchLabs(): ResearchLabViewModel[] {
  return sortResearchLabs(PREPARED_RESEARCH_LABS.map(buildResearchLabViewModel));
}

export function listLabCategories() {
  return LAB_CATEGORIES;
}
