/**
 * Relationship Legacy Index™ regression — permanent archive identity.
 */
import {
  assertLegacyIndexIntegrity,
  createEmptyLegacyIndexRecord,
  deriveLegacyTimelinePhases,
  evolveLegacyStatus,
  filterAnniversaryMilestones,
  filterLegacyIndexEntries,
  registerLegacyIndexEntry
} from "../server/services/relationshipLegacyIndex.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const journeyId = "BS-JR-2028-0045";
const memberId = "sc_member_adaeze";

let state = { byJourneyId: {}, updatedAt: new Date().toISOString() };
const record = createEmptyLegacyIndexRecord({
  journeyId,
  memberId,
  country: "Nigeria",
  legacyStatus: "active-legacy",
  registeredBy: "Ada Okafor"
});
record.registeredAt = "2031-06-15T00:00:00.000Z";
record.updatedAt = "2031-06-15T00:00:00.000Z";

state = registerLegacyIndexEntry(state, record);
assert(state.byJourneyId[journeyId]?.journeyId === journeyId, "index registers once");

// Never regenerate — second register returns existing
const second = registerLegacyIndexEntry(state, {
  ...record,
  legacyStatus: "golden-legacy"
});
assert(second.byJourneyId[journeyId].legacyStatus === "active-legacy", "never overwrite on re-register");

// Status evolution appends history
const evolved = evolveLegacyStatus(record, {
  legacyStatus: "anniversary-legacy",
  by: "Ada Okafor"
});
assert(evolved.legacyStatus === "anniversary-legacy", "status can evolve");
assert(evolved.statusHistory.length === 2, "status history grows");

// Integrity — registeredAt and journeyId immutable
let threw = false;
try {
  assertLegacyIndexIntegrity(record, {
    ...record,
    journeyId: "BS-JR-2099-9999",
    registeredAt: record.registeredAt
  });
} catch {
  threw = true;
}
assert(threw, "journeyId cannot change");

threw = false;
try {
  assertLegacyIndexIntegrity(record, {
    ...record,
    registeredAt: "2099-01-01T00:00:00.000Z"
  });
} catch {
  threw = true;
}
assert(threw, "registeredAt cannot be overwritten");

threw = false;
try {
  assertLegacyIndexIntegrity(evolved, {
    ...evolved,
    statusHistory: evolved.statusHistory.slice(0, 1)
  });
} catch {
  threw = true;
}
assert(threw, "status history cannot shrink");

// Legacy timeline phases
const milestones = [
  { id: "met", milestoneAt: "2028-05-20T00:00:00.000Z" },
  { id: "relationship-formed", milestoneAt: "2028-06-01T00:00:00.000Z" },
  { id: "engaged", milestoneAt: "2029-11-01T00:00:00.000Z" },
  { id: "married", milestoneAt: "2030-04-18T00:00:00.000Z" },
  { id: "first-anniversary", milestoneAt: "2031-04-18T00:00:00.000Z" },
  { id: "five-years-together", milestoneAt: "2035-04-18T00:00:00.000Z" },
  { id: "ten-years-together", milestoneAt: "2040-04-18T00:00:00.000Z" }
];
const phases = deriveLegacyTimelinePhases({
  milestones,
  hasFamilyStory: true,
  isLegacyArchive: true
});
assert(phases.filter((item) => item.reached).length === 7, "all legacy phases reached for seed journey");

const anniversaries = filterAnniversaryMilestones(milestones);
assert(anniversaries.length === 3, "legacy profile shows anniversary milestones only");

// Search filters
const searchable = [
  {
    journeyId,
    memberName: "Adaeze M.",
    city: "Abuja",
    country: "Nigeria",
    consultant: "Ada Okafor",
    legacyStatus: "active-legacy",
    marriageYear: 2030,
    storyCategories: ["wedding-story", "diaspora-story", "family-story"]
  }
];
const byJourney = filterLegacyIndexEntries(searchable, { query: "BS-JR-2028-0045" });
assert(byJourney.length === 1, "search by journey ID");

const byCategory = filterLegacyIndexEntries(searchable, { storyCategory: "diaspora-story" });
assert(byCategory.length === 1, "search by story category");

const byStatus = filterLegacyIndexEntries(searchable, { legacyStatus: "active-legacy" });
assert(byStatus.length === 1, "search by legacy status");

const byCountry = filterLegacyIndexEntries(searchable, { country: "Nigeria" });
assert(byCountry.length === 1, "search by country");

assert(record.futureLegacy?.kinds?.includes("silver-anniversaries"), "future legacy kinds reserved");

console.log("test-relationship-legacy-index: all checks passed");
