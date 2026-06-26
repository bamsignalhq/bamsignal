import {
  MIN_RELATIONSHIP_INTENT_SELECTIONS,
  RELATIONSHIP_INTENT_FILTER_OPTIONS,
  WHAT_BRINGS_YOU_HERE_OPTIONS,
  isRelationshipIntent,
  profileRelationshipIntentLabel,
  relationshipIntentDisplay,
  relationshipIntentLabel,
  relationshipIntentsFrom
} from "./relationshipIntent";
import {
  hasMinimumRelationshipIntents,
  normalizeRelationshipIntents,
  toggleIntentSelection as toggleIntentSelectionCore
} from "../utils/relationshipIntent";
import type { IntentTag, RelationshipIntentId } from "../types";

/** @deprecated use WHAT_BRINGS_YOU_HERE_OPTIONS */
export const INTENT_OPTIONS = WHAT_BRINGS_YOU_HERE_OPTIONS;

export const INTENT_FILTER_OPTIONS = RELATIONSHIP_INTENT_FILTER_OPTIONS;

export const MAX_INTENT_SELECTIONS = 3;
export const MIN_INTENT_SELECTIONS = MIN_RELATIONSHIP_INTENT_SELECTIONS;
export const INTENT_LIMIT_MESSAGE = "You can select up to 3 intentions.";

export function intentLabel(id: IntentTag): string {
  if (!isRelationshipIntent(id)) return "Fast Connection";
  return relationshipIntentLabel(id);
}

export function intentDisplay(id: IntentTag): string {
  if (!isRelationshipIntent(id)) return "⚡ Fast Connection";
  return relationshipIntentDisplay(id);
}

export function profileIntentLabel(id: IntentTag): string {
  if (!isRelationshipIntent(id)) return "Fast Connection";
  return profileRelationshipIntentLabel(id);
}

export function normalizeIntent(raw: string): IntentTag | null {
  const normalized = normalizeRelationshipIntents([raw]);
  return normalized[0] ?? null;
}

export function normalizeIntents(raw: string[] | undefined): IntentTag[] {
  return normalizeRelationshipIntents(raw);
}

export function toggleIntentSelection(
  current: IntentTag[],
  intent: IntentTag
): { next: IntentTag[]; blocked: boolean; blockedReason?: string } {
  return toggleIntentSelectionCore(current, intent);
}

export { hasMinimumRelationshipIntents, relationshipIntentsFrom };
export type { RelationshipIntentId };
