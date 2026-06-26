import type {
  ObservabilityDeploymentEnvironmentId,
  ObservabilityErrorActionId,
  ObservabilityQueueId,
  ObservabilityServiceId,
  ObservabilityServiceStatusId,
  ObservabilitySummaryMetricId
} from "../constants/productionObservability";

export type ObservabilityServiceRecord = {
  id: ObservabilityServiceId;
  label: string;
  critical: boolean;
  status: ObservabilityServiceStatusId;
  responseTimeMs: number;
  checkedAt: string;
  note?: string;
  future?: boolean;
};

export type ObservabilitySummaryCard = {
  id: ObservabilitySummaryMetricId;
  label: string;
  value: string;
  status: ObservabilityServiceStatusId;
  detail?: string;
};

export type ObservabilityEndpointMetric = {
  id: string;
  path: string;
  method: string;
  avgResponseMs: number;
  p95ResponseMs: number;
  failureCount: number;
  timeoutCount: number;
  checkedAt: string;
};

export type ObservabilityQueueRecord = {
  id: ObservabilityQueueId;
  label: string;
  status: ObservabilityServiceStatusId;
  depth: number;
  processingRate: number;
  failedCount: number;
  oldestAgeMinutes: number;
  checkedAt: string;
};

export type ObservabilityErrorRecord = {
  id: string;
  errorRef: string;
  event: string;
  message: string;
  stackTrace: string;
  affectedMembers: string[];
  frequency: number;
  firstSeenAt: string;
  lastSeenAt: string;
  triageStatus: "open" | "resolved" | "ignored" | "assigned";
  assignedTo?: string;
  serviceId?: ObservabilityServiceId;
};

export type ObservabilityDeploymentRecord = {
  id: string;
  deploymentRef: string;
  commit: string;
  deployedAt: string;
  engineer: string;
  environment: ObservabilityDeploymentEnvironmentId;
  health: ObservabilityServiceStatusId;
  rollbackAvailable: boolean;
  buildVersion?: string;
};

export type ObservabilityPerformanceSnapshot = {
  memoryUsagePercent: number;
  cpuUsagePercent: number;
  databaseConnections: number;
  networkMbps: number;
  buildVersion: string;
  environment: string;
  capturedAt: string;
};

export type ObservabilityDatabaseHealth = {
  status: ObservabilityServiceStatusId;
  connectionCount: number;
  maxConnections: number;
  activeQueries: number;
  slowQueries24h: number;
  replicationLagMs: number | null;
  checkedAt: string;
};

export type ProductionObservabilityBundle = {
  generatedAt: string;
  liveProbe: boolean;
  summaryCards: ObservabilitySummaryCard[];
  services: ObservabilityServiceRecord[];
  endpoints: ObservabilityEndpointMetric[];
  queues: ObservabilityQueueRecord[];
  errors: ObservabilityErrorRecord[];
  deployments: ObservabilityDeploymentRecord[];
  performance: ObservabilityPerformanceSnapshot;
  database: ObservabilityDatabaseHealth;
};

export type ObservabilityErrorTriageInput = {
  errorId: string;
  action: ObservabilityErrorActionId;
  actor: string;
  assignee?: string;
};
