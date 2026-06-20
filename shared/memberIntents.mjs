export const MAX_INTENT_SELECTIONS = 3;
export const MAX_RELATIONSHIP_INTENTION_SELECTIONS = 3;

export const VALID_PROFILE_INTENTS = new Set([
  "Relationship",
  "Friendship",
  "Networking",
  "Social Events",
  "Chat",
  "Quickie"
]);

export const VALID_RELATIONSHIP_INTENTIONS = new Set([
  "Friendship",
  "Dating",
  "Serious relationship",
  "Marriage",
  "Networking",
  "Open to anything"
]);

/** Server-side profile intent cap — truncate unknown/excess values safely. */
export function normalizeProfileIntents(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const out = [];
  for (const item of list) {
    const tag = String(item || "").trim();
    if (!VALID_PROFILE_INTENTS.has(tag) || out.includes(tag)) continue;
    out.push(tag);
    if (out.length >= MAX_INTENT_SELECTIONS) break;
  }
  return out.length ? out : ["Relationship"];
}

/** Server-side relationship-intention filter cap. */
export function normalizeRelationshipIntentions(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const out = [];
  for (const item of list) {
    const value = String(item || "").trim();
    if (!VALID_RELATIONSHIP_INTENTIONS.has(value) || out.includes(value)) continue;
    out.push(value);
    if (out.length >= MAX_RELATIONSHIP_INTENTION_SELECTIONS) break;
  }
  return out;
}

export function profileIntentsExceedLimit(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const unique = [];
  for (const item of list) {
    const tag = String(item || "").trim();
    if (!VALID_PROFILE_INTENTS.has(tag) || unique.includes(tag)) continue;
    unique.push(tag);
  }
  return unique.length > MAX_INTENT_SELECTIONS;
}
