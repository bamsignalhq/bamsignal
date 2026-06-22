import {
  ANNIVERSARY_CELEBRATION_ARCHITECTURE_SEED,
  type AnniversaryCelebrationTimelineEntry
} from "../constants/anniversaryCelebrationExperience";

export function getAnniversaryCelebrationArchitectureTimeline(): AnniversaryCelebrationTimelineEntry[] {
  return [...ANNIVERSARY_CELEBRATION_ARCHITECTURE_SEED].sort(
    (a, b) => new Date(a.milestoneAt).getTime() - new Date(b.milestoneAt).getTime()
  );
}

export function latestAnniversaryCelebrationMemory(
  entries: AnniversaryCelebrationTimelineEntry[]
): AnniversaryCelebrationTimelineEntry | null {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.milestoneAt).getTime() - new Date(a.milestoneAt).getTime()
  );
  return sorted[0] ?? null;
}
