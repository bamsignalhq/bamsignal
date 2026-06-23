import type {
  AuditActionId,
  AuditResultId,
  AuditSeverityId,
  AuditTargetKindId,
  InstitutionalComplianceFilterFieldId,
  InstitutionalComplianceMetricId
} from "../constants/institutionalAuditCompliance";

export type AuditActor = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuditTarget = {
  id: string;
  kind: AuditTargetKindId;
  label: string;
  ref?: string;
};

export type AuditAction = {
  id: AuditActionId;
  label: string;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: AuditActor;
  action: AuditActionId;
  target: AuditTarget;
  severity: AuditSeverityId;
  result: AuditResultId;
  summary: string;
  detail?: string;
  ipAddress?: string;
  journeyId?: string;
  memberId?: string;
  consultantId?: string;
};

export type InstitutionalComplianceFilters = {
  date: string;
  actor: string;
  action: AuditActionId | "all";
  target: string;
  severity: AuditSeverityId | "all";
};

export type InstitutionalComplianceMetric = {
  id: InstitutionalComplianceMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type InstitutionalAuditBundle = {
  generatedAt: string;
  metrics: InstitutionalComplianceMetric[];
  timeline: AuditEvent[];
  selectedEvent: AuditEvent | null;
  activeFilters: InstitutionalComplianceFilterFieldId[];
};
