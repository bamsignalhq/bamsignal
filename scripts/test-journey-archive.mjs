/**
 * Signal Concierge relationship archive regression.
 */
import {
  assertNoArchiveDeletion,
  createEmptyJourneyArchiveRegistry,
  filterArchiveMembers,
  getArchiveSnapshotForMember,
  listArchiveSnapshots,
  marriageYearFromDate,
  registerJourneyArchiveSnapshot
} from "../server/services/journeyArchive.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const memberBase = {
  privateNotes: [{ id: "n1", body: "note" }],
  introductions: [{ id: "i1", introducedWithName: "Partner" }],
  communicationJournal: [{ id: "c1", summary: "call" }],
  timeline: [{ id: "t1", type: "application-received", label: "Application received", at: "2028-01-01" }],
  stewardshipHistory: [],
  followUpTasks: [],
  consultantSummary: { lines: ["Summary line"], updatedAt: "2028-01-01" }
};

// Archive integrity — no accidental deletion
let threw = false;
try {
  assertNoArchiveDeletion(memberBase, {
    ...memberBase,
    privateNotes: [],
    introductions: memberBase.introductions,
    communicationJournal: memberBase.communicationJournal,
    timeline: memberBase.timeline,
    stewardshipHistory: memberBase.stewardshipHistory,
    followUpTasks: memberBase.followUpTasks,
    consultantSummary: memberBase.consultantSummary
  });
} catch {
  threw = true;
}
assert(threw, "shrinking privateNotes must throw");

threw = false;
try {
  assertNoArchiveDeletion(memberBase, {
    ...memberBase,
    consultantSummary: undefined
  });
} catch {
  threw = true;
}
assert(threw, "removing consultantSummary must throw");

assertNoArchiveDeletion(memberBase, {
  ...memberBase,
  privateNotes: [...memberBase.privateNotes, { id: "n2", body: "added" }]
});

// Timeline persistence — registry snapshots survive
let registry = createEmptyJourneyArchiveRegistry();
const snapshot = {
  memberId: "sc_member_adaeze",
  journeyId: "BS-JR-2028-0045",
  relationshipStatus: "legacy-archive",
  relationshipFormedAt: "2028-06-01T00:00:00.000Z",
  marriedAt: "2030-04-18T00:00:00.000Z",
  archivedAt: "2031-06-15T00:00:00.000Z",
  isLegacyArchive: true,
  preservedAt: "2031-06-15T00:00:00.000Z"
};
registry = registerJourneyArchiveSnapshot(registry, snapshot);
assert(getArchiveSnapshotForMember(registry, "sc_member_adaeze")?.journeyId === "BS-JR-2028-0045", "snapshot persists");
assert(listArchiveSnapshots(registry).length === 1, "list snapshots");

// Searchability
const searchPool = [
  {
    memberId: "sc_member_adaeze",
    journeyId: "BS-JR-2028-0045",
    name: "Adaeze M.",
    city: "Abuja",
    tier: "signature",
    consultant: "Ada Okafor",
    archive: snapshot
  }
];
const byJourney = filterArchiveMembers(searchPool, { query: "BS-JR-2028-0045" });
assert(byJourney.length === 1, "search by journey ID");

const byMarriageYear = filterArchiveMembers(searchPool, { marriageYear: "2030" });
assert(byMarriageYear.length === 1, "search by marriage year");
assert(marriageYearFromDate("2030-04-18T00:00:00.000Z") === 2030, "marriage year parse");

const byStatus = filterArchiveMembers(searchPool, { archiveStatus: "legacy-archive" });
assert(byStatus.length === 1, "search by archive status");

const byConsultant = filterArchiveMembers(searchPool, { consultant: "Ada" });
assert(byConsultant.length === 1, "search by consultant");

console.log("test-journey-archive: all checks passed");
