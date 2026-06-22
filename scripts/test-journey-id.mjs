/**
 * Signal Concierge Journey ID regression — uniqueness, persistence, searchability.
 */
import {
  assignJourneyId,
  createEmptyJourneyRegistry,
  getJourneyIdForMember,
  getMemberIdForJourney,
  registerExistingJourneyId
} from "../server/services/journeyRegistry.js";
import {
  formatJourneyId,
  isValidJourneyId,
  normalizeJourneyId,
  parseJourneyId
} from "../server/services/journeyId.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Format
assert(formatJourneyId(2026, 1) === "BS-JR-2026-0001", "formatJourneyId pads sequence");
assert(formatJourneyId(2027, 42) === "BS-JR-2027-0042", "formatJourneyId handles larger sequence");
assert(isValidJourneyId("BS-JR-2026-0045"), "valid journey ID accepted");
assert(!isValidJourneyId("BS-JR-26-45"), "invalid journey ID rejected");
assert(parseJourneyId("BS-JR-2026-0045")?.sequence === 45, "parseJourneyId extracts sequence");
assert(normalizeJourneyId(" bs-jr-2026-0001 ") === "BS-JR-2026-0001", "normalizeJourneyId uppercases");

// Uniqueness — no duplicates
let registry = createEmptyJourneyRegistry();
const first = assignJourneyId(registry, { memberId: "member_a", createdAt: "2026-01-15T00:00:00.000Z" });
registry = first.state;
assert(first.created && first.journeyId === "BS-JR-2026-0001", "first assignment uses year from createdAt");

const second = assignJourneyId(registry, { memberId: "member_b", createdAt: "2026-02-01T00:00:00.000Z" });
registry = second.state;
assert(second.journeyId === "BS-JR-2026-0002", "second assignment increments sequence");

const repeat = assignJourneyId(registry, { memberId: "member_a", createdAt: "2026-03-01T00:00:00.000Z" });
registry = repeat.state;
assert(!repeat.created && repeat.journeyId === "BS-JR-2026-0001", "member keeps original journey ID");

let threw = false;
try {
  registerExistingJourneyId(registry, {
    journeyId: "BS-JR-2026-0001",
    memberId: "member_c",
    assignedAt: "2026-03-01T00:00:00.000Z"
  });
} catch {
  threw = true;
}
assert(threw, "cannot reuse journey ID for another member");

// Persistence — registry indexes survive mutations
registry = registerExistingJourneyId(registry, {
  journeyId: "BS-JR-2027-0001",
  memberId: "member_d",
  assignedAt: "2027-01-02T00:00:00.000Z"
});
assert(getJourneyIdForMember(registry, "member_d") === "BS-JR-2027-0001", "member index lookup");
assert(getMemberIdForJourney(registry, "BS-JR-2027-0001") === "member_d", "journey index lookup");

// Searchability — normalized lookup
assert(
  getMemberIdForJourney(registry, " bs-jr-2027-0001 ") === "member_d",
  "journey lookup normalizes input"
);

const ids = new Set(Object.keys(registry.entries));
assert(ids.size === Object.keys(registry.memberIndex).length, "no duplicate registry entries");

console.log("test-journey-id: all checks passed");
