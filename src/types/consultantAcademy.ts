import type {
  AcademyModuleId,
  AcademyTrackId,
  CertificationLevelId,
  ModuleProgressStatusId,
  PromotionReadinessId
} from "../constants/consultantAcademy";

export type AcademyModuleProgress = {
  moduleId: AcademyModuleId;
  status: ModuleProgressStatusId;
  completedAt: string | null;
  hoursSpent: number;
};

export type AcademyAssessmentRecord = {
  id: string;
  moduleId: AcademyModuleId;
  score: number;
  takenAt: string;
  passed: boolean;
};

export type AcademyTimelineEntry = {
  id: string;
  label: string;
  timestamp: string;
  note: string;
};

export type ConsultantAcademyRecord = {
  id: string;
  consultantRef: string;
  consultantName: string;
  trackId: AcademyTrackId;
  certificationLevel: CertificationLevelId;
  promotionReadiness: PromotionReadinessId;
  moduleProgress: AcademyModuleProgress[];
  assessments: AcademyAssessmentRecord[];
  timeline: AcademyTimelineEntry[];
};

export type AcademyFilterState = {
  query: string;
  trackId: AcademyTrackId | "all";
  certificationLevel: CertificationLevelId | "all";
};

export type AcademyMetric = {
  id: import("../constants/consultantAcademy").AcademyMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type AcademyTrackSummary = {
  trackId: AcademyTrackId;
  hint: string;
  consultantCount: number;
};

export type ConsultantAcademyBundle = {
  generatedAt: string;
  metrics: AcademyMetric[];
  tracks: AcademyTrackSummary[];
  consultants: ConsultantAcademyRecord[];
  selectedConsultant: ConsultantAcademyRecord | null;
};
