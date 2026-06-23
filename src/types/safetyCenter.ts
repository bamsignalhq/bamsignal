import type {
  SafetyActionId,
  SafetyCaseTypeId,
  SafetyMetricId,
  SafetySeverityId,
  SafetyStatusId,
  SafetyWorkflowId
} from "../constants/safetyCenter";

/** @deprecated Use SafetyCaseTypeId */
export type SafetyCategoryId = SafetyCaseTypeId;

export type SafetyTimelineEntry = {
  id: string;
  workflow: SafetyWorkflowId;
  actor: string;
  timestamp: string;
  note: string;
  fromStatus: SafetyStatusId | null;
  toStatus: SafetyStatusId | null;
  actionId?: SafetyActionId;
};

export type SafetyCaseRecord = {
  id: string;
  caseRef: string;
  /** @deprecated Use caseRef */
  incidentRef?: string;
  caseTypeId: SafetyCaseTypeId;
  /** @deprecated Use caseTypeId */
  categoryId?: SafetyCaseTypeId;
  severity: SafetySeverityId;
  status: SafetyStatusId;
  reportedAt: string;
  reportedBy: string;
  subjectRef: string;
  subjectLabel: string;
  investigator: string | null;
  summary: string;
  actionsTaken: SafetyActionId[];
  timeline: SafetyTimelineEntry[];
};

/** @deprecated Use SafetyCaseRecord */
export type SafetyIncidentRecord = SafetyCaseRecord;

export type SafetyRiskAssessment = {
  score: number;
  label: string;
  factors: string[];
};

export type SafetyFilterState = {
  query: string;
  caseTypeId: SafetyCaseTypeId | "all";
  /** @deprecated Use caseTypeId */
  categoryId?: SafetyCaseTypeId | "all";
  severity: SafetySeverityId | "all";
  status: SafetyStatusId | "all";
};

export type SafetyMetric = {
  id: SafetyMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type SafetyCenterBundle = {
  generatedAt: string;
  metrics: SafetyMetric[];
  queue: SafetyCaseRecord[];
  escalations: SafetyCaseRecord[];
  selectedCase: SafetyCaseRecord | null;
  /** @deprecated Use selectedCase */
  selectedIncident?: SafetyCaseRecord | null;
};
