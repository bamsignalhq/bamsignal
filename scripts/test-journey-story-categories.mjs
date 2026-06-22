/**
 * Journey story category architecture regression.
 */
import {
  addStoryCategory,
  assertStoryCategoriesIntegrity,
  createEmptyJourneyStoryProfile,
  mergeStoryProfiles,
  normalizeStoryCategories
} from "../server/services/journeyStoryCategories.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const journeyId = "BS-JR-2028-0045";
let profile = createEmptyJourneyStoryProfile(journeyId);
assert(profile.categories.length === 0, "starts with no categories");

profile = addStoryCategory(profile, {
  categoryId: "wedding-story",
  assignedBy: "Ada Okafor"
});
profile = addStoryCategory(profile, {
  categoryId: "diaspora-story",
  assignedBy: "Ada Okafor"
});
profile = addStoryCategory(profile, {
  categoryId: "family-story",
  assignedBy: "Ada Okafor"
});

assert(profile.categories.length === 3, "multiple categories allowed");
assert(
  normalizeStoryCategories(profile.categories).map((item) => item.id).join(",") ===
    "wedding-story,diaspora-story,family-story",
  "categories persist in order"
);

// Evolution — add anniversary later
const evolved = addStoryCategory(profile, {
  categoryId: "anniversary-story",
  assignedBy: "Ada Okafor"
});
assert(evolved.categories.length === 4, "stories evolve over time");

// Merge survives archive-style profile updates
const merged = mergeStoryProfiles(evolved, {
  journeyId,
  categories: [{ id: "relocation-story", assignedAt: "2032-01-01T00:00:00.000Z" }],
  updatedAt: "2032-01-01T00:00:00.000Z"
});
assert(merged.categories.length === 5, "merged profiles retain prior categories");

// Integrity — categories cannot be removed
let threw = false;
try {
  assertStoryCategoriesIntegrity(profile, {
    ...profile,
    categories: profile.categories.filter((item) => item.id !== "family-story")
  });
} catch {
  threw = true;
}
assert(threw, "story categories cannot shrink");

console.log("test-journey-story-categories: all checks passed");
