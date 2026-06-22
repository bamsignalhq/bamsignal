import type { JourneyStoryCategoryId } from "../constants/journeyStoryCategories";
import type { JourneyStoryProfile } from "../types/JourneyStoryType";

export function createEmptyJourneyStoryProfile(journeyId: string): JourneyStoryProfile {
  const now = new Date().toISOString();
  return {
    journeyId,
    categories: [],
    updatedAt: now,
    futureFormats: {
      enabled: false,
      formats: ["podcast-stories", "video-documentaries", "magazine-features", "anniversary-features"]
    }
  };
}

export function normalizeStoryCategories(
  categories: JourneyStoryProfile["categories"]
): JourneyStoryProfile["categories"] {
  const map = new Map<string, JourneyStoryProfile["categories"][number]>();
  for (const entry of categories ?? []) {
    if (!entry?.id) continue;
    const existing = map.get(entry.id);
    if (!existing || entry.assignedAt > existing.assignedAt) {
      map.set(entry.id, entry);
    }
  }
  return [...map.values()].sort((a, b) => a.assignedAt.localeCompare(b.assignedAt));
}

export function assertStoryCategoriesIntegrity(
  previous: JourneyStoryProfile,
  next: JourneyStoryProfile
): void {
  if (!previous.categories.length) return;
  const prevIds = new Set(previous.categories.map((item) => item.id));
  const nextIds = new Set(next.categories.map((item) => item.id));
  for (const id of prevIds) {
    if (!nextIds.has(id)) {
      throw new Error(`Story category removed: ${id}`);
    }
  }
}

export function addStoryCategory(
  profile: JourneyStoryProfile,
  input: { categoryId: JourneyStoryCategoryId; assignedBy?: string; note?: string }
): JourneyStoryProfile {
  const now = new Date().toISOString();
  const categories = normalizeStoryCategories(profile.categories);
  const exists = categories.some((item) => item.id === input.categoryId);
  if (exists) {
    return {
      ...profile,
      categories: normalizeStoryCategories(
        categories.map((item) =>
          item.id === input.categoryId
            ? { ...item, note: input.note ?? item.note, assignedBy: input.assignedBy ?? item.assignedBy }
            : item
        )
      ),
      updatedAt: now
    };
  }
  return {
    ...profile,
    categories: normalizeStoryCategories([
      ...categories,
      {
        id: input.categoryId,
        assignedAt: now,
        assignedBy: input.assignedBy,
        note: input.note
      }
    ]),
    updatedAt: now
  };
}

export function mergeStoryProfiles(
  existing?: JourneyStoryProfile | null,
  incoming?: JourneyStoryProfile | null
): JourneyStoryProfile | null {
  if (!existing) return incoming ?? null;
  if (!incoming) return existing;
  return {
    ...existing,
    ...incoming,
    categories: normalizeStoryCategories([...existing.categories, ...incoming.categories]),
    updatedAt: incoming.updatedAt || existing.updatedAt
  };
}
