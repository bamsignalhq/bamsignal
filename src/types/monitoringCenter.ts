import type {
  MonitoringAlertSeverityId,
  MonitoringIncidentSeverityId,
  MonitoringIncidentStatusId,
  MonitoringMetricId,
  MonitoringSectionId,
  MonitoringServiceStatusId,
  MonitoredPlatformServiceId
} from "../constants/monitoringCenter";

export type ServiceHealthRecord = {
  id: MonitoredPlatformServiceId;
  label: string;
  sectionId: MonitoringSectionId;
  critical: boolean;
  status: MonitoringServiceStatusId;
  availability: number;
  latencyMs: number;
  errorRate: number;
  throughput?: number;
  queueSize?: number;
  retries?: number;
  checkedAt: string;
  note?: string;
};

export type InfrastructureMetrics = {
  databaseConnections: number;
  storageUsageGb: number;
  memoryUsagePercent: number;
  cpuUsagePercent: number;
  apiResponseTimeMs: number;
  capturedAt: string;
};

export type MonitoringIncidentRecord = {
  id: string;
  incidentRef: string;
  severity: MonitoringIncidentSeverityId;
  status: MonitoringIncidentStatusId;
  title: string;
  affectedServices: MonitoredPlatformServiceId[];
  rootCause?: string;
  mitigation?: string;
  resolution?: string;
  postmortem?: string;
  ownerEmail: string;
  timeline: { at: string; actor: string; note: string }[];
  openedAt: string;
  resolvedAt?: string;
};

export type MonitoringAlertRecord = {
  id: string;
  alertRef: string;
  severity: MonitoringAlertSeverityId;
  serviceId: MonitoredPlatformServiceId;
  message: string;
  status: "open" | "acknowledged" | "resolved";
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  escalationLevel: number;
  createdAt: string;
};

export type MaintenanceWindowRecord = {
  id: string;
  windowRef: string;
  title: string;
  affectedServices: MonitoredPlatformServiceId[];
  startsAt: string;
  endsAt: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  notes?: string;
};

export type MonitoringMetricSnapshot = {
  id: string;
  metricKey: MonitoringMetricId;
  value: number;
  unit?: string;
  serviceId?: MonitoredPlatformServiceId;
  snapshotAt: string;
};

export type MonitoringSummary = {
  overallStatus: MonitoringServiceStatusId;
  healthyCount: number;
  degradedCount: number;
  outageCount: number;
  openIncidents: number;
  openAlerts: number;
  activeMaintenance: number;
};

export type MonitoringCenterBundle = {
  generatedAt: string;
  summary: MonitoringSummary;
  services: ServiceHealthRecord[];
  infrastructure: InfrastructureMetrics;
  incidents: MonitoringIncidentRecord[];
  alerts: MonitoringAlertRecord[];
  maintenance: MaintenanceWindowRecord[];
  metrics: MonitoringMetricSnapshot[];
};
