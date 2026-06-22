import { SUCCESS_STORY_FUTURE_FORMATS } from "../constants/successStoryEngine";
import type { SuccessStoryRecord } from "../constants/successStoryEngine";
import type { SuccessStorySectionId } from "../constants/successStoryEngine";
import type { SuccessStoryVisibilityLevel } from "../constants/conciergeSuccessStoryConsent";
import { getSuccessStoryConsent } from "./conciergeSuccessStoryConsentStore";
import { canPublishSuccessStory } from "./successStoryConsentLogic";
import {
  getSuccessStoryRecord,
  listSuccessStoryRecords,
  setSuccessStoryTypeInStore,
  updateSuccessStorySectionInStore
} from "./successStoryEngineStore";
import { sortSuccessStorySections } from "./successStoryEngineLogic";

export function listSuccessStories(): SuccessStoryRecord[] {
  return listSuccessStoryRecords();
}

export function getSuccessStory(journeyId: string): SuccessStoryRecord {
  return getSuccessStoryRecord(journeyId);
}

export function getSuccessStoryWithConsent(journeyId: string) {
  const story = getSuccessStoryRecord(journeyId);
  const consent = getSuccessStoryConsent(journeyId);
  return {
    story,
    consent,
    publishable: consent ? canPublishSuccessStory(consent) : false
  };
}

export function updateSuccessStorySection(
  journeyId: string,
  sectionId: SuccessStorySectionId,
  body: string
): SuccessStoryRecord {
  return updateSuccessStorySectionInStore(journeyId, sectionId, body);
}

export function setSuccessStoryType(
  journeyId: string,
  storyType: SuccessStoryVisibilityLevel
): SuccessStoryRecord {
  return setSuccessStoryTypeInStore(journeyId, storyType);
}

export function getOrderedSuccessStorySections(journeyId: string) {
  return sortSuccessStorySections(getSuccessStoryRecord(journeyId).sections);
}

export function listSuccessStoryFutureFormats() {
  return SUCCESS_STORY_FUTURE_FORMATS;
}
