import { STORAGE_KEYS } from "../constants/limits";
import type { JourneyStoryCategoryId } from "../constants/journeyStoryCategories";
import type { JourneyStoryProfile } from "../types/JourneyStoryType";
import {
  addStoryCategory,
  assertStoryCategoriesIntegrity,
  createEmptyJourneyStoryProfile,
  mergeStoryProfiles,
  normalizeStoryCategories
} from "./journeyStoryCategoryLogic";
import { readJson, writeJson } from "./storage";

type JourneyStoryProfileStore = {
  byJourneyId: Record<string, JourneyStoryProfile>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeJourneyStoryProfile;

function loadStore(): JourneyStoryProfileStore {
  return readJson<JourneyStoryProfileStore>(STORE_KEY, {
    byJourneyId: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: JourneyStoryProfileStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function persistProfile(profile: JourneyStoryProfile): JourneyStoryProfile {
  const store = loadStore();
  const previous = store.byJourneyId[profile.journeyId];
  if (previous) {
    assertStoryCategoriesIntegrity(previous, profile);
  }
  const normalized: JourneyStoryProfile = {
    ...profile,
    categories: normalizeStoryCategories(profile.categories)
  };
  saveStore({
    ...store,
    byJourneyId: { ...store.byJourneyId, [profile.journeyId]: normalized }
  });
  return normalized;
}

export function getJourneyStoryProfile(journeyId: string): JourneyStoryProfile | null {
  const profile = loadStore().byJourneyId[journeyId];
  if (!profile) return null;
  return { ...profile, categories: normalizeStoryCategories(profile.categories) };
}

export function ensureJourneyStoryProfile(journeyId: string): JourneyStoryProfile {
  const existing = getJourneyStoryProfile(journeyId);
  if (existing) return existing;
  return persistProfile(createEmptyJourneyStoryProfile(journeyId));
}

export function assignStoryCategory(
  journeyId: string,
  input: { categoryId: JourneyStoryCategoryId; assignedBy?: string; note?: string }
): JourneyStoryProfile {
  const profile = ensureJourneyStoryProfile(journeyId);
  return persistProfile(addStoryCategory(profile, input));
}

export function bootstrapJourneyStoryProfileSeeds(seeds: JourneyStoryProfile[]): void {
  const store = loadStore();
  if (Object.keys(store.byJourneyId).length) return;
  const byJourneyId = { ...store.byJourneyId };
  for (const seed of seeds) {
    byJourneyId[seed.journeyId] = {
      ...seed,
      categories: normalizeStoryCategories(seed.categories)
    };
  }
  saveStore({ ...store, byJourneyId });
}

export function listJourneyStoryProfiles(): JourneyStoryProfile[] {
  return Object.values(loadStore().byJourneyId).map((profile) => ({
    ...profile,
    categories: normalizeStoryCategories(profile.categories)
  }));
}

export function attachStoryProfileToConsent<T extends { journeyId: string; storyProfile?: JourneyStoryProfile }>(
  record: T
): T {
  const stored = getJourneyStoryProfile(record.journeyId);
  if (!stored) return record;
  return {
    ...record,
    storyProfile: mergeStoryProfiles(record.storyProfile, stored) ?? stored
  };
}

export { normalizeStoryCategories, createEmptyJourneyStoryProfile };
