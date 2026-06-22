import {
  createEmptySuccessStoryRecord,
  SUCCESS_STORY_ENGINE_SEED
} from "../data/successStoryEngineSeed";
import type { SuccessStoryRecord } from "../constants/successStoryEngine";
import type { SuccessStorySectionId } from "../constants/successStoryEngine";
import type { SuccessStoryVisibilityLevel } from "../constants/conciergeSuccessStoryConsent";
import {
  normalizeSuccessStoryRecord,
  setSuccessStoryType,
  updateSuccessStorySection
} from "./successStoryEngineLogic";
import { readJson, writeJson } from "./storage";

const STORE_KEY = "bamsignal-concierge-success-story-engine-store";

type SuccessStoryEngineStore = {
  stories: SuccessStoryRecord[];
  updatedAt: string;
};

function loadStore(): SuccessStoryEngineStore {
  const stored = readJson<SuccessStoryEngineStore | null>(STORE_KEY, null);
  if (stored?.stories?.length) {
    return {
      ...stored,
      stories: stored.stories.map((story) => normalizeSuccessStoryRecord(story))
    };
  }
  const initial: SuccessStoryEngineStore = {
    stories: SUCCESS_STORY_ENGINE_SEED.map((story) => normalizeSuccessStoryRecord(story)),
    updatedAt: new Date().toISOString()
  };
  writeJson(STORE_KEY, initial);
  return initial;
}

function saveStore(store: SuccessStoryEngineStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

export function listSuccessStoryRecords(): SuccessStoryRecord[] {
  return loadStore().stories;
}

export function getSuccessStoryRecord(journeyId: string): SuccessStoryRecord {
  return (
    listSuccessStoryRecords().find((story) => story.journeyId === journeyId) ??
    createEmptySuccessStoryRecord(journeyId)
  );
}

export function saveSuccessStoryRecord(record: SuccessStoryRecord): SuccessStoryRecord {
  const store = loadStore();
  const normalized = normalizeSuccessStoryRecord(record);
  const index = store.stories.findIndex((story) => story.journeyId === normalized.journeyId);

  if (index >= 0) store.stories[index] = normalized;
  else store.stories.unshift(normalized);
  saveStore(store);
  return normalized;
}

export function updateSuccessStorySectionInStore(
  journeyId: string,
  sectionId: SuccessStorySectionId,
  body: string
): SuccessStoryRecord {
  const existing = getSuccessStoryRecord(journeyId);
  const updated = updateSuccessStorySection(existing, sectionId, body);
  return saveSuccessStoryRecord(updated);
}

export function setSuccessStoryTypeInStore(
  journeyId: string,
  storyType: SuccessStoryVisibilityLevel
): SuccessStoryRecord {
  const existing = getSuccessStoryRecord(journeyId);
  const updated = setSuccessStoryType(existing, storyType);
  return saveSuccessStoryRecord(updated);
}
