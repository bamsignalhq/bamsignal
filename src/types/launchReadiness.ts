import type { LaunchReadinessAreaId, LaunchReadinessStatusId } from "../constants/launchReadiness";

export type LaunchReadinessMetric = {
  id: string;
  label: string;
  value: string | number;
};

export type LaunchReadinessCategory = {
  id: LaunchReadinessAreaId;
  label: string;
  status: LaunchReadinessStatusId;
  summary: string;
  completionPercent: number;
  issueCount: number;
  auditPath: string | null;
};

export type LaunchCriticalIssue = {
  id: string;
  areaId: LaunchReadinessAreaId;
  title: string;
  summary: string;
  status: LaunchReadinessStatusId;
};

export type LaunchChecklistItem = {
  id: string;
  label: string;
  areaId: LaunchReadinessAreaId;
  complete: boolean;
  status: LaunchReadinessStatusId;
};

export type ReadinessTimelineEntry = {
  id: string;
  at: string;
  label: string;
  areaId: LaunchReadinessAreaId;
  status: LaunchReadinessStatusId;
  note: string | null;
};

export type LaunchReadinessReport = {
  generatedAt: string;
  overallStatus: LaunchReadinessStatusId;
  metrics: LaunchReadinessMetric[];
  categories: LaunchReadinessCategory[];
  criticalIssues: LaunchCriticalIssue[];
  checklist: LaunchChecklistItem[];
  timeline: ReadinessTimelineEntry[];
};
