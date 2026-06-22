import type {
  SafetyCategoryId,
  SafetyMetricId,
  SafetySeverityId,
  SafetyStatusId,
  SafetyWorkflowId
} from "../constants/safetyCenter";

export type SafetyTimelineEntry = {
  id: string;
  workflow: SafetyWorkflowId;
  actor: string;
  timestamp: string;
  note: string;
  fromStatus: SafetyStatusId | null;
  toStatus: SafetyStatusId | null;
};

export type SafetyIncidentRecord = {
  id: string;
  incidentRef: string;
  categoryId: SafetyCategoryId;
  severity: SafetySeverityId;
  status: SafetyStatusId;
  reportedAt: string;
  reportedBy: string;
  subjectRef: string;
  subjectLabel: string;
  investigator: string | null;
  summary: string;
  timeline: SafetyTimelineEntry[];
};

export type SafetyFilterState = {
  query: string;
  categoryId: SafetyCategoryId | "all";
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
  queue: SafetyIncidentRecord[];
  selectedIncident: SafetyIncidentRecord | null;
};
