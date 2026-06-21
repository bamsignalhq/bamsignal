import {
  MAX_RELATIONSHIP_INTENT_SELECTIONS,
  MIN_RELATIONSHIP_INTENT_SELECTIONS,
  RELATIONSHIP_INTENT_LIMIT_MESSAGE,
  isRelationshipIntent,
  relationshipIntentsFrom
} from "../constants/relationshipIntent";
import type { IntentTag, RelationshipIntentId } from "../types";

/** Reserved for future matching products — not implemented. */
export type RelationshipIntentFutureTier =
  | "priority-matching"
  | "compatibility-ranking"
  | "circle-matchmaking"
  | "concierge-matching";

export type RelationshipIntentFutureConfig = {
  tier?: RelationshipIntentFutureTier;
  priorityWeight?: number;
  circleId?: string;
};

const LEGACY_INTENT_MAP: Record<string, RelationshipIntentId | "Quickie"> = {
  Relationship: "SeriousRelationship",
  Dating: "SeriousRelationship",
  Serious: "SeriousRelationship",
  "Serious Relationship": "SeriousRelationship",
  SeriousRelationship: "SeriousRelationship",
  Marriage: "Marriage",
  Friendship: "Friendship",
  Networking: "Companionship",
  Companionship: "Companionship",
  "Social Events": "OpenToPossibilities",
  OpenToPossibilities: "OpenToPossibilities",
  Chat: "MeaningfulConversations",
  MeaningfulConversations: "MeaningfulConversations",
  Quickie: "Quickie"
};

export function normalizeRelationshipIntent(raw: string): IntentTag | null {
  return LEGACY_INTENT_MAP[raw] ?? null;
}

export function normalizeRelationshipIntents(raw: string[] | undefined): IntentTag[] {
  if (!raw?.length) return ["SeriousRelationship"];

  const out: IntentTag[] = [];
  for (const item of raw) {
    const mapped = normalizeRelationshipIntent(item);
    if (!mapped || out.includes(mapped)) continue;
    out.push(mapped);
  }

  const relationship = relationshipIntentsFrom(out).slice(0, MAX_RELATIONSHIP_INTENT_SELECTIONS);
  const quickie = out.includes("Quickie") ? (["Quickie"] as const) : [];
  const merged = [...relationship, ...quickie];

  return merged.length ? merged : ["SeriousRelationship"];
}

export function hasMinimumRelationshipIntents(intents: IntentTag[] | undefined): boolean {
  return relationshipIntentsFrom(intents).length >= MIN_RELATIONSHIP_INTENT_SELECTIONS;
}

export function mergeRelationshipIntentSelection(
  current: IntentTag[],
  nextRelationship: RelationshipIntentId[]
): IntentTag[] {
  const quickie = current.includes("Quickie") ? (["Quickie"] as const) : [];
  return [...nextRelationship.slice(0, MAX_RELATIONSHIP_INTENT_SELECTIONS), ...quickie];
}

export function toggleRelationshipIntentSelection(
  current: IntentTag[],
  intent: RelationshipIntentId
): { next: IntentTag[]; blocked: boolean; blockedReason?: string } {
  const relationship = relationshipIntentsFrom(current);

  if (relationship.includes(intent)) {
    const nextRelationship = relationship.filter((item) => item !== intent);
    return { next: mergeRelationshipIntentSelection(current, nextRelationship), blocked: false };
  }

  if (relationship.length >= MAX_RELATIONSHIP_INTENT_SELECTIONS) {
    return {
      next: current,
      blocked: true,
      blockedReason: RELATIONSHIP_INTENT_LIMIT_MESSAGE
    };
  }

  return {
    next: mergeRelationshipIntentSelection(current, [...relationship, intent]),
    blocked: false
  };
}

export function toggleIntentSelection(
  current: IntentTag[],
  intent: IntentTag
): { next: IntentTag[]; blocked: boolean; blockedReason?: string } {
  if (intent === "Quickie") {
    if (current.includes("Quickie")) {
      return { next: current.filter((item) => item !== "Quickie"), blocked: false };
    }
    return { next: [...current, "Quickie"], blocked: false };
  }

  if (!isRelationshipIntent(intent)) {
    return { next: current, blocked: true, blockedReason: RELATIONSHIP_INTENT_LIMIT_MESSAGE };
  }

  return toggleRelationshipIntentSelection(current, intent);
}
