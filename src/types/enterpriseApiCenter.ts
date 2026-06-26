import type {
  EnterpriseApiAuthTypeId,
  EnterpriseApiEndpointStatusId,
  EnterpriseApiToolId
} from "../constants/enterpriseApiCenter";

export type EnterpriseApiEndpoint = {
  id: string;
  endpointRef: string;
  path: string;
  method: string;
  status: EnterpriseApiEndpointStatusId;
  latencyMs: number;
  requestsPerMin: number;
  errorCount: number;
  errorRate: number;
  rateLimitPerMin: number;
  authentication: EnterpriseApiAuthTypeId;
  payloadSizeKb: number;
  updatedAt: string;
};

export type EnterpriseApiFailedJob = {
  id: string;
  jobRef: string;
  endpointPath: string;
  method: string;
  failureReason: string;
  attempts: number;
  failedAt: string;
  status: "pending" | "retried" | "resolved";
};

export type EnterpriseApiToolRun = {
  id: string;
  toolId: EnterpriseApiToolId;
  status: "completed" | "running" | "failed";
  summary: string;
  target?: string;
  ranAt: string;
  actor: string;
};

export type EnterpriseApiCenterSummary = {
  operationsScore: number;
  healthStatus: EnterpriseApiEndpointStatusId | "healthy";
  endpointCount: number;
  healthyCount: number;
  degradedCount: number;
  disabledCount: number;
  maintenanceCount: number;
  totalRequestsPerMin: number;
  avgLatencyMs: number;
  errorRatePercent: number;
  failedJobsCount: number;
};

export type EnterpriseApiCenterBundle = {
  generatedAt: string;
  summary: EnterpriseApiCenterSummary;
  endpoints: EnterpriseApiEndpoint[];
  failedJobs: EnterpriseApiFailedJob[];
  toolRuns: EnterpriseApiToolRun[];
};
