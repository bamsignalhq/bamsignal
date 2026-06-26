import type {
  LaunchBlockerSeverityId,
  LaunchCommandHealthStatusId,
  LaunchCommandSectionId,
  LaunchGoNoGoId,
  LaunchReadinessScoreId
} from "../constants/launchCommandCenter";

export type LaunchCommandMetric = {
  id: string;
  label: string;
  value: string;
  status: LaunchCommandHealthStatusId;
  detail?: string;
};

export type LaunchCommandSectionSnapshot = {
  sectionId: LaunchCommandSectionId;
  status: LaunchCommandHealthStatusId;
  headline: string;
  metrics: LaunchCommandMetric[];
};

export type LaunchReadinessScore = {
  id: LaunchReadinessScoreId;
  label: string;
  score: number;
  status: LaunchCommandHealthStatusId;
};

export type LaunchCommandBlocker = {
  id: string;
  blockerRef: string;
  title: string;
  severity: LaunchBlockerSeverityId;
  domain: string;
  status: "open" | "mitigated";
  ownerEmail: string;
  openedAt: string;
};

export type LaunchCommandGoNoGo = {
  recommendation: LaunchGoNoGoId;
  reasoning: string[];
  capacityHeadroom: string;
  lastEvaluatedAt: string;
};

export type LaunchCommandServiceRecord = {
  id: string;
  name: string;
  critical: boolean;
  status: LaunchCommandHealthStatusId;
  latencyMs: number;
  uptimePercent: number;
  lastCheckedAt: string;
};

export type LaunchCommandIncidentRecord = {
  id: string;
  incidentRef: string;
  title: string;
  severity: LaunchCommandHealthStatusId;
  status: "active" | "acknowledged" | "resolved";
  openedAt: string;
  service: string;
};

export type LaunchCommandDeploymentRecord = {
  id: string;
  deployRef: string;
  environment: string;
  version: string;
  status: "live" | "rolling" | "failed";
  deployedAt: string;
  deployedBy: string;
};

export type LaunchCommandCenterBundle = {
  generatedAt: string;
  goNoGo: LaunchCommandGoNoGo;
  readinessScores: LaunchReadinessScore[];
  blockers: LaunchCommandBlocker[];
  sections: LaunchCommandSectionSnapshot[];
  criticalServices: LaunchCommandServiceRecord[];
  incidents: LaunchCommandIncidentRecord[];
  deployments: LaunchCommandDeploymentRecord[];
};
