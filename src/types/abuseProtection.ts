import type {
  AbuseMonitorId,
  AbuseRateLimitDimensionId,
  AbuseReportPeriodId,
  AbuseRiskLevelId
} from "../constants/abuseProtection";

export type AbuseMonitorRecord = {
  id: AbuseMonitorId;
  label: string;
  critical: boolean;
  eventCount24h: number;
  blockedCount24h: number;
  trend: "up" | "down" | "flat";
  riskLevel: AbuseRiskLevelId;
  lastEventAt: string;
};

export type AbuseRateLimitRule = {
  id: string;
  dimension: AbuseRateLimitDimensionId;
  endpoint: string;
  limitPerWindow: number;
  windowMinutes: number;
  currentUsage: number;
  blockedToday: number;
  enabled: boolean;
};

export type AbuseBlockRecord = {
  id: string;
  target: string;
  targetType: AbuseRateLimitDimensionId;
  blockType: "temporary" | "permanent";
  reason: string;
  monitorId: AbuseMonitorId;
  blockedAt: string;
  expiresAt: string | null;
  country?: string;
};

export type AbuseSuspiciousActivity = {
  id: string;
  monitorId: AbuseMonitorId;
  summary: string;
  riskLevel: AbuseRiskLevelId;
  ip: string;
  country: string;
  detectedAt: string;
  status: "open" | "reviewing" | "resolved";
};

export type AbuseCountryStat = {
  country: string;
  countryCode: string;
  blockedCount: number;
  suspiciousCount: number;
};

export type AbuseOffendingIp = {
  ip: string;
  country: string;
  blockedRequests: number;
  riskScore: number;
  monitors: AbuseMonitorId[];
};

export type AbuseForensicsRecord = {
  id: string;
  target: string;
  riskScore: number;
  riskLevel: AbuseRiskLevelId;
  linkedAccounts: string[];
  devices: string[];
  sessions: string[];
  timeline: { at: string; action: string; detail: string }[];
};

export type AbuseReportSnapshot = {
  period: AbuseReportPeriodId;
  generatedAt: string;
  totalBlocked: number;
  totalSuspicious: number;
  topMonitor: AbuseMonitorId;
  exportReady: boolean;
};

export type AbuseProtectionSummary = {
  blockedRequests24h: number;
  temporaryBans: number;
  permanentBans: number;
  suspiciousOpen: number;
  overallRisk: AbuseRiskLevelId;
  lastCheckedAt: string;
};

export type AbuseProtectionCenterBundle = {
  generatedAt: string;
  summary: AbuseProtectionSummary;
  monitors: AbuseMonitorRecord[];
  rateLimits: AbuseRateLimitRule[];
  blocks: AbuseBlockRecord[];
  suspicious: AbuseSuspiciousActivity[];
  countryStats: AbuseCountryStat[];
  topIps: AbuseOffendingIp[];
  forensics: AbuseForensicsRecord[];
  reports: AbuseReportSnapshot[];
};
