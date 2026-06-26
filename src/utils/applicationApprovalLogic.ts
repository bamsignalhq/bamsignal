import {
  APPLICATION_APPROVAL_APPEND_ONLY_RULE,
  APPLICATION_APPROVAL_HUMAN_COPY,
  APPLICATION_APPROVAL_STATUS_LABELS,
  APPLICATION_APPROVAL_TIMELINE_STEPS
} from "../constants/applicationApproval";
import type { SignalConciergeStatus } from "../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ApplicationApprovalStatus,
  ApplicationReview,
  ApprovalDecision,
  MemberApplicationApprovalBundle,
  ReviewSummary,
  ReviewTimelineEntry,
  ReviewTimelineKind,
  ReviewerRecommendation
} from "../types/applicationApproval";
import { getMemberStewardName } from "./conciergeMemberStewardship";

const APPROVED_STATUSES = new Set<SignalConciergeStatus>([
  "accepted",
  "active-search",
  "introductions-in-progress",
  "relationship",
  "matched",
  "exclusive",
  "engaged",
  "married",
  "legacy-archive"
]);

const UNDER_REVIEW_STATUSES = new Set<SignalConciergeStatus>([
  "under-review",
  "consultation-scheduled",
  "waitlisted"
]);

function timelineEntryId(kind: ReviewTimelineKind, at: string): string {
  return `review_tl_${kind}_${Date.parse(at)}`;
}

export function createReviewTimelineEntry(input: {
  kind: ReviewTimelineKind;
  label: string;
  detail?: string;
  at: string;
}): ReviewTimelineEntry {
  return {
    id: timelineEntryId(input.kind, input.at),
    kind: input.kind,
    label: input.label,
    detail: input.detail,
    at: input.at
  };
}

/** Append-only — never removes existing entries. */
export function appendReviewTimelineEntry(
  timeline: ReviewTimelineEntry[],
  entry: ReviewTimelineEntry
): ReviewTimelineEntry[] {
  if (timeline.some((item) => item.kind === entry.kind)) return timeline;
  return [...timeline, entry];
}

export function deriveApprovalStatus(member: ConciergeMemberRecord): ApplicationApprovalStatus {
  if (member.status === "applied") return "submitted";
  if (member.status === "paused") return "additional-information";
  if (member.status === "closed") return "declined";
  if (APPROVED_STATUSES.has(member.status)) return "approved";
  if (UNDER_REVIEW_STATUSES.has(member.status)) return "under-review";
  return "submitted";
}

function buildDecision(status: ApplicationApprovalStatus, member: ConciergeMemberRecord): ApprovalDecision {
  const label = APPLICATION_APPROVAL_STATUS_LABELS[status];
  const details: Record<ApplicationApprovalStatus, string> = {
    submitted: `${member.aboutYou.name}'s application is submitted and awaiting steward review.`,
    "under-review": "A steward is reviewing the application privately before any introductions.",
    "additional-information": "Steward may request gentle clarification before proceeding.",
    approved: "Application approved — member may enter the introduction stage when ready.",
    declined: "Application not continued. Decision recorded with dignity.",
    withdrawn: "Member withdrew from the application process."
  };

  return {
    status,
    label,
    detail: details[status],
    decidedAt: status === "approved" || status === "declined" ? member.updatedAt : undefined,
    decidedBy: status === "approved" || status === "declined" ? member.assignedBy ?? "BamSignal Admin" : undefined
  };
}

function buildRecommendation(member: ConciergeMemberRecord): ReviewerRecommendation | undefined {
  const reviewerId = member.currentConsultantId ?? member.assignedConsultantId;
  const reviewerName = getMemberStewardName(member);
  if (!reviewerId || !reviewerName) return undefined;

  const lines = member.consultantSummary?.lines ?? [];
  const recommendation =
    lines[0] ??
    (member.status === "applied" || member.status === "under-review"
      ? "Review in progress — steward recommendation pending."
      : member.status === "consultation-scheduled"
        ? "Consultation complete — steward preparing recommendation."
        : APPROVED_STATUSES.has(member.status)
          ? "Recommend proceeding to introductions with thoughtful stewardship."
          : "Steward recommendation on file.");

  return {
    id: `rec_${member.id}`,
    reviewerId,
    reviewerName,
    recommendation,
    recordedAt: member.assignedAt ?? member.updatedAt
  };
}

