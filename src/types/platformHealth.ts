import type {
  PlatformHealthAlertChannelId,
  PlatformHealthServiceId,
  PlatformHealthStatusId
} from "../constants/platformHealth";

export type PlatformHealthServiceRecord = {
  id: PlatformHealthServiceId;
  label: string;
  critical: boolean;
  status: PlatformHealthStatusId;
  responseTimeMs: number;
  lastSuccessAt: string;
  lastFailureAt: string | null;
  failureCount24h: number;
  recoveryAttempts: number;
  checkedAt: string;
  note?: string;
};

export type PlatformHealthSummary = {
  overallStatus: PlatformHealthStatusId;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  criticalOfflineCount: number;
  lastCheckedAt: string;
};

export type PlatformHealthIncidentRecord = {
  id: string;
  incidentRef: string;
  serviceId: PlatformHealthServiceId;
  severity: PlatformHealthStatusId;
  status: "active" | "acknowledged" | "resolved";
  title: string;
  summary: string;
  openedAt: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  timeline: { at: string; actor: string; note: string }[];
};

export type PlatformHealthAlertRule = {
  id: string;
  serviceId: PlatformHealthServiceId;
  thresholdMs: number;
  failureThreshold: number;
  escalationLevel: number;
  channels: PlatformHealthAlertChannelId[];
  enabled: boolean;
};

export type PlatformHealthCenterBundle = {
  generatedAt: string;
  liveProbe: boolean;
  summary: PlatformHealthSummary;
  services: PlatformHealthServiceRecord[];
  activeIncidents: PlatformHealthIncidentRecord[];
  resolvedIncidents: PlatformHealthIncidentRecord[];
  alerts: PlatformHealthAlertRule[];
};
