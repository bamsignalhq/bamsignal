import {
  CONSULTATION_OUTCOME_LABELS,
  CONSULTATION_RECOMMENDATION_LABELS,
  CONSULTATION_REVIEW_ENGINE_BRAND
} from "../constants/consultationReview";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConsultationReview,
  ConsultationReviewSummary,
  MemberConsultationReviewBundle
} from "../types/consultationReview";
import { listSchedulingEvents } from "./ConsultationSchedulingEngine";
import { listConciergeMembers } from "./conciergeConsultantStore";
import { listMeetingNotesForMember } from "./MeetingNotesEngine";
import {
  appendReviewTimelineIfMissing,
  assertConsultationReviewTimelineIntegrity,
  bootstrapNotesFromMember,
  bootstrapReviewTimeline,
  buildConsultationRecommendation,
  buildReviewSummaryNarrative,
  deriveConsultationOutcome,
  mergeConsultationNotes
} from "./consultationRecommendationLogic";
import {
  getConsultationReview,
  listConsultationReviews,
  listConsultationReviewsForMember,
  reviewRecordId,
  saveConsultationReview
} from "./consultationNotesStore";

export { CONSULTATION_REVIEW_ENGINE_BRAND };

function latestConsultationHeldAt(member: ConciergeMemberRecord): string {
  const completedEvent = member.timeline.find((event) => event.type === "consultation-completed");
  if (completedEvent) return completedEvent.at;
  if (member.consultationScheduledAt) return member.consultationScheduledAt;
  const journal = member.communicationJournal[0];
  if (journal) return journal.date;
  return member.updatedAt;
}

function consultantForMember(member: ConciergeMemberRecord): {
  consultantId: string;
  consultantName: string;
} {
  return {
    consultantId: member.currentConsultantId ?? member.assignedConsultantId ?? "steward",
    consultantName: member.assignedConsultantName ?? "Steward"
  };
}

function buildConsultationReviewFromMember(
  member: ConciergeMemberRecord,
  existing?: ConsultationReview
): ConsultationReview | null {
  const hasConsultationSignal =
    member.timeline.some((event) => event.type === "consultation-completed") ||
    member.communicationJournal.length > 0 ||
    member.status === "consultation-scheduled" ||
    Boolean(member.consultationScheduledAt);

  if (!hasConsultationSignal && !existing) return null;

  const heldAt = existing?.heldAt ?? latestConsultationHeldAt(member);
  const recordId = existing?.id ?? reviewRecordId(member.id, heldAt);
  const createdAt = existing?.createdAt ?? heldAt;
  const outcome = existing?.outcome ?? deriveConsultationOutcome(member);
  const notes = mergeConsultationNotes(
    existing?.notes ?? bootstrapNotesFromMember(member),
    bootstrapNotesFromMember(member)
  );
  const { consultantId, consultantName } = consultantForMember(member);
  const recommendation =
    existing?.recommendation ??
    buildConsultationRecommendation({
      outcome,
      notes,
      issuedAt: createdAt,
      issuedBy: consultantName
    });

  const meetingNote = listMeetingNotesForMember(member.id).find((note) => note.type === "consultation");
  const schedulingEvent = listSchedulingEvents().find(
    (event) => event.memberId === member.id && event.status === "completed"
  );

  const timeline = existing
    ? appendReviewTimelineIfMissing(existing.timeline, {
        id: `consultation_review_tl_recommendation_${Date.parse(recommendation.issuedAt)}`,
        kind: "recommendation-issued",
        label: "Recommendation issued",
        detail: recommendation.label,
        at: recommendation.issuedAt
      })
    : bootstrapReviewTimeline(outcome, heldAt, createdAt);

  if (existing) assertConsultationReviewTimelineIntegrity(existing.timeline, timeline);

  const summary =
    existing?.summary ??
    buildReviewSummaryNarrative({
      memberName: member.aboutYou.name,
      outcome,
      recommendation,
      consultantName
    });

  return {
    id: recordId,
    reviewId: existing?.reviewId ?? "",
    memberId: member.id,
    journeyId: member.journeyId,
    memberName: member.aboutYou.name,
    consultantId,
    consultantName,
    consultationEventId: schedulingEvent?.id,
    meetingNoteId: meetingNote?.noteId,
    heldAt,
    outcome,
    notes,
    recommendation,
    timeline,
    summary,
    createdAt,
    updatedAt: new Date().toISOString()
  };
}

export function syncConsultationReviewsFromMembers(): ConsultationReview[] {
  const members = listConciergeMembers();
  const saved: ConsultationReview[] = [];

  for (const member of members) {
    const existing = listConsultationReviewsForMember(member.id)[0];
    const draft = buildConsultationReviewFromMember(member, existing);
    if (!draft) continue;
    saved.push(saveConsultationReview(draft));
  }

  return saved.length ? saved : listConsultationReviews();
}

function buildReviewSummary(review: ConsultationReview): ConsultationReviewSummary {
  return {
    reviewId: review.reviewId,
    memberId: review.memberId,
    memberName: review.memberName,
    journeyId: review.journeyId,
    outcome: review.outcome,
    outcomeLabel: CONSULTATION_OUTCOME_LABELS[review.outcome],
    recommendationType: review.recommendation.type,
    recommendationLabel: CONSULTATION_RECOMMENDATION_LABELS[review.recommendation.type],
    consultantName: review.consultantName,
    heldAt: review.heldAt,
    narrative: review.summary
  };
}

export function buildMemberConsultationReviewBundle(
  member: ConciergeMemberRecord
): MemberConsultationReviewBundle {
  const reviews = listConsultationReviewsForMember(member.id);
  const latest = reviews[0] ?? null;
  const timeline = reviews.flatMap((review) => review.timeline).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  return {
    summary: latest ? buildReviewSummary(latest) : null,
    reviews,
    timeline
  };
}

export function ensureMemberConsultationReviewBundle(
  member: ConciergeMemberRecord
): MemberConsultationReviewBundle {
  const existing = getConsultationReview(reviewRecordId(member.id, latestConsultationHeldAt(member)));
  const draft = buildConsultationReviewFromMember(member, existing ?? undefined);
  if (draft) saveConsultationReview(draft);
  return buildMemberConsultationReviewBundle(member);
}

export function listConsultationReviewSummaries(): ConsultationReviewSummary[] {
  syncConsultationReviewsFromMembers();
  return listConsultationReviews().map((review) => buildReviewSummary(review));
}

export function getConsultationReviewEngineSnapshot() {
  return {
    reviews: syncConsultationReviewsFromMembers(),
    summaries: listConsultationReviewSummaries()
  };
}
