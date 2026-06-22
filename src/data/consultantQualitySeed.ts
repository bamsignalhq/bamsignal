import type { QualityAreaRating, QualityReviewRecord } from "../types/consultantQuality";
import type { QualityRatingId, QualityReviewAreaId } from "../constants/consultantQuality";

function area(
  areaId: QualityReviewAreaId,
  rating: QualityRatingId,
  note: string
): QualityAreaRating {
  return { areaId, rating, note };
}

export const CONSULTANT_QUALITY_SEED: QualityReviewRecord[] = [
  {
    id: "quality_001",
    reviewRef: "QA-2026-0041",
    consultantRef: "consultant_ada_okafor",
    consultantName: "Ada Okafor",
    reviewer: "ngozi@bamsignal.com",
    reviewedAt: "2026-06-20T14:00:00.000Z",
    journeyRef: "BS-JR-2026-0042",
    overallScore: 91,
    summary: "Strong consultation and introduction workflow. Documentation meets institutional standards.",
    areaRatings: [
      area("consultation-quality", "excellent", "Thorough intake and values alignment."),
      area("meeting-notes", "strong", "Notes complete with action items."),
      area("recommendations", "excellent", "Recommendations well-reasoned and documented."),
      area("introductions", "strong", "Introduction advanced with proper consent flow."),
      area("follow-up-quality", "good", "Follow-up timely; one missed check-in noted."),
      area("documentation-quality", "excellent", "Journey documentation complete."),
      area("member-satisfaction", "excellent", "Member feedback positive."),
      area("professional-conduct", "excellent", "Professional throughout.")
    ],
    improvementPlan: [
      {
        areaId: "follow-up-quality",
        recommendation: "Schedule follow-up reminders 48h after introduction.",
        trainingModule: "Relationship Follow-Up"
      }
    ],
    appendLog: [
      {
        id: "quality_append_0001",
        actor: "ngozi@bamsignal.com",
        timestamp: "2026-06-20T14:00:00.000Z",
        action: "review-completed",
        note: "Initial quality review completed."
      }
    ]
  },
  {
    id: "quality_002",
    reviewRef: "QA-2026-0042",
    consultantRef: "consultant_chidi_emeka",
    consultantName: "Chidi Emeka",
    reviewer: "ada@bamsignal.com",
    reviewedAt: "2026-06-21T10:00:00.000Z",
    journeyRef: "BS-JR-2026-0038",
    overallScore: 68,
    summary: "Good consultation foundation. Meeting notes and documentation need improvement.",
    areaRatings: [
      area("consultation-quality", "good", "Solid consultation structure."),
      area("meeting-notes", "needs-improvement", "Notes sparse — missing compatibility summary."),
      area("recommendations", "good", "Recommendations present but brief."),
      area("introductions", "good", "Introduction process followed."),
      area("follow-up-quality", "good", "Follow-up completed on schedule."),
      area("documentation-quality", "needs-improvement", "Journey notes incomplete in two fields."),
      area("member-satisfaction", "strong", "Member satisfied with consultant rapport."),
      area("professional-conduct", "excellent", "No conduct concerns.")
    ],
    improvementPlan: [
      {
        areaId: "meeting-notes",
        recommendation: "Use consultation note template for every session.",
        trainingModule: "Consultation Excellence"
      },
      {
        areaId: "documentation-quality",
        recommendation: "Complete all required journey documentation fields before close.",
        trainingModule: "Documentation Standards"
      }
    ],
    appendLog: [
      {
        id: "quality_append_0001",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-21T10:00:00.000Z",
        action: "review-completed",
        note: "Quality review with improvement plan assigned."
      },
      {
        id: "quality_append_0002",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-21T10:30:00.000Z",
        action: "training-recommended",
        note: "Recommended Documentation Standards module."
      }
    ]
  },
  {
    id: "quality_003",
    reviewRef: "QA-2026-0043",
    consultantRef: "consultant_fatima_bello",
    consultantName: "Fatima Bello",
    reviewer: "ngozi@bamsignal.com",
    reviewedAt: "2026-06-19T16:00:00.000Z",
    journeyRef: "BS-JR-2026-0040",
    overallScore: 88,
    summary: "Excellent compatibility review and introduction quality.",
    areaRatings: [
      area("consultation-quality", "strong", "Strong consultation delivery."),
      area("meeting-notes", "excellent", "Detailed meeting notes with compatibility matrix."),
      area("recommendations", "excellent", "Clear, actionable recommendations."),
      area("introductions", "excellent", "Introduction handled with care and consent."),
      area("follow-up-quality", "strong", "Consistent follow-up cadence."),
      area("documentation-quality", "strong", "Documentation thorough."),
      area("member-satisfaction", "excellent", "High member satisfaction scores."),
      area("professional-conduct", "excellent", "Exemplary professional conduct.")
    ],
    improvementPlan: [],
    appendLog: [
      {
        id: "quality_append_0001",
        actor: "ngozi@bamsignal.com",
        timestamp: "2026-06-19T16:00:00.000Z",
        action: "review-completed",
        note: "Quality review passed — no improvement plan required."
      }
    ]
  },
  {
    id: "quality_004",
    reviewRef: "QA-2026-0044",
    consultantRef: "consultant_tunde_obi",
    consultantName: "Tunde Obi",
    reviewer: "fatima@bamsignal.com",
    reviewedAt: "2026-06-22T09:00:00.000Z",
    journeyRef: "BS-JR-2026-0045",
    overallScore: 52,
    summary: "New consultant — multiple areas require review and academy training.",
    areaRatings: [
      area("consultation-quality", "needs-improvement", "Consultation structure inconsistent."),
      area("meeting-notes", "requires-review", "Meeting notes not submitted for last session."),
      area("recommendations", "needs-improvement", "Recommendations lack supporting rationale."),
      area("introductions", "good", "Introduction basics followed."),
      area("follow-up-quality", "requires-review", "Follow-up overdue by 5 days."),
      area("documentation-quality", "needs-improvement", "Documentation gaps in journey record."),
      area("member-satisfaction", "good", "Member rapport positive despite process gaps."),
      area("professional-conduct", "strong", "Professional demeanor maintained.")
    ],
    improvementPlan: [
      {
        areaId: "consultation-quality",
        recommendation: "Complete Consultation Excellence academy module.",
        trainingModule: "Consultation Excellence"
      },
      {
        areaId: "meeting-notes",
        recommendation: "Submit meeting notes within 24h of every consultation.",
        trainingModule: "Signal Concierge Process"
      },
      {
        areaId: "follow-up-quality",
        recommendation: "Use follow-up checklist for every active introduction.",
        trainingModule: "Relationship Follow-Up"
      }
    ],
    appendLog: [
      {
        id: "quality_append_0001",
        actor: "fatima@bamsignal.com",
        timestamp: "2026-06-22T09:00:00.000Z",
        action: "review-completed",
        note: "Quality review flagged for operations follow-up."
      }
    ]
  },
  {
    id: "quality_005",
    reviewRef: "QA-2026-0039",
    consultantRef: "consultant_amara_di",
    consultantName: "Amara Di",
    reviewer: "ada@bamsignal.com",
    reviewedAt: "2026-06-15T11:00:00.000Z",
    journeyRef: "BS-JR-2026-0035",
    overallScore: 79,
    summary: "Solid operations coordination quality with room for introduction refinement.",
    areaRatings: [
      area("consultation-quality", "good", "Consultation adequate for operations role."),
      area("meeting-notes", "strong", "Operations notes well-maintained."),
      area("recommendations", "good", "Recommendations appropriate to role."),
      area("introductions", "needs-improvement", "Introduction consent step missed once."),
      area("follow-up-quality", "strong", "Follow-up consistent."),
      area("documentation-quality", "excellent", "Operations documentation exemplary."),
      area("member-satisfaction", "strong", "Members report good coordination."),
      area("professional-conduct", "excellent", "Professional conduct throughout.")
    ],
    improvementPlan: [
      {
        areaId: "introductions",
        recommendation: "Review introduction consent checklist before every introduction.",
        trainingModule: "Introductions"
      }
    ],
    appendLog: [
      {
        id: "quality_append_0001",
        actor: "ada@bamsignal.com",
        timestamp: "2026-06-15T11:00:00.000Z",
        action: "review-completed",
        note: "Quality review completed."
      }
    ]
  }
];
