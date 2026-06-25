import type {
  CoachingSessionRecord,
  ConsultantCertificationRecord,
  ImprovementPlanRecord,
  QualityAreaRating,
  QualityReviewRecord,
  QualityTrendPoint
} from "../types/consultantQuality";
import type { QualityRatingId, QualityStandardId } from "../constants/consultantQuality";

function area(
  areaId: QualityStandardId,
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
    reviewType: "manager-review",
    reviewedAt: "2026-06-20T14:00:00.000Z",
    journeyRef: "BS-JR-2026-0042",
    overallScore: 91,
    summary: "Strong consultation and introduction workflow. Documentation meets institutional standards.",
    areaRatings: [
      area("communication", "excellent", "Thorough intake and values alignment."),
      area("documentation-quality", "strong", "Notes complete with action items."),
      area("relationship-guidance", "excellent", "Recommendations well-reasoned and documented."),
      area("journey-stewardship", "strong", "Introduction advanced with proper consent flow."),
      area("follow-up-quality", "good", "Follow-up timely; one missed check-in noted."),
      area("documentation-quality", "excellent", "Journey documentation complete."),
      area("member-satisfaction", "excellent", "Member feedback positive."),
      area("professionalism", "excellent", "Professional throughout.")
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
    reviewType: "peer-review",
    reviewedAt: "2026-06-21T10:00:00.000Z",
    journeyRef: "BS-JR-2026-0038",
    overallScore: 68,
    summary: "Good consultation foundation. Meeting notes and documentation need improvement.",
    areaRatings: [
      area("communication", "good", "Solid consultation structure."),
      area("documentation-quality", "needs-improvement", "Notes sparse — missing compatibility summary."),
      area("relationship-guidance", "good", "Recommendations present but brief."),
      area("journey-stewardship", "good", "Introduction process followed."),
      area("follow-up-quality", "good", "Follow-up completed on schedule."),
      area("documentation-quality", "needs-improvement", "Journey notes incomplete in two fields."),
      area("member-satisfaction", "strong", "Member satisfied with consultant rapport."),
      area("professionalism", "excellent", "No conduct concerns.")
    ],
    improvementPlan: [
      {
        areaId: "documentation-quality",
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
    reviewType: "manager-review",
    reviewedAt: "2026-06-19T16:00:00.000Z",
    journeyRef: "BS-JR-2026-0040",
    overallScore: 88,
    summary: "Excellent compatibility review and introduction quality.",
    areaRatings: [
      area("communication", "strong", "Strong consultation delivery."),
      area("documentation-quality", "excellent", "Detailed meeting notes with compatibility matrix."),
      area("relationship-guidance", "excellent", "Clear, actionable recommendations."),
      area("journey-stewardship", "excellent", "Introduction handled with care and consent."),
      area("follow-up-quality", "strong", "Consistent follow-up cadence."),
      area("documentation-quality", "strong", "Documentation thorough."),
      area("member-satisfaction", "excellent", "High member satisfaction scores."),
      area("professionalism", "excellent", "Exemplary professional conduct.")
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
    reviewType: "executive-review",
    reviewedAt: "2026-06-22T09:00:00.000Z",
    journeyRef: "BS-JR-2026-0045",
    overallScore: 52,
    summary: "New consultant — multiple areas require review and academy training.",
    areaRatings: [
      area("communication", "needs-improvement", "Consultation structure inconsistent."),
      area("documentation-quality", "requires-review", "Meeting notes not submitted for last session."),
      area("relationship-guidance", "needs-improvement", "Recommendations lack supporting rationale."),
      area("journey-stewardship", "good", "Introduction basics followed."),
      area("follow-up-quality", "requires-review", "Follow-up overdue by 5 days."),
      area("documentation-quality", "needs-improvement", "Documentation gaps in journey record."),
      area("member-satisfaction", "good", "Member rapport positive despite process gaps."),
      area("professionalism", "strong", "Professional demeanor maintained.")
    ],
    improvementPlan: [
      {
        areaId: "communication",
        recommendation: "Complete Consultation Excellence academy module.",
        trainingModule: "Consultation Excellence"
      },
      {
        areaId: "documentation-quality",
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
    reviewType: "self-review",
    reviewedAt: "2026-06-15T11:00:00.000Z",
    journeyRef: "BS-JR-2026-0035",
    overallScore: 79,
    summary: "Solid operations coordination quality with room for introduction refinement.",
    areaRatings: [
      area("communication", "good", "Consultation adequate for operations role."),
      area("documentation-quality", "strong", "Operations notes well-maintained."),
      area("relationship-guidance", "good", "Recommendations appropriate to role."),
      area("journey-stewardship", "needs-improvement", "Introduction consent step missed once."),
      area("follow-up-quality", "strong", "Follow-up consistent."),
      area("documentation-quality", "excellent", "Operations documentation exemplary."),
      area("member-satisfaction", "strong", "Members report good coordination."),
      area("professionalism", "excellent", "Professional conduct throughout.")
    ],
    improvementPlan: [
      {
        areaId: "journey-stewardship",
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

export const CONSULTANT_CERTIFICATION_SEED: ConsultantCertificationRecord[] = [
  {
    id: "cert_001",
    consultantRef: "consultant_ada_okafor",
    consultantName: "Ada Okafor",
    certificationLevel: "master-consultant",
    status: "active",
    issuedAt: "2025-12-01T10:00:00.000Z",
    expiresAt: "2027-12-01T10:00:00.000Z",
    issuedBy: "ngozi@bamsignal.com",
    notes: "Exemplary standards across all review areas."
  },
  {
    id: "cert_002",
    consultantRef: "consultant_fatima_bello",
    consultantName: "Fatima Bello",
    certificationLevel: "senior-certified",
    status: "active",
    issuedAt: "2026-01-15T10:00:00.000Z",
    expiresAt: "2028-01-15T10:00:00.000Z",
    issuedBy: "ada@bamsignal.com"
  },
  {
    id: "cert_003",
    consultantRef: "consultant_chidi_emeka",
    consultantName: "Chidi Emeka",
    certificationLevel: "certified",
    status: "active",
    issuedAt: "2026-03-01T10:00:00.000Z",
    expiresAt: "2027-03-01T10:00:00.000Z",
    issuedBy: "ngozi@bamsignal.com"
  },
  {
    id: "cert_004",
    consultantRef: "consultant_tunde_obi",
    consultantName: "Tunde Obi",
    certificationLevel: "certified",
    status: "suspended",
    issuedAt: "2026-02-01T10:00:00.000Z",
    issuedBy: "fatima@bamsignal.com",
    notes: "Suspended pending improvement plan completion."
  },
  {
    id: "cert_005",
    consultantRef: "consultant_amara_di",
    consultantName: "Amara Di",
    certificationLevel: "legacy-consultant",
    status: "active",
    issuedAt: "2024-06-01T10:00:00.000Z",
    issuedBy: "ops@bamsignal.com",
    notes: "Grandfathered certification from pre-institutional standards."
  }
];

export const IMPROVEMENT_PLAN_SEED: ImprovementPlanRecord[] = [
  {
    id: "plan_001",
    planRef: "IP-2026-0012",
    consultantRef: "consultant_chidi_emeka",
    consultantName: "Chidi Emeka",
    reviewRef: "QA-2026-0042",
    status: "active",
    followUpReviewAt: "2026-07-15T10:00:00.000Z",
    createdAt: "2026-06-21T10:30:00.000Z",
    actions: [
      {
        id: "action_001",
        standardId: "documentation-quality",
        action: "Use consultation note template for every session.",
        deadline: "2026-07-01T00:00:00.000Z",
        status: "in-progress",
        trainingModule: "Consultation Excellence"
      },
      {
        id: "action_002",
        standardId: "documentation-quality",
        action: "Complete all required journey documentation fields before close.",
        deadline: "2026-07-08T00:00:00.000Z",
        status: "pending",
        trainingModule: "Documentation Standards",
        followUpReviewAt: "2026-07-15T10:00:00.000Z"
      }
    ]
  },
  {
    id: "plan_002",
    planRef: "IP-2026-0013",
    consultantRef: "consultant_tunde_obi",
    consultantName: "Tunde Obi",
    reviewRef: "QA-2026-0044",
    status: "active",
    followUpReviewAt: "2026-07-22T09:00:00.000Z",
    createdAt: "2026-06-22T09:30:00.000Z",
    actions: [
      {
        id: "action_003",
        standardId: "communication",
        action: "Complete Consultation Excellence academy module.",
        deadline: "2026-07-05T00:00:00.000Z",
        status: "pending",
        trainingModule: "Consultation Excellence"
      },
      {
        id: "action_004",
        standardId: "follow-up-quality",
        action: "Use follow-up checklist for every active introduction.",
        deadline: "2026-07-12T00:00:00.000Z",
        status: "pending",
        trainingModule: "Relationship Follow-Up"
      }
    ]
  },
  {
    id: "plan_003",
    planRef: "IP-2026-0008",
    consultantRef: "consultant_ada_okafor",
    consultantName: "Ada Okafor",
    reviewRef: "QA-2026-0041",
    status: "completed",
    followUpReviewAt: "2026-06-28T14:00:00.000Z",
    completedAt: "2026-06-28T15:00:00.000Z",
    createdAt: "2026-06-20T14:30:00.000Z",
    actions: [
      {
        id: "action_005",
        standardId: "follow-up-quality",
        action: "Schedule follow-up reminders 48h after introduction.",
        deadline: "2026-06-27T00:00:00.000Z",
        status: "completed",
        trainingModule: "Relationship Follow-Up"
      }
    ]
  }
];

export const COACHING_SESSION_SEED: CoachingSessionRecord[] = [
  {
    id: "coach_001",
    sessionRef: "CS-2026-0041",
    consultantRef: "consultant_chidi_emeka",
    consultantName: "Chidi Emeka",
    coachEmail: "ada@bamsignal.com",
    topic: "Documentation standards workshop",
    status: "scheduled",
    scheduledAt: "2026-06-28T14:00:00.000Z"
  },
  {
    id: "coach_002",
    sessionRef: "CS-2026-0038",
    consultantRef: "consultant_tunde_obi",
    consultantName: "Tunde Obi",
    coachEmail: "fatima@bamsignal.com",
    topic: "Consultation structure coaching",
    status: "scheduled",
    scheduledAt: "2026-06-26T11:00:00.000Z"
  },
  {
    id: "coach_003",
    sessionRef: "CS-2026-0035",
    consultantRef: "consultant_amara_di",
    consultantName: "Amara Di",
    coachEmail: "ngozi@bamsignal.com",
    topic: "Introduction consent checklist review",
    status: "completed",
    scheduledAt: "2026-06-18T10:00:00.000Z",
    completedAt: "2026-06-18T11:00:00.000Z",
    notes: "Consultant acknowledged consent step gap and committed to checklist use."
  }
];

export const QUALITY_TREND_SEED: QualityTrendPoint[] = [
  { month: "2026-02", averageScore: 74, reviewCount: 3 },
  { month: "2026-03", averageScore: 78, reviewCount: 4 },
  { month: "2026-04", averageScore: 81, reviewCount: 5 },
  { month: "2026-05", averageScore: 79, reviewCount: 4 },
  { month: "2026-06", averageScore: 76, reviewCount: 5 }
];
