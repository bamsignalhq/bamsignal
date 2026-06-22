import type {
  CorridorStoryEntry,
  CorridorStoryTimelineEntry,
  PreparedCorridorStoryId
} from "../constants/corridorStories";
import { CORRIDOR_STORIES_ARCHITECTURE_SEED } from "../constants/corridorStories";

export function sortCorridorStories(entries: CorridorStoryEntry[]): CorridorStoryEntry[] {
  return [...entries].sort((a, b) => a.title.localeCompare(b.title));
}

export function buildCorridorStoryTimeline(
  storyId: PreparedCorridorStoryId,
  recordedAt: string
): CorridorStoryTimelineEntry[] {
  const base = new Date(recordedAt).getTime();
  const steps = [
    { label: "Story preserved privately", note: "Consent-first — private by default." },
    { label: "Corridor pathway recorded", note: "Journey Across Borders." },
    { label: "Consent level available", note: "Anonymous, first names, or full story." }
  ];
  return steps.map((step, index) => ({
    id: `cs_timeline_${storyId}_${index}`,
    storyId,
    label: step.label,
    recordedAt: new Date(base + index * 30 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function getVisibleStoryBody(story: CorridorStoryEntry): string | null {
  if (!story.consentGranted && story.consentLevel === "private") {
    return null;
  }
  return story.body;
}

export function listArchitectureCorridorStories(): CorridorStoryEntry[] {
  return sortCorridorStories(CORRIDOR_STORIES_ARCHITECTURE_SEED);
}
