/**
 * Journey milestone timeline regression — permanent milestones never shrink.
 */
import {
  addOrUpdateMilestone,
  assertMilestonesIntegrity,
  createEmptyMilestoneTimeline,
  normalizeMilestones
} from "../server/services/journeyMilestones.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const journeyId = "BS-JR-2028-0045";
let timeline = createEmptyMilestoneTimeline(journeyId);
assert(timeline.milestones.length === 0, "starts with no milestones");

timeline = addOrUpdateMilestone(timeline, {
  milestoneId: "met",
  milestoneAt: "2028-05-20T00:00:00.000Z",
  recordedBy: "Ada Okafor"
});
timeline = addOrUpdateMilestone(timeline, {
  milestoneId: "relationship-formed",
  milestoneAt: "2028-06-01T00:00:00.000Z",
  recordedBy: "Ada Okafor"
});
timeline = addOrUpdateMilestone(timeline, {
  milestoneId: "engaged",
  milestoneAt: "2029-11-01T00:00:00.000Z",
  recordedBy: "Ada Okafor"
});
timeline = addOrUpdateMilestone(timeline, {
  milestoneId: "married",
  milestoneAt: "2030-04-18T00:00:00.000Z",
  recordedBy: "Ada Okafor",
  note: "Wedding celebrated with family"
});
timeline = addOrUpdateMilestone(timeline, {
  milestoneId: "first-anniversary",
  milestoneAt: "2031-04-18T00:00:00.000Z",
  recordedBy: "Ada Okafor"
});
timeline = addOrUpdateMilestone(timeline, {
  milestoneId: "five-years-together",
  milestoneAt: "2035-04-18T00:00:00.000Z",
  recordedBy: "Ada Okafor"
});
timeline = addOrUpdateMilestone(timeline, {
  milestoneId: "ten-years-together",
  milestoneAt: "2040-04-18T00:00:00.000Z",
  recordedBy: "Ada Okafor"
});

assert(timeline.milestones.length === 7, "seed timeline has seven milestones");
assert(
  normalizeMilestones(timeline.milestones)
    .map((item) => item.id)
    .join(",") ===
    "met,relationship-formed,engaged,married,first-anniversary,five-years-together,ten-years-together",
  "milestones stay in journey order"
);

const years = normalizeMilestones(timeline.milestones).map((item) =>
  String(new Date(item.milestoneAt).getUTCFullYear())
);
assert(years.join(",") === "2028,2028,2029,2030,2031,2035,2040", "milestone years match example");

// Update wedding note — same id, no shrink
const updated = addOrUpdateMilestone(timeline, {
  milestoneId: "married",
  milestoneAt: "2030-04-18T00:00:00.000Z",
  note: "Anniversary notes preserved",
  recordedBy: "Ada Okafor"
});
assert(updated.milestones.length === 7, "updates do not remove milestones");
assert(
  updated.milestones.find((item) => item.id === "married")?.note === "Anniversary notes preserved",
  "anniversary notes update in place"
);

// Integrity — milestones cannot be removed
let threw = false;
try {
  assertMilestonesIntegrity(timeline, {
    ...timeline,
    milestones: timeline.milestones.filter((item) => item.id !== "engaged")
  });
} catch {
  threw = true;
}
assert(threw, "journey milestones cannot shrink");

assert(timeline.futureCelebrations?.kinds?.includes("anniversary-gifts"), "future celebrations reserved");

console.log("test-journey-milestones: all checks passed");
