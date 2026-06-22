import type { AcademyModuleId } from "../constants/consultantAcademy";
import type { AcademyModuleProgress, ConsultantAcademyRecord } from "../types/consultantAcademy";
import type { ModuleProgressStatusId } from "../constants/consultantAcademy";

function moduleProgress(
  moduleId: AcademyModuleId,
  status: ModuleProgressStatusId,
  hoursSpent: number,
  completedAt: string | null = null
): AcademyModuleProgress {
  return { moduleId, status, hoursSpent, completedAt };
}

export const CONSULTANT_ACADEMY_SEED: ConsultantAcademyRecord[] = [
  {
    id: "academy_001",
    consultantRef: "consultant_ada_okafor",
    consultantName: "Ada Okafor",
    trackId: "senior-matchmaker",
    certificationLevel: "senior",
    promotionReadiness: "ready",
    moduleProgress: [
      moduleProgress("mission-culture", "completed", 4, "2025-10-01T10:00:00.000Z"),
      moduleProgress("signal-concierge-process", "completed", 6, "2025-10-05T10:00:00.000Z"),
      moduleProgress("consultation-excellence", "completed", 8, "2025-10-12T10:00:00.000Z"),
      moduleProgress("compatibility-reviews", "completed", 6, "2025-10-18T10:00:00.000Z"),
      moduleProgress("introductions", "completed", 5, "2025-10-22T10:00:00.000Z"),
      moduleProgress("relationship-follow-up", "completed", 5, "2025-11-01T10:00:00.000Z"),
      moduleProgress("documentation-standards", "completed", 3, "2025-11-05T10:00:00.000Z"),
      moduleProgress("safety-escalations", "completed", 4, "2025-11-08T10:00:00.000Z"),
      moduleProgress("privacy-confidentiality", "completed", 4, "2025-11-10T10:00:00.000Z"),
      moduleProgress("operations-excellence", "completed", 5, "2025-11-15T10:00:00.000Z")
    ],
    assessments: [
      { id: "assess_001", moduleId: "consultation-excellence", score: 94, takenAt: "2025-10-14T10:00:00.000Z", passed: true },
      { id: "assess_002", moduleId: "compatibility-reviews", score: 91, takenAt: "2025-10-20T10:00:00.000Z", passed: true },
      { id: "assess_003", moduleId: "safety-escalations", score: 96, takenAt: "2025-11-09T10:00:00.000Z", passed: true }
    ],
    timeline: [
      { id: "academy_tl_001", label: "Enrolled", timestamp: "2025-09-28T09:00:00.000Z", note: "Enrolled in Senior Matchmaker track." },
      { id: "academy_tl_002", label: "Certified", timestamp: "2025-11-01T14:00:00.000Z", note: "Achieved Certified level." },
      { id: "academy_tl_003", label: "Advanced", timestamp: "2026-01-15T10:00:00.000Z", note: "Promoted to Advanced after assessment scores." },
      { id: "academy_tl_004", label: "Senior", timestamp: "2026-04-01T10:00:00.000Z", note: "Senior certification awarded." }
    ]
  },
  {
    id: "academy_002",
    consultantRef: "consultant_chidi_emeka",
    consultantName: "Chidi Emeka",
    trackId: "relationship-consultant",
    certificationLevel: "certified",
    promotionReadiness: "developing",
    moduleProgress: [
      moduleProgress("mission-culture", "completed", 4, "2026-02-01T10:00:00.000Z"),
      moduleProgress("signal-concierge-process", "completed", 6, "2026-02-08T10:00:00.000Z"),
      moduleProgress("consultation-excellence", "completed", 7, "2026-02-20T10:00:00.000Z"),
      moduleProgress("compatibility-reviews", "completed", 5, "2026-03-01T10:00:00.000Z"),
      moduleProgress("introductions", "completed", 5, "2026-03-10T10:00:00.000Z"),
      moduleProgress("relationship-follow-up", "in-progress", 2, null),
      moduleProgress("documentation-standards", "not-started", 0, null),
      moduleProgress("safety-escalations", "completed", 4, "2026-03-05T10:00:00.000Z"),
      moduleProgress("privacy-confidentiality", "in-progress", 1, null),
      moduleProgress("operations-excellence", "not-started", 0, null)
    ],
    assessments: [
      { id: "assess_004", moduleId: "consultation-excellence", score: 82, takenAt: "2026-02-22T10:00:00.000Z", passed: true },
      { id: "assess_005", moduleId: "introductions", score: 78, takenAt: "2026-03-12T10:00:00.000Z", passed: true }
    ],
    timeline: [
      { id: "academy_tl_001", label: "Enrolled", timestamp: "2026-01-25T09:00:00.000Z", note: "Enrolled in Relationship Consultant track." },
      { id: "academy_tl_002", label: "Certified", timestamp: "2026-03-15T10:00:00.000Z", note: "Core modules completed — Certified level." }
    ]
  },
  {
    id: "academy_003",
    consultantRef: "consultant_fatima_bello",
    consultantName: "Fatima Bello",
    trackId: "compatibility-specialist",
    certificationLevel: "advanced",
    promotionReadiness: "ready",
    moduleProgress: [
      moduleProgress("mission-culture", "completed", 4, "2025-08-01T10:00:00.000Z"),
      moduleProgress("signal-concierge-process", "completed", 6, "2025-08-10T10:00:00.000Z"),
      moduleProgress("consultation-excellence", "completed", 8, "2025-08-20T10:00:00.000Z"),
      moduleProgress("compatibility-reviews", "completed", 6, "2025-09-01T10:00:00.000Z"),
      moduleProgress("introductions", "completed", 5, "2025-09-10T10:00:00.000Z"),
      moduleProgress("relationship-follow-up", "completed", 5, "2025-09-20T10:00:00.000Z"),
      moduleProgress("documentation-standards", "completed", 3, "2025-09-25T10:00:00.000Z"),
      moduleProgress("safety-escalations", "completed", 4, "2025-10-01T10:00:00.000Z"),
      moduleProgress("privacy-confidentiality", "completed", 4, "2025-10-05T10:00:00.000Z"),
      moduleProgress("operations-excellence", "in-progress", 3, null)
    ],
    assessments: [
      { id: "assess_006", moduleId: "compatibility-reviews", score: 97, takenAt: "2025-09-05T10:00:00.000Z", passed: true },
      { id: "assess_007", moduleId: "privacy-confidentiality", score: 93, takenAt: "2025-10-06T10:00:00.000Z", passed: true }
    ],
    timeline: [
      { id: "academy_tl_001", label: "Enrolled", timestamp: "2025-07-20T09:00:00.000Z", note: "Compatibility Specialist track." },
      { id: "academy_tl_002", label: "Advanced", timestamp: "2026-02-01T10:00:00.000Z", note: "Advanced certification achieved." }
    ]
  },
  {
    id: "academy_004",
    consultantRef: "consultant_ngozi_adeyemi",
    consultantName: "Ngozi Adeyemi",
    trackId: "family-values-advisor",
    certificationLevel: "master-steward",
    promotionReadiness: "ready",
    moduleProgress: [
      moduleProgress("mission-culture", "completed", 4, "2024-06-01T10:00:00.000Z"),
      moduleProgress("signal-concierge-process", "completed", 6, "2024-06-15T10:00:00.000Z"),
      moduleProgress("consultation-excellence", "completed", 8, "2024-07-01T10:00:00.000Z"),
      moduleProgress("compatibility-reviews", "completed", 6, "2024-07-15T10:00:00.000Z"),
      moduleProgress("introductions", "completed", 5, "2024-08-01T10:00:00.000Z"),
      moduleProgress("relationship-follow-up", "completed", 5, "2024-08-15T10:00:00.000Z"),
      moduleProgress("documentation-standards", "completed", 3, "2024-09-01T10:00:00.000Z"),
      moduleProgress("safety-escalations", "completed", 4, "2024-09-10T10:00:00.000Z"),
      moduleProgress("privacy-confidentiality", "completed", 4, "2024-09-20T10:00:00.000Z"),
      moduleProgress("operations-excellence", "completed", 5, "2024-10-01T10:00:00.000Z")
    ],
    assessments: [
      { id: "assess_008", moduleId: "consultation-excellence", score: 99, takenAt: "2024-07-05T10:00:00.000Z", passed: true },
      { id: "assess_009", moduleId: "operations-excellence", score: 98, takenAt: "2024-10-05T10:00:00.000Z", passed: true }
    ],
    timeline: [
      { id: "academy_tl_001", label: "Enrolled", timestamp: "2024-05-01T09:00:00.000Z", note: "Family Values Advisor track — founding cohort." },
      { id: "academy_tl_002", label: "Master Steward", timestamp: "2025-06-01T10:00:00.000Z", note: "Master Steward certification — institutional mentor." }
    ]
  },
  {
    id: "academy_005",
    consultantRef: "consultant_tunde_obi",
    consultantName: "Tunde Obi",
    trackId: "diaspora-consultant",
    certificationLevel: "trainee",
    promotionReadiness: "not-ready",
    moduleProgress: [
      moduleProgress("mission-culture", "completed", 3, "2026-06-01T10:00:00.000Z"),
      moduleProgress("signal-concierge-process", "in-progress", 2, null),
      moduleProgress("consultation-excellence", "not-started", 0, null),
      moduleProgress("compatibility-reviews", "not-started", 0, null),
      moduleProgress("introductions", "not-started", 0, null),
      moduleProgress("relationship-follow-up", "not-started", 0, null),
      moduleProgress("documentation-standards", "not-started", 0, null),
      moduleProgress("safety-escalations", "not-started", 0, null),
      moduleProgress("privacy-confidentiality", "not-started", 0, null),
      moduleProgress("operations-excellence", "not-started", 0, null)
    ],
    assessments: [],
    timeline: [
      { id: "academy_tl_001", label: "Enrolled", timestamp: "2026-05-28T09:00:00.000Z", note: "New hire — Diaspora Consultant track." }
    ]
  },
  {
    id: "academy_006",
    consultantRef: "consultant_amara_di",
    consultantName: "Amara Di",
    trackId: "operations-coordinator",
    certificationLevel: "certified",
    promotionReadiness: "developing",
    moduleProgress: [
      moduleProgress("mission-culture", "completed", 4, "2026-01-10T10:00:00.000Z"),
      moduleProgress("signal-concierge-process", "completed", 6, "2026-01-20T10:00:00.000Z"),
      moduleProgress("consultation-excellence", "completed", 6, "2026-02-01T10:00:00.000Z"),
      moduleProgress("compatibility-reviews", "in-progress", 3, null),
      moduleProgress("introductions", "not-started", 0, null),
      moduleProgress("relationship-follow-up", "not-started", 0, null),
      moduleProgress("documentation-standards", "completed", 3, "2026-02-10T10:00:00.000Z"),
      moduleProgress("safety-escalations", "completed", 4, "2026-02-15T10:00:00.000Z"),
      moduleProgress("privacy-confidentiality", "completed", 4, "2026-02-20T10:00:00.000Z"),
      moduleProgress("operations-excellence", "completed", 5, "2026-03-01T10:00:00.000Z")
    ],
    assessments: [
      { id: "assess_010", moduleId: "operations-excellence", score: 88, takenAt: "2026-03-05T10:00:00.000Z", passed: true },
      { id: "assess_011", moduleId: "safety-escalations", score: 85, takenAt: "2026-02-18T10:00:00.000Z", passed: true }
    ],
    timeline: [
      { id: "academy_tl_001", label: "Enrolled", timestamp: "2026-01-05T09:00:00.000Z", note: "Operations Coordinator track." },
      { id: "academy_tl_002", label: "Certified", timestamp: "2026-03-10T10:00:00.000Z", note: "Operations modules certified." }
    ]
  }
];
