/**
 * Signal Concierge Relationship Follow-Up Engine regression tests.
 */
import {
  assertNoDuplicateFollowUp,
  assertRelationshipTimelineIntegrity,
  markLegacyArchiveReady,
  pauseRelationshipJourney,
  pushRelationshipTimeline,
  recordRelationshipMilestone,
  resumeRelationshipJourney
} from "../server/services/relationshipFollowUp.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const seed = [
  {
    id: "rfu_1",
    introductionId: "BS-IN-2026-0001",
    memberAId: "sc_member_amaka",
    memberBId: "sc_member_chidi",
    stage: "still-talking",
    pipelinePhase: "still-talking",
    paused: false,
    timeline: [{ id: "t1", at: "2026-01-01T00:00:00.000Z", label: "Introduction Made" }],
    milestones: [],
    journal: [],
    checkIns: [],
    celebrations: [],
    recoveryNotes: []
  }
];

// Timeline persistence
const previous = { ...seed[0], timeline: [...seed[0].timeline], milestones: [] };
const next = {
  ...seed[0],
  timeline: [
    { id: "t2", at: "2026-01-02T00:00:00.000Z", label: "Still Talking" },
    ...seed[0].timeline
  ],
  milestones: []
};
assertRelationshipTimelineIntegrity(previous, next);

let shrinkBlocked = false;
try {
  assertRelationshipTimelineIntegrity(next, previous);
} catch (error) {
  shrinkBlocked = error instanceof Error && error.message.includes("cannot shrink");
}
assert(shrinkBlocked, "timeline cannot shrink");

// Milestones preserved
const milestoneRecord = { ...seed[0], timeline: [...seed[0].timeline], milestones: [] };
recordRelationshipMilestone(milestoneRecord, {
  milestoneId: "first-date",
  milestoneAt: "2026-01-03T00:00:00.000Z",
  note: "First date"
});
assert(milestoneRecord.milestones.length === 1, "milestone recorded");

const duplicateMilestone = recordRelationshipMilestone(milestoneRecord, {
  milestoneId: "first-date",
  milestoneAt: "2026-01-04T00:00:00.000Z"
});
assert(duplicateMilestone.id === milestoneRecord.milestones[0].id, "milestones not duplicated");

let milestoneRemovalBlocked = false;
try {
  assertRelationshipTimelineIntegrity(milestoneRecord, { ...milestoneRecord, milestones: [] });
} catch (error) {
  milestoneRemovalBlocked = error instanceof Error && error.message.includes("cannot be removed");
}
assert(milestoneRemovalBlocked, "milestones cannot be removed");

// Pause and resume
const pauseRecord = { ...seed[0], timeline: [...seed[0].timeline], milestones: [] };
pauseRelationshipJourney(pauseRecord, "Needs more time");
assert(pauseRecord.paused === true, "journey paused");
assert(pauseRecord.stage === "paused", "stage set to paused");
assert(pauseRecord.timeline.length > seed[0].timeline.length, "pause appended to timeline");

const timelineLengthAfterPause = pauseRecord.timeline.length;
resumeRelationshipJourney(pauseRecord, "still-talking");
assert(pauseRecord.paused === false, "journey resumed");
assert(pauseRecord.stage === "still-talking", "stage restored");
assert(pauseRecord.timeline.length > timelineLengthAfterPause, "resume appended to timeline");

// Archive compatibility
const archiveRecord = { ...seed[0], timeline: [...seed[0].timeline], milestones: [], stage: "married" };
markLegacyArchiveReady(archiveRecord);
assert(archiveRecord.stage === "archived", "archive stage set");
assert(archiveRecord.pipelinePhase === "legacy-archive", "legacy pipeline phase");
assert(archiveRecord.legacyArchiveReady === true, "legacy archive ready flag");

// Duplicate follow-up prevention
let duplicateBlocked = false;
try {
  assertNoDuplicateFollowUp(seed, "BS-IN-2026-0001");
} catch (error) {
  duplicateBlocked = error instanceof Error && error.message.includes("already exists");
}
assert(duplicateBlocked, "duplicate follow-up blocked");

pushRelationshipTimeline(seed[0], { label: "Check-in recorded", detail: "Warm progress" });
assert(seed[0].timeline.length >= 2, "timeline entries persist");

console.log("test-relationship-follow-up: all assertions passed");
