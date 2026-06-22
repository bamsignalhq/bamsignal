import { DEFAULT_SUCCESS_STORY_CONSENT } from "../constants/conciergeSuccessStoryConsent";
import type { SuccessStoryVisibilityLevel } from "../constants/conciergeSuccessStoryConsent";
import {
  SUCCESS_STORY_SECTIONS,
  type SuccessStoryRecord,
  type SuccessStorySectionEntry,
  type SuccessStorySectionId
} from "../constants/successStoryEngine";

const PRIVATE_VISIBILITY = "private" as const;

export function createEmptySuccessStorySections(): SuccessStorySectionEntry[] {
  return SUCCESS_STORY_SECTIONS.map((section) => ({
    id: section.id
  }));
}

export function normalizeSuccessStoryRecord(record: SuccessStoryRecord): SuccessStoryRecord {
  const sectionMap = new Map(record.sections.map((section) => [section.id, section]));
  const sections = SUCCESS_STORY_SECTIONS.map((definition) => {
    const existing = sectionMap.get(definition.id);
    return existing ?? { id: definition.id };
  });

  return {
    ...record,
    visibility: PRIVATE_VISIBILITY,
    storyType: record.storyType ?? DEFAULT_SUCCESS_STORY_CONSENT.visibility,
    sections,
    futureReady: {
      books: false,
      magazine: false,
      documentary: false,
      podcast: false
    }
  };
}

export function assertSuccessStoryPrivacy(record: SuccessStoryRecord): void {
  if (record.visibility !== PRIVATE_VISIBILITY) {
    throw new Error("Success stories must remain private until consent allows publication");
  }
}

export function assertSuccessStoryIntegrity(
  previous: SuccessStoryRecord,
  next: SuccessStoryRecord
): void {
  if (next.journeyId !== previous.journeyId) {
    throw new Error("Success story journeyId cannot change");
  }
  const previousSectionIds = new Set(previous.sections.map((section) => section.id));
  for (const id of previousSectionIds) {
    if (!next.sections.some((section) => section.id === id)) {
      throw new Error("Success story sections are never removed");
    }
  }
  assertSuccessStoryPrivacy(next);
}

export function updateSuccessStorySection(
  record: SuccessStoryRecord,
  sectionId: SuccessStorySectionId,
  body: string
): SuccessStoryRecord {
  const trimmed = body.trim();
  const next: SuccessStoryRecord = {
    ...record,
    sections: record.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            body: trimmed || undefined,
            recordedAt: trimmed ? new Date().toISOString() : section.recordedAt
          }
        : section
    ),
    updatedAt: new Date().toISOString()
  };
  assertSuccessStoryIntegrity(record, next);
  return normalizeSuccessStoryRecord(next);
}

export function setSuccessStoryType(
  record: SuccessStoryRecord,
  storyType: SuccessStoryVisibilityLevel
): SuccessStoryRecord {
  const next: SuccessStoryRecord = {
    ...record,
    storyType,
    updatedAt: new Date().toISOString()
  };
  assertSuccessStoryIntegrity(record, next);
  return normalizeSuccessStoryRecord(next);
}

export function sortSuccessStorySections(
  sections: SuccessStorySectionEntry[]
): SuccessStorySectionEntry[] {
  const order = Object.fromEntries(
    SUCCESS_STORY_SECTIONS.map((section) => [section.id, section.order])
  ) as Record<SuccessStorySectionId, number>;
  return [...sections].sort((a, b) => order[a.id] - order[b.id]);
}
