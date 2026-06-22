/** Consultant Performance Scorecard — relationship outcomes only. */

const CONSULTANT_ACHIEVEMENT_DEFINITIONS = [
  { id: "consultations-100", label: "100 Consultations", target: 100, metricKey: "consultationsCompleted" },
  { id: "introductions-50", label: "50 Introductions", target: 50, metricKey: "introductionsMade" },
  { id: "relationships-10", label: "10 Relationships", target: 10, metricKey: "relationshipsFormed" },
  { id: "engagements-5", label: "5 Engagements", target: 5, metricKey: "engagements" },
  { id: "first-marriage", label: "First Marriage", target: 1, metricKey: "marriages" },
  { id: "marriages-25", label: "25 Marriages", target: 25, metricKey: "marriages" },
  { id: "legacy-matchmaker", label: "Legacy Matchmaker", target: 1, metricKey: "legacyArchives" }
];

export const RELATIONSHIP_METRIC_LABELS = {
  consultationsCompleted: "Consultations completed",
  applicationsReviewed: "Applications reviewed",
  introductionsMade: "Introductions made",
  followUpsCompleted: "Follow-ups completed",
  relationshipsFormed: "Relationships formed",
  exclusiveRelationships: "Exclusive relationships",
  engagements: "Engagements",
  marriages: "Marriages",
  legacyArchives: "Legacy archives"
};

const ACTIVE_STATUSES = new Set([
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "consultation-scheduled"
]);

const RELATIONSHIP_OUTCOMES = new Set([
  "relationship",
  "exclusive",
  "completed"
]);

const POSITIVE_RETENTION_STATUSES = new Set([
  "relationship",
  "exclusive",
  "engaged",
  "married",
  "legacy-archive",
  "matched",
  "active-search",
  "introductions-in-progress",
  "accepted"
]);

export function computeRelationshipMetrics({ members, activity }) {
  const introductions = members.flatMap((member) => member.introductions ?? []);
  const followUpTasks = members.flatMap((member) => member.followUpTasks ?? []);

  const consultationsCompleted = Math.max(
    members.filter((member) =>
      (member.timeline ?? []).some((event) => event.type === "consultation-completed")
    ).length,
    activity.filter((item) => item.type === "consultation-completed").length
  );

  const applicationsReviewed = activity.filter((item) => item.type === "application-reviewed").length;

  const relationshipsFormed = Math.max(
    introductions.filter((intro) => RELATIONSHIP_OUTCOMES.has(intro.outcome)).length,
    members.filter((member) => member.status === "relationship").length
  );

  const exclusiveRelationships = Math.max(
    introductions.filter((intro) => intro.outcome === "exclusive").length,
    members.filter((member) => member.status === "exclusive").length
  );

  const engagements = Math.max(
    introductions.filter((intro) => intro.outcome === "engaged").length,
    members.filter((member) => member.status === "engaged").length
  );

  const marriages = Math.max(
    introductions.filter((intro) => intro.outcome === "married").length,
    members.filter((member) => member.status === "married" || member.status === "legacy-archive").length
  );

  const legacyArchives = members.filter(
    (member) => member.journeyArchive?.isLegacyArchive || member.status === "legacy-archive"
  ).length;

  const openTasks = followUpTasks.filter((task) => !task.completed);
  const responseTimeHours =
    openTasks.length > 0
      ? Math.round(
          openTasks.reduce((sum, task) => {
            const due = new Date(task.dueAt).getTime();
            return sum + Math.max(0, (Date.now() - due) / (1000 * 60 * 60));
          }, 0) / openTasks.length
        )
      : null;

  const successfulIntros = introductions.filter((intro) =>
    ["mutual-interest", "still-talking", "ongoing", "relationship", "exclusive", "engaged", "married"].includes(
      intro.outcome
    )
  ).length;
  const memberSatisfaction =
    introductions.length > 0 ? Math.round((successfulIntros / introductions.length) * 100) : null;

  const retained = members.filter((member) => POSITIVE_RETENTION_STATUSES.has(member.status)).length;
  const retentionRate = members.length > 0 ? Math.round((retained / members.length) * 100) : null;

  return {
    consultationsCompleted,
    applicationsReviewed,
    introductionsMade: introductions.length,
    followUpsCompleted: followUpTasks.filter((task) => task.completed).length,
    relationshipsFormed,
    exclusiveRelationships,
    engagements,
    marriages,
    legacyArchives,
    responseTimeHours,
    memberSatisfaction,
    retentionRate
  };
}

export function deriveResponseQuality({ memberSatisfaction, responseTimeHours }) {
  if (memberSatisfaction === null && responseTimeHours === null) return "unknown";
  if (memberSatisfaction !== null && memberSatisfaction >= 85) {
    if (responseTimeHours === null || responseTimeHours <= 24) return "excellent";
  }
  if (memberSatisfaction !== null && memberSatisfaction >= 70) return "good";
  if (responseTimeHours !== null && responseTimeHours > 48) return "needs-attention";
  if (memberSatisfaction !== null && memberSatisfaction < 60) return "needs-attention";
  return "good";
}

export function computeConsultantHealth({ members, meetings, relationshipMetrics }) {
  const activeMembers = members.filter((member) => ACTIVE_STATUSES.has(member.status)).length;
  const pendingFollowUps = members
    .flatMap((member) => member.followUpTasks ?? [])
    .filter((task) => !task.completed).length;
  const upcomingMeetings = meetings.filter(
    (meeting) => new Date(meeting.scheduledAt).getTime() >= Date.now()
  ).length;

  return {
    activeMembers,
    workload: activeMembers + pendingFollowUps + upcomingMeetings,
    pendingFollowUps,
    upcomingMeetings,
    responseQuality: deriveResponseQuality({
      memberSatisfaction: relationshipMetrics.memberSatisfaction,
      responseTimeHours: relationshipMetrics.responseTimeHours
    })
  };
}

export function computeConsultantAchievements(metrics) {
  return CONSULTANT_ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const progress = metrics[definition.metricKey] ?? 0;
    return {
      id: definition.id,
      label: definition.label,
      earned: progress >= definition.target,
      progress,
      target: definition.target
    };
  });
}

export function buildConsultantPerformanceScorecard(input) {
  const relationshipMetrics = computeRelationshipMetrics({
    members: input.members,
    activity: input.activity
  });
  const health = computeConsultantHealth({
    members: input.members,
    meetings: input.meetings,
    relationshipMetrics
  });

  return {
    consultantId: input.consultantId,
    consultantName: input.consultantName,
    relationshipMetrics,
    health,
    achievements: computeConsultantAchievements(relationshipMetrics),
    strengths: [],
    journeyOutcomes: [],
    trends: [],
    futureRankings: {
      enabled: false,
      kinds: ["senior-matchmaker", "diaspora-specialist", "family-advisor", "relationship-coach"]
    }
  };
}

export function assertScorecardExcludesSalesMetrics(scorecard) {
  const serialized = JSON.stringify(scorecard).toLowerCase();
  const forbidden = ["revenue", "sales", "conversion rate", "lead value", "top seller"];
  return !forbidden.some((term) => serialized.includes(term));
}

