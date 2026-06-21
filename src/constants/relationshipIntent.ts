import type { IntentTag, RelationshipIntentId } from "../types";

export type RelationshipIntentOption = {
  id: RelationshipIntentId;
  label: string;
  emoji: string;
};

export const WHAT_BRINGS_YOU_HERE_OPTIONS: RelationshipIntentOption[] = [
  { id: "SeriousRelationship", label: "Serious relationship", emoji: "❤️" },
  { id: "Marriage", label: "Marriage", emoji: "💍" },
  { id: "Friendship", label: "Friendship", emoji: "🤝" },
  { id: "Companionship", label: "Companionship", emoji: "🌍" },
  { id: "OpenToPossibilities", label: "Open to possibilities", emoji: "✨" },
  { id: "MeaningfulConversations", label: "Meaningful conversations", emoji: "☕" }
];

/** Discover search filters — excludes meaningful conversations per product spec. */
export const RELATIONSHIP_INTENT_FILTER_OPTIONS: RelationshipIntentOption[] =
  WHAT_BRINGS_YOU_HERE_OPTIONS.filter((option) => option.id !== "MeaningfulConversations");

export const MAX_RELATIONSHIP_INTENT_SELECTIONS = 2;
export const MIN_RELATIONSHIP_INTENT_SELECTIONS = 1;

export const RELATIONSHIP_INTENT_LIMIT_MESSAGE = "You can select up to 2 choices.";

export const WHAT_BRINGS_YOU_HERE_HEADLINE = "What brings you here?";
export const WHAT_BRINGS_YOU_HERE_SUBTEXT =
  "Different people are looking for different things. Choose what best describes you.";
export const WHAT_BRINGS_ME_HERE_TITLE = "What Brings Me Here";

export function isRelationshipIntent(intent: IntentTag): intent is RelationshipIntentId {
  return intent !== "Quickie";
}

export function relationshipIntentsFrom(intents: IntentTag[] | undefined): RelationshipIntentId[] {
  return (intents ?? []).filter(isRelationshipIntent);
}

export function relationshipIntentOption(id: RelationshipIntentId): RelationshipIntentOption | undefined {
  return WHAT_BRINGS_YOU_HERE_OPTIONS.find((option) => option.id === id);
}

export function relationshipIntentLabel(id: RelationshipIntentId): string {
  return relationshipIntentOption(id)?.label ?? id;
}

export function relationshipIntentDisplay(id: RelationshipIntentId): string {
  const option = relationshipIntentOption(id);
  return option ? `${option.emoji} ${option.label}` : id;
}

/** Profile read view — emoji + label for hero and chips */
export function profileRelationshipIntentLabel(id: IntentTag): string {
  if (!isRelationshipIntent(id)) return id;
  return relationshipIntentDisplay(id);
}
