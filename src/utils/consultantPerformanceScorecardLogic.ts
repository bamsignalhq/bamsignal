import {
  CONSULTANT_ACHIEVEMENT_DEFINITIONS,
  HEALTH_METRIC_LABELS,
  MEMBER_SATISFACTION_TITLE,
  RELATIONSHIP_METRIC_LABELS,
  type ConsultantPerformanceMetricKeys
} from "../constants/consultantPerformanceScorecard";
import type { ConciergeIntroductionOutcome } from "../constants/conciergeConsultant";
import type { ConciergeConsultantActivity } from "../types/conciergeConsultantDirectory";
import type { ConciergeScheduledMeeting } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConsultantAchievement,
  ConsultantHealthSnapshot,
  ConsultantJourneyOutcome,
  ConsultantPerformanceScorecard,
  ConsultantPerformanceTrend,
  ConsultantRelationshipMetrics,
  ConsultantResponseQuality
} from "../types/consultantPerformanceScorecard";

const ACTIVE_STATUSES = new Set<ConciergeMemberRecord["status"]>([
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "consultation-scheduled"
]);

const RELATIONSHIP_OUTCOMES = new Set<ConciergeIntroductionOutcome>([
  "relationship",
  "exclusive",
  "completed"
]);

const POSITIVE_RETENTION_STATUSES = new Set<ConciergeMemberRecord["status"]>([
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

export function computeRelationshipMetrics(input: {
  members: ConciergeMemberRecord[];
  activity: ConciergeConsultantActivity[];
}): ConsultantRelationshipMetrics {
  const { members, activity } = input;
  const introductions = members.flatMap((member) => member.introductions);
  const followUpTasks = members.flatMap((member) => member.followUpTasks);

  const consultationsCompleted = Math.max(
    members.filter((member) =>
      member.timeline.some((event) => event.type === "consultation-completed")
    ).length,
    activity.filter((item) => item.type === "consultation-completed").length
  );

  const applicationsReviewed = activity.filter(
    (item) => item.type === "application-reviewed"
  ).length;

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
    members.filter((member) => member.status === "married" || member.status === "legacy-archive")
      .length
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

export function deriveResponseQuality(input: {
  memberSatisfaction: number | null;
  responseTimeHours: number | null;
}): ConsultantResponseQuality {
  if (input.memberSatisfaction === null && input.responseTimeHours === null) return "unknown";
  if (input.memberSatisfaction !== null && input.memberSatisfaction >= 85) {
    if (input.responseTimeHours === null || input.responseTimeHours <= 24) return "excellent";
  }
  if (input.memberSatisfaction !== null && input.memberSatisfaction >= 70) return "good";
  if (input.responseTimeHours !== null && input.responseTimeHours > 48) return "needs-attention";
  if (input.memberSatisfaction !== null && input.memberSatisfaction < 60) return "needs-attention";
  return "good";
}

export function computeConsultantHealth(input: {
  members: ConciergeMemberRecord[];
  meetings: ConciergeScheduledMeeting[];
  relationshipMetrics: ConsultantRelationshipMetrics;
}): ConsultantHealthSnapshot {
  const { members, meetings, relationshipMetrics } = input;
  const activeMembers = members.filter((member) => ACTIVE_STATUSES.has(member.status)).length;
  const pendingFollowUps = members
    .flatMap((member) => member.followUpTasks)
    .filter((task) => !task.completed).length;
  const upcomingMeetings = meetings.filter(
    (meeting) => new Date(meeting.scheduledAt).getTime() >= Date.now()
  ).length;
  const workload = activeMembers + pendingFollowUps + upcomingMeetings;

  return {
    activeMembers,
    workload,
    pendingFollowUps,
    upcomingMeetings,
    responseQuality: deriveResponseQuality({
      memberSatisfaction: relationshipMetrics.memberSatisfaction,
      responseTimeHours: relationshipMetrics.responseTimeHours
    })
  };
}

export function computeInstitutionBuilderScore(metrics: ConsultantRelationshipMetrics): number {
  if (metrics.legacyArchives >= 2 && metrics.marriages >= 5) return 1;
  if (metrics.marriages >= 10 && metrics.consultationsCompleted >= 500) return 1;
  return 0;
}

function achievementMetrics(
  metrics: ConsultantRelationshipMetrics
): ConsultantPerformanceMetricKeys & { institutionBuilder: number } {
  return {
    ...metrics,
    institutionBuilder: computeInstitutionBuilderScore(metrics)
  };
}

export function computeConsultantAchievements(
  metrics: ConsultantRelationshipMetrics
): ConsultantAchievement[] {
  const extended = achievementMetrics(metrics);
  return CONSULTANT_ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const progress =
      definition.metricKey === "institutionBuilder"
        ? extended.institutionBuilder
        : extended[definition.metricKey];
    return {
      id: definition.id,
      label: definition.label,
      earned: progress >= definition.target,
      progress,
      target: definition.target
    };
  });
}

export function deriveConsultantStrengths(
  metrics: ConsultantRelationshipMetrics,
  health: ConsultantHealthSnapshot
): string[] {
  const strengths: string[] = [];
  if (metrics.marriages > 0) strengths.push("Journey outcomes");
  if (metrics.memberSatisfaction !== null && metrics.memberSatisfaction >= 80) {
    strengths.push("Member satisfaction");
  }
  if (metrics.introductionsMade >= 10) strengths.push("Thoughtful introductions");
  if (metrics.relationshipsFormed >= 5) strengths.push("Relationship formation");
  if (metrics.legacyArchives > 0) strengths.push("Legacy matchmaking");
  if (health.responseQuality === "excellent") strengths.push("Response quality");
  if (metrics.retentionRate !== null && metrics.retentionRate >= 80) strengths.push("Member retention");
  if (!strengths.length) strengths.push("Building journey momentum");
  return strengths;
}

export function buildJourneyOutcomes(metrics: ConsultantRelationshipMetrics): ConsultantJourneyOutcome[] {
  return [
    { id: "relationships", label: "Relationships formed", count: metrics.relationshipsFormed },
    { id: "exclusive", label: "Exclusive relationships", count: metrics.exclusiveRelationships },
    { id: "engagements", label: "Engagements", count: metrics.engagements },
    { id: "marriages", label: "Marriages", count: metrics.marriages },
    { id: "legacy", label: "Legacy archives", count: metrics.legacyArchives }
  ];
}

export function buildPerformanceTrends(
  metrics: ConsultantRelationshipMetrics,
  health: ConsultantHealthSnapshot
): ConsultantPerformanceTrend[] {
  return [
    {
      label: RELATIONSHIP_METRIC_LABELS.consultationsCompleted,
      value: metrics.consultationsCompleted
    },
    {
      label: RELATIONSHIP_METRIC_LABELS.introductionsMade,
      value: metrics.introductionsMade
    },
    {
      label: RELATIONSHIP_METRIC_LABELS.marriages,
      value: metrics.marriages
    },
    {
      label: MEMBER_SATISFACTION_TITLE,
      value: metrics.memberSatisfaction ?? 0,
      unit: metrics.memberSatisfaction !== null ? "%" : undefined
    },
    {
      label: "Retention",
      value: metrics.retentionRate ?? 0,
      unit: metrics.retentionRate !== null ? "%" : undefined
    },
    {
      label: HEALTH_METRIC_LABELS.workload,
      value: health.workload
    }
  ];
}

export function buildConsultantPerformanceScorecard(input: {
  consultantId: string;
  consultantName: string;
  members: ConciergeMemberRecord[];
  activity: ConciergeConsultantActivity[];
  meetings: ConciergeScheduledMeeting[];
}): ConsultantPerformanceScorecard {
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
    strengths: deriveConsultantStrengths(relationshipMetrics, health),
    journeyOutcomes: buildJourneyOutcomes(relationshipMetrics),
    trends: buildPerformanceTrends(relationshipMetrics, health),
    futureRankings: {
      enabled: false,
      kinds: ["senior-matchmaker", "diaspora-specialist", "family-advisor", "relationship-coach"]
    }
  };
}

export function assertScorecardExcludesSalesMetrics(scorecard: ConsultantPerformanceScorecard): boolean {
  const serialized = JSON.stringify(scorecard).toLowerCase();
  const forbidden = ["revenue", "sales", "conversion rate", "lead value", "top seller"];
  return !forbidden.some((term) => serialized.includes(term));
}
