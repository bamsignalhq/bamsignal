import type {
  MonitoredServiceId,
  ServiceHealthStatusId
} from "../constants/systemHealth";

export type ServiceHealthMetrics = {
  uptimePercent: number;
  responseTimeMs: number;
  errorCount24h: number;
  lastFailureAt: string | null;
  recoveryTimeMinutes: number | null;
};

export type ServiceHealthRecord = {
  id: MonitoredServiceId;
  label: string;
  category: string;
  critical: boolean;
  status: ServiceHealthStatusId;
  metrics: ServiceHealthMetrics;
  note: string;
  checkedAt: string;
};

export type DependencyStatusRecord = {
  id: string;
  label: string;
  dependsOn: MonitoredServiceId[];
  status: ServiceHealthStatusId;
  impact: string;
};

export type HealthSummary = {
  overallStatus: ServiceHealthStatusId;
  healthyCount: number;
  degradedCount: number;
  offlineCount: number;
  maintenanceCount: number;
  criticalOfflineCount: number;
  lastCheckedAt: string;
};

export type HealthIncidentRecord = {
  id: string;
  timestamp: string;
  serviceId: MonitoredServiceId;
  severity: ServiceHealthStatusId;
  title: string;
  summary: string;
  resolvedAt: string | null;
  recoveryTimeMinutes: number | null;
};

export type SystemHealthBundle = {
  generatedAt: string;
  summary: HealthSummary;
  services: ServiceHealthRecord[];
  dependencies: DependencyStatusRecord[];
  incidents: HealthIncidentRecord[];
  liveProbe: boolean;
};
