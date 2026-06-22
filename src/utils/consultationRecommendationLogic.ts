import {
  CONSULTATION_OUTCOME_LABELS,
  CONSULTATION_RECOMMENDATION_LABELS,
  CONSULTATION_REVIEW_TIMELINE_LABELS,
  emptyConsultationNotesSections
} from "../constants/consultationReview";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConsultationNotesSections,
  ConsultationOutcome,
  ConsultationRecommendation,
  ConsultationRecommendationType,
  ConsultationReviewTimelineEntry,
  ConsultationReviewTimelineKind
} from "../types/consultationReview";

const OUTCOME_TO_RECOMMENDATION: Record<ConsultationOutcome, ConsultationRecommendationType> = {
  approved: "proceed-to-application",
  "requires-review": "additional-consultation",
  "not-a-fit-yet": "pause-journey",
  "follow-up-required": "relationship-coaching",
  paused: "pause-journey"
};

export function defaultRecommendationTypeForOutcome(
  outcome: ConsultationOutcome
): ConsultationRecommendationType {
  return OUTCOME_TO_RECOMMENDATION[outcome];
}

export function deriveConsultationOutcome(member: ConciergeMemberRecord): ConsultationOutcome {
  if (member.status === "paused") return "paused";
  if (member.status === "waitlisted") return "not-a-fit-yet";
  if (member.status === "under-review" || member.status === "applied") return "requires-review";
  if (
    member.status === "accepted" ||
    member.status === "active-search" ||
    member.status === "introductions-in-progress"
  ) {
    return "approved";
  }
  if (member.followUpTasks.some((task) => !task.completed)) return "follow-up-required";
  return "requires-review";
}

export function bootstrapNotesFromMember(member: ConciergeMemberRecord): ConsultationNotesSections {
  const journal = member.communicationJournal.find((entry) =>
    entry.summary.toLowerCase().includes("consultation")
  );
  const consultantNotes = member.privateNotes
    .map((note) => note.body)
    .filter(Boolean)
    .join(" ");

  return {
    "relationship-goals":
      member.relationshipGoals.whatHopingToFind?.trim() ||
      member.relationshipGoals.marriageTimeline?.trim() ||
      "",
    values: member.valuesLifestyle.faithImportance?.trim() || "",
    lifestyle: [member.valuesLifestyle.smoking, member.valuesLifestyle.drinking]
      .filter(Boolean)
      .join(" · "),
    faith: member.valuesLifestyle.faithImportance?.trim() || "",
    "family-vision":
      member.relationshipGoals.familyGoals?.trim() ||
      member.relationshipGoals.childrenPreference?.trim() ||
      "",
    "compatibility-observations": member.relationshipGoals.dealBreakers?.trim() || "",
    "consultant-observations": journal?.summary?.trim() || consultantNotes || "",
    recommendations: journal?.nextAction?.trim() || ""
  };
}

export function buildConsultationRecommendation(input: {
  outcome: ConsultationOutcome;
  notes: ConsultationNotesSections;
  issuedAt: string;
  issuedBy?: string;
  type?: ConsultationRecommendationType;
}): ConsultationRecommendation {
  const type = input.type ?? defaultRecommendationTypeForOutcome(input.outcome);
  const noteDetail = input.notes.recommendations.trim();
  const detail =
    noteDetail ||
    `${CONSULTATION_RECOMMENDATION_LABELS[type]} following ${CONSULTATION_OUTCOME_LABELS[input.outcome].toLowerCase()} consultation review.`;

  return {
    id: `consultation_rec_${Date.parse(input.issuedAt)}`,
    type,
    label: CONSULTATION_RECOMMENDATION_LABELS[type],
    detail,
    issuedAt: input.issuedAt,
    issuedBy: input.issuedBy
  };
}

export function createReviewTimelineEntry(
  kind: ConsultationReviewTimelineKind,
  at: string,
  detail?: string
): ConsultationReviewTimelineEntry {
  return {
    id: `consultation_review_tl_${kind}_${Date.parse(at)}`,
    kind,
    label: CONSULTATION_REVIEW_TIMELINE_LABELS[kind],
    detail,
    at
  };
}

export function bootstrapReviewTimeline(
  outcome: ConsultationOutcome,
  heldAt: string,
  createdAt: string
): ConsultationReviewTimelineEntry[] {
  const entries: ConsultationReviewTimelineEntry[] = [
    createReviewTimelineEntry("consultation-completed", heldAt, "Consultation held with member."),
    createReviewTimelineEntry("review-created", createdAt, "Structured consultation review opened.")
  ];

  entries.push(
    createReviewTimelineEntry(
      "recommendation-issued",
      createdAt,
      CONSULTATION_RECOMMENDATION_LABELS[defaultRecommendationTypeForOutcome(outcome)]
    )
  );

  if (outcome === "approved") {
    entries.push(
      createReviewTimelineEntry("approval-granted", createdAt, CONSULTATION_OUTCOME_LABELS.approved)
    );
  }
  if (outcome === "follow-up-required") {
    entries.push(
      createReviewTimelineEntry(
        "follow-up-required",
        createdAt,
        "Steward follow-up required before next journey step."
      )
    );
  }

  return entries;
}

export function buildReviewSummaryNarrative(input: {
  memberName: string;
  outcome: ConsultationOutcome;
  recommendation: ConsultationRecommendation;
  consultantName: string;
}): string {
  return `${input.memberName} — ${CONSULTATION_OUTCOME_LABELS[input.outcome]} with ${input.recommendation.label.toLowerCase()} recommended by ${input.consultantName}.`;
}

export function mergeConsultationNotes(
  existing: ConsultationNotesSections,
  incoming: ConsultationNotesSections
): ConsultationNotesSections {
  const base = emptyConsultationNotesSections();
  for (const key of Object.keys(base) as (keyof ConsultationNotesSections)[]) {
    base[key] = existing[key]?.trim() || incoming[key]?.trim() || "";
  }
  return base;
}

export function appendReviewTimelineIfMissing(
  timeline: ConsultationReviewTimelineEntry[],
  entry: ConsultationReviewTimelineEntry
): ConsultationReviewTimelineEntry[] {
  if (timeline.some((item) => item.kind === entry.kind && item.at === entry.at)) {
    return timeline;
  }
  return [...timeline, entry];
}

export function assertConsultationReviewTimelineIntegrity(
  previous: ConsultationReviewTimelineEntry[],
  next: ConsultationReviewTimelineEntry[]
): void {
  if (next.length < previous.length) {
    throw new Error("Consultation review timeline cannot shrink");
  }
}
