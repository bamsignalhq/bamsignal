import { STORAGE_KEYS } from "../constants/limits";
import type { JourneyMilestoneId } from "../constants/journeyMilestones";
import type { JourneyMilestoneTimeline } from "../types/journeyMilestone";
import {
  addOrUpdateMilestone,
  assertMilestonesIntegrity,
  createEmptyMilestoneTimeline,
  normalizeMilestones
} from "./journeyMilestoneLogic";
import { readJson, writeJson } from "./storage";

type JourneyMilestoneStore = {
  byJourneyId: Record<string, JourneyMilestoneTimeline>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeJourneyMilestoneTimeline;

function loadStore(): JourneyMilestoneStore {
  return readJson<JourneyMilestoneStore>(STORE_KEY, {
    byJourneyId: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: JourneyMilestoneStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function persistTimeline(timeline: JourneyMilestoneTimeline): JourneyMilestoneTimeline {
  const store = loadStore();
  const previous = store.byJourneyId[timeline.journeyId];
  if (previous) {
    assertMilestonesIntegrity(previous, timeline);
  }
  const normalized: JourneyMilestoneTimeline = {
    ...timeline,
    milestones: normalizeMilestones(timeline.milestones)
  };
  saveStore({
    ...store,
    byJourneyId: { ...store.byJourneyId, [timeline.journeyId]: normalized }
  });
  return normalized;
}

export function getJourneyMilestoneTimeline(journeyId: string): JourneyMilestoneTimeline | null {
  const timeline = loadStore().byJourneyId[journeyId];
  if (!timeline) return null;
  return { ...timeline, milestones: normalizeMilestones(timeline.milestones) };
}

export function ensureJourneyMilestoneTimeline(journeyId: string): JourneyMilestoneTimeline {
  const existing = getJourneyMilestoneTimeline(journeyId);
  if (existing) return existing;
  return persistTimeline(createEmptyMilestoneTimeline(journeyId));
}

export function recordJourneyMilestone(
  journeyId: string,
  input: {
    milestoneId: JourneyMilestoneId;
    milestoneAt: string;
    note?: string;
    recordedBy?: string;
  }
): JourneyMilestoneTimeline {
  const timeline = ensureJourneyMilestoneTimeline(journeyId);
  return persistTimeline(addOrUpdateMilestone(timeline, input));
}

export function bootstrapJourneyMilestoneSeeds(seeds: JourneyMilestoneTimeline[]): void {
  const store = loadStore();
  if (Object.keys(store.byJourneyId).length) return;
  const byJourneyId = { ...store.byJourneyId };
  for (const seed of seeds) {
    byJourneyId[seed.journeyId] = {
      ...seed,
      milestones: normalizeMilestones(seed.milestones)
    };
  }
  saveStore({ ...store, byJourneyId });
}

export function listJourneyMilestoneTimelines(): JourneyMilestoneTimeline[] {
  return Object.values(loadStore().byJourneyId).map((timeline) => ({
    ...timeline,
    milestones: normalizeMilestones(timeline.milestones)
  }));
}
