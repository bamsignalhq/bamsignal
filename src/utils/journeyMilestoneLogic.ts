import { JOURNEY_MILESTONE_ORDER } from "../constants/journeyMilestones";
import type { JourneyMilestoneId } from "../constants/journeyMilestones";
import type { JourneyMilestoneEntry, JourneyMilestoneTimeline } from "../types/journeyMilestone";

export function createEmptyMilestoneTimeline(journeyId: string): JourneyMilestoneTimeline {
  const now = new Date().toISOString();
  return {
    journeyId,
    milestones: [],
    updatedAt: now,
    futureCelebrations: {
      enabled: false,
      kinds: ["anniversary-gifts", "couple-events", "marriage-celebrations", "family-milestones"]
    }
  };
}

export function normalizeMilestones(
  milestones: JourneyMilestoneEntry[]
): JourneyMilestoneEntry[] {
  const map = new Map<JourneyMilestoneId, JourneyMilestoneEntry>();
  for (const entry of milestones ?? []) {
    if (!entry?.id) continue;
    const existing = map.get(entry.id);
    if (!existing || entry.recordedAt >= existing.recordedAt) {
      map.set(entry.id, entry);
    }
  }
  return [...map.values()].sort((a, b) => {
    const orderDiff = JOURNEY_MILESTONE_ORDER[a.id] - JOURNEY_MILESTONE_ORDER[b.id];
    if (orderDiff !== 0) return orderDiff;
    return a.milestoneAt.localeCompare(b.milestoneAt);
  });
}

export function assertMilestonesIntegrity(
  previous: JourneyMilestoneTimeline,
  next: JourneyMilestoneTimeline
): void {
  if (!previous.milestones.length) return;
  const prevIds = new Set(previous.milestones.map((item) => item.id));
  const nextIds = new Set(next.milestones.map((item) => item.id));
  for (const id of prevIds) {
    if (!nextIds.has(id)) {
      throw new Error(`Journey milestone removed: ${id}`);
    }
  }
}

export function addOrUpdateMilestone(
  timeline: JourneyMilestoneTimeline,
  input: {
    milestoneId: JourneyMilestoneId;
    milestoneAt: string;
    note?: string;
    recordedBy?: string;
  }
): JourneyMilestoneTimeline {
  const now = new Date().toISOString();
  const milestones = normalizeMilestones(timeline.milestones);
  const existing = milestones.find((item) => item.id === input.milestoneId);
  const entry: JourneyMilestoneEntry = {
    id: input.milestoneId,
    milestoneAt: input.milestoneAt,
    note: input.note ?? existing?.note,
    recordedAt: now,
    recordedBy: input.recordedBy ?? existing?.recordedBy
  };

  const nextMilestones = existing
    ? milestones.map((item) => (item.id === input.milestoneId ? entry : item))
    : [...milestones, entry];

  return {
    ...timeline,
    milestones: normalizeMilestones(nextMilestones),
    updatedAt: now
  };
}

export function listMilestoneYears(timeline: JourneyMilestoneTimeline): string[] {
  return normalizeMilestones(timeline.milestones).map((item) => {
    const parsed = Date.parse(item.milestoneAt);
    if (Number.isNaN(parsed)) return "";
    return String(new Date(parsed).getUTCFullYear());
  });
}
