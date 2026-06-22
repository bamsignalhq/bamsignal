import type { ConciergeIntroductionOutcome } from "../constants/conciergeConsultant";
import type { ConciergeConsultantMetrics } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";

const ACTIVE_STATUSES = new Set<ConciergeMemberRecord["status"]>([
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched"
]);

const MATCH_OUTCOMES = new Set<ConciergeIntroductionOutcome>([
  "mutual-interest",
  "still-talking",
  "ongoing",
  "relationship",
  "exclusive"
]);

const RELATIONSHIP_OUTCOMES = new Set<ConciergeIntroductionOutcome>([
  "relationship",
  "exclusive",
  "completed"
]);

export function computeConsultantMetrics(
  members: ConciergeMemberRecord[]
): ConciergeConsultantMetrics {
  const activeMembers = members.filter((member) => ACTIVE_STATUSES.has(member.status)).length;
  const introductions = members.flatMap((member) => member.introductions);
  const consultationsCompleted = members.filter((member) =>
    member.timeline.some((event) => event.type === "consultation-completed")
  ).length;

  const matchesFormed = members.filter((member) => member.status === "matched").length;
  const relationshipsFormed = introductions.filter((intro) =>
    RELATIONSHIP_OUTCOMES.has(intro.outcome)
  ).length;
  const engagements = introductions.filter((intro) => intro.outcome === "engaged").length;
  const marriages = introductions.filter((intro) => intro.outcome === "married").length;

  const openTasks = members.flatMap((member) => member.followUpTasks).filter((task) => !task.completed);
  const responseTimeHours =
    openTasks.length > 0
      ? Math.round(
          openTasks.reduce((sum, task) => {
            const due = new Date(task.dueAt).getTime();
            const now = Date.now();
            return sum + Math.max(0, (now - due) / (1000 * 60 * 60));
          }, 0) / openTasks.length
        )
      : null;

  const successfulIntros = introductions.filter((intro) => MATCH_OUTCOMES.has(intro.outcome)).length;
  const memberSatisfaction =
    introductions.length > 0 ? Math.round((successfulIntros / introductions.length) * 100) : null;

  return {
    activeMembers,
    introductionsMade: introductions.length,
    consultationsCompleted,
    matchesFormed,
    relationshipsFormed,
    engagements,
    marriages,
    responseTimeHours,
    memberSatisfaction
  };
}

export function portfolioAssignedMembers(members: ConciergeMemberRecord[]): ConciergeMemberRecord[] {
  return members.filter((member) => member.status !== "closed");
}

export function portfolioPendingConsultations(members: ConciergeMemberRecord[]): ConciergeMemberRecord[] {
  return members.filter(
    (member) =>
      member.status === "consultation-scheduled" ||
      member.status === "applied" ||
      member.followUpTasks.some(
        (task) => !task.completed && task.type === "schedule-consultation"
      )
  );
}

export function portfolioIntroductionsInProgress(members: ConciergeMemberRecord[]): ConciergeMemberRecord[] {
  return members.filter(
    (member) =>
      member.status === "introductions-in-progress" ||
      member.introductions.some((intro) =>
        ["ongoing", "still-talking", "mutual-interest", "paused"].includes(intro.outcome)
      )
  );
}

export function portfolioOpenFollowUps(members: ConciergeMemberRecord[]) {
  return members
    .flatMap((member) =>
      member.followUpTasks
        .filter((task) => !task.completed)
        .map((task) => ({ member, task }))
    )
    .sort((a, b) => new Date(a.task.dueAt).getTime() - new Date(b.task.dueAt).getTime());
}

export function portfolioRelationshipUpdates(members: ConciergeMemberRecord[]): ConciergeMemberRecord[] {
  return members.filter((member) =>
    member.timeline.some(
      (event) => event.type === "relationship-update" || event.type === "feedback-received"
    )
  );
}

export function portfolioSuccessStories(members: ConciergeMemberRecord[]): ConciergeMemberRecord[] {
  return members.filter((member) =>
    member.timeline.some((event) => event.type === "success-story")
  );
}
