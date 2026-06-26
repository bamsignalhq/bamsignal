import type {
  SecurityIncidentStatusId,
  SecurityOpsHealthStatusId,
  SecurityOpsModuleId,
  SecurityOpsScoreId,
  SecurityOpsToolId
} from "../constants/securityOperationsCenter";

export type SecurityOpsEvent = {
  id: string;
  eventRef: string;
  moduleId: SecurityOpsModuleId;
  severity: SecurityOpsHealthStatusId;
  title: string;
  actor: string;
  target: string;
  occurredAt: string;
  detail: string;
};

export type SecurityOpsScore = {
  id: SecurityOpsScoreId;
  label: string;
  score: number;
  status: SecurityOpsHealthStatusId;
};

export type SecurityOpsIncident = {
  id: string;
  incidentRef: string;
  title: string;
  status: SecurityIncidentStatusId;
  severity: SecurityOpsHealthStatusId;
  openedAt: string;
  resolvedAt?: string;
  ownerEmail: string;
  timeline: { at: string; actor: string; note: string }[];
};

export type SecurityOpsActionRecord = {
  id: string;
  toolId: SecurityOpsToolId;
  target: string;
  actor: string;
  executedAt: string;
  result: string;
};

export type SecurityOpsCenterSummary = {
  overallScore: number;
  openIncidents: number;
  events24h: number;
  criticalEvents: number;
  blockedAttempts: number;
};

export type SecurityOperationsCenterBundle = {
  generatedAt: string;
  summary: SecurityOpsCenterSummary;
  scores: SecurityOpsScore[];
  events: SecurityOpsEvent[];
  incidents: SecurityOpsIncident[];
  recentActions: SecurityOpsActionRecord[];
};