function shouldIncludeTimelineStep(
  kind: ReviewTimelineKind,
  status: ApplicationApprovalStatus,
  hasRecommendation: boolean
): boolean {
  if (kind === "application-submitted") return true;
  if (kind === "review-started") {
    return status !== "submitted";
  }
  if (kind === "consultant-recommendation") {
    return hasRecommendation && status !== "submitted";
  }
  if (kind === "decision") {
    return status === "approved" || status === "declined" || status === "withdrawn";
  }
  return false;
}

export function buildReviewTimeline(input: {
  member: ConciergeMemberRecord;
  status: ApplicationApprovalStatus;
  recommendation?: ReviewerRecommendation;
}): ReviewTimelineEntry[] {
  const { member, status, recommendation } = input;
  let timeline: ReviewTimelineEntry[] = [
    createReviewTimelineEntry({
      kind: "application-submitted",
      label: APPLICATION_APPROVAL_TIMELINE_STEPS[0].label,
      detail: APPLICATION_APPROVAL_TIMELINE_STEPS[0].detail,
      at: member.createdAt
    })
  ];

  for (const step of APPLICATION_APPROVAL_TIMELINE_STEPS.slice(1)) {
    if (!shouldIncludeTimelineStep(step.kind, status, Boolean(recommendation))) continue;

    const at =
      step.kind === "review-started"
        ? member.assignedAt ?? member.updatedAt
        : step.kind === "consultant-recommendation"
          ? recommendation?.recordedAt ?? member.updatedAt
          : member.updatedAt;

    timeline = appendReviewTimelineEntry(
      timeline,
      createReviewTimelineEntry({
        kind: step.kind,
        label: step.label,
        detail: step.detail,
        at
      })
    );
  }

  return timeline;
}

export function buildApplicationReview(input: {
  member: ConciergeMemberRecord;
  reviewId: string;
  existing?: ApplicationReview;
}): ApplicationReview {
  const { member, reviewId, existing } = input;
  const status = deriveApprovalStatus(member);
  const recommendation = buildRecommendation(member);
  const decision = buildDecision(status, member);
  const timeline = existing
    ? appendReviewTimelineEntries(
        existing.timeline,
        buildReviewTimeline({ member, status, recommendation })
      )
    : buildReviewTimeline({ member, status, recommendation });

  return {
    id: `application_review_${member.id}`,
    reviewId,
    memberId: member.id,
    journeyId: member.journeyId,
    memberName: member.aboutYou.name,
    status,
    assignedReviewerId: member.currentConsultantId ?? member.assignedConsultantId,
    assignedReviewerName: getMemberStewardName(member) ?? undefined,
    timeline,
    recommendation,
    decision,
    createdAt: member.createdAt,
    updatedAt: new Date().toISOString()
  };
}

function appendReviewTimelineEntries(
  existing: ReviewTimelineEntry[],
  incoming: ReviewTimelineEntry[]
): ReviewTimelineEntry[] {
  return incoming.reduce((current, entry) => appendReviewTimelineEntry(current, entry), existing);
}

export function buildReviewSummary(review: ApplicationReview): ReviewSummary {
  return {
    reviewId: review.reviewId,
    memberId: review.memberId,
    memberName: review.memberName,
    journeyId: review.journeyId,
    status: review.status,
    statusLabel: APPLICATION_APPROVAL_STATUS_LABELS[review.status],
    assignedReviewerName: review.assignedReviewerName,
    recommendationPreview: review.recommendation?.recommendation,
    decisionLabel: review.decision.label,
    narrative: `${APPLICATION_APPROVAL_HUMAN_COPY} ${APPLICATION_APPROVAL_APPEND_ONLY_RULE}`
  };
}

export function buildMemberApplicationApprovalBundle(
  _member: ConciergeMemberRecord,
  review: ApplicationReview
): MemberApplicationApprovalBundle {
  return {
    review,
    summary: buildReviewSummary(review)
  };
}
