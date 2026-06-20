/**
 * Smoke tests for relationship / profile intent limits.
 */
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const {
  MAX_INTENT_SELECTIONS,
  MAX_RELATIONSHIP_INTENTION_SELECTIONS,
  normalizeProfileIntents,
  normalizeRelationshipIntentions,
  profileIntentsExceedLimit
} = await import("../shared/memberIntents.mjs");

assert(MAX_INTENT_SELECTIONS === 3, "profile intent max is 3");
assert(MAX_RELATIONSHIP_INTENTION_SELECTIONS === 3, "relationship intention max is 3");

assert(
  normalizeProfileIntents(["Relationship", "Friendship", "Chat", "Networking"]).length === 3,
  "profile intents truncate to 3"
);
assert(
  normalizeProfileIntents(["Relationship", "Friendship"]).join(",") === "Relationship,Friendship",
  "profile intents keep valid selections"
);
assert(profileIntentsExceedLimit(["Relationship", "Friendship", "Chat", "Networking"]), "detect >3 intents");

assert(
  normalizeRelationshipIntentions(["Friendship", "Dating", "Marriage", "Networking"]).length === 3,
  "relationship intentions truncate to 3"
);
assert(
  normalizeRelationshipIntentions(["Serious relationship", "Invalid"]).join(",") === "Serious relationship",
  "relationship intentions drop invalid values"
);

console.log("member intents tests ok");
