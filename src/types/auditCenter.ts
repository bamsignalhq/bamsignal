import type {
  AuditActionId,
  AuditComplianceMetricId,
  AuditEntityId,
  AuditFilterFieldId,
  AuditResultId
} from "../constants/auditCenter";

export type AuditEventRecord = {
  id: string;
  actor: string;
  role: string;
  action: AuditActionId;
  entity: AuditEntityId;
  entityRef: string;
  timestamp: string;
  result: AuditResultId;
  ipPlaceholder: string;
  journeyId?: string;
  consultantId?: string;
  memberId?: string;
  detail: string;
};

export type AuditFilterState = {
  journeyId: string;
  consultant: string;
  member: string;
  date: string;
  action: AuditActionId | "all";
  entity: AuditEntityId | "all";
};

export type AuditComplianceMetric = {
  id: AuditComplianceMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type AuditActionSummary = {
  action: AuditActionId;
  label: string;
  count: number;
};

export type AuditComplianceBundle = {
  generatedAt: string;
  metrics: AuditComplianceMetric[];
  summaries: AuditActionSummary[];
  timeline: AuditEventRecord[];
  selectedEvent: AuditEventRecord | null;
  activeFilters: AuditFilterFieldId[];
};
