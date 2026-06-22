/**
 * Consultant Performance Scorecard regression — outcomes only, no sales metrics.
 */
import {
  assertScorecardExcludesSalesMetrics,
  buildConsultantPerformanceScorecard,
  computeConsultantAchievements,
  computeRelationshipMetrics,
  deriveResponseQuality
} from "../server/services/consultantPerformanceScorecard.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const members = [
  {
    id: "m1",
    status: "legacy-archive",
    journeyArchive: { isLegacyArchive: true },
    introductions: [
      { outcome: "married" },
      { outcome: "ongoing" },
      { outcome: "relationship" }
    ],
    followUpTasks: [
      { completed: true, dueAt: "2028-01-01T00:00:00.000Z" },
      { completed: false, dueAt: "2020-01-01T00:00:00.000Z" }
    ],
    timeline: [{ type: "consultation-completed", at: "2028-02-01T00:00:00.000Z" }]
  },
  {
    id: "m2",
    status: "relationship",
    introductions: [{ outcome: "relationship" }],
    followUpTasks: [],
    timeline: [{ type: "consultation-completed", at: "2028-03-01T00:00:00.000Z" }]
  }
];

const activity = [
  { type: "application-reviewed" },
  { type: "consultation-completed" },
  { type: "introduction-created" }
];

const meetings = [{ scheduledAt: "2099-01-01T00:00:00.000Z" }];

const metrics = computeRelationshipMetrics({ members, activity });
assert(metrics.consultationsCompleted >= 2, "tracks consultations completed");
assert(metrics.applicationsReviewed === 1, "tracks applications reviewed");
assert(metrics.introductionsMade === 4, "tracks introductions made");
assert(metrics.followUpsCompleted === 1, "tracks follow-ups completed");
assert(metrics.relationshipsFormed >= 2, "tracks relationships formed");
assert(metrics.marriages >= 1, "tracks marriages");
assert(metrics.legacyArchives === 1, "tracks legacy archives");
assert(metrics.memberSatisfaction !== null, "tracks member satisfaction");
assert(metrics.retentionRate !== null, "tracks retention");

const quality = deriveResponseQuality({
  memberSatisfaction: 90,
  responseTimeHours: 12
});
assert(quality === "excellent", "response quality derived");

const achievements = computeConsultantAchievements(metrics);
const legacyMatchmaker = achievements.find((item) => item.id === "legacy-matchmaker");
const marriages25 = achievements.find((item) => item.id === "marriages-25");
assert(legacyMatchmaker?.earned, "Legacy Matchmaker achievement");
assert(!marriages25?.earned, "25 Marriages not yet earned in fixture");

const scorecard = buildConsultantPerformanceScorecard({
  consultantId: "consultant_ada",
  consultantName: "Ada Okafor",
  members,
  activity,
  meetings
});
assert(scorecard.consultantName === "Ada Okafor", "scorecard binds consultant");
assert(scorecard.health.activeMembers >= 1, "consultant health active members");
assert(scorecard.achievements.length === 8, "eight achievements defined");
assert(assertScorecardExcludesSalesMetrics(scorecard), "no sales metrics in scorecard");

const forbidden = JSON.stringify(scorecard).toLowerCase();
assert(!forbidden.includes("revenue"), "no revenue tracking");
assert(!forbidden.includes("conversion rate"), "no conversion rate");
assert(!forbidden.includes("lead value"), "no lead value");

assert(scorecard.futureRankings?.kinds?.includes("senior-matchmaker"), "future rankings reserved");

console.log("test-consultant-performance-scorecard: all checks passed");
