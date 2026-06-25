import type {
  LaunchApprovalStatusId,
  LaunchChecklistStatusId,
  LaunchControlSectionId,
  LaunchReadinessDomainId,
  LaunchRiskSeverityId
} from "../constants/launchControlCenter";

export type LaunchReadinessItem = {
  id: string;
  readinessRef: string;
  domainId: LaunchReadinessDomainId;
  status: LaunchChecklistStatusId;
  score: number;
  ownerEmail: string;
  lastReviewedAt: string;
  notes?: string;
};

export type LaunchChecklistEntry = {
  id: string;
  checklistRef: string;
  systemName: string;
  domainId: LaunchReadinessDomainId;
  status: LaunchChecklistStatusId;
  ownerEmail: string;
  updatedAt: string;
};

export type LaunchBlockerRecord = {
  id: string;
  blockerRef: string;
  title: string;
  severity: LaunchRiskSeverityId;
  domainId: LaunchReadinessDomainId;
  status: "open" | "resolved";
  ownerEmail: string;
  openedAt: string;
  resolvedAt?: string;
};

export type LaunchRiskRecord = {
  id: string;
  riskRef: string;
  title: string;
  severity: LaunchRiskSeverityId;
  domainId: LaunchReadinessDomainId;
  status: "open" | "resolved";
  mitigation?: string;
  ownerEmail: string;
  openedAt: string;
  resolvedAt?: string;
};

export type LaunchDependencyRecord = {
  id: string;
  dependencyRef: string;
  name: string;
  upstream: string;
  downstream: string;
  critical: boolean;
  status: LaunchChecklistStatusId;
};

export type LaunchTimelineEvent = {
  id: string;
  eventRef: string;
  title: string;
  phase: string;
  scheduledAt: string;
  completedAt?: string;
  ownerEmail: string;
  status: "scheduled" | "completed" | "delayed";
};

export type LaunchApprovalRecord = {
  id: string;
  role: "executive" | "founder";
  status: LaunchApprovalStatusId;
  signedBy?: string;
  signedAt?: string;
  notes?: string;
};

export type LaunchControlSummary = {
  overallReadinessPercent: number;
  readyCount: number;
  needsAttentionCount: number;
  blockedCount: number;
  notStartedCount: number;
  openBlockers: number;
  openRisks: number;
  criticalIssues: number;
  executiveApproved: boolean;
  founderApproved: boolean;
  goNoGoRecommendation: "go" | "no-go" | "conditional";
};

export type LaunchControlCenterBundle = {
  generatedAt: string;
  summary: LaunchControlSummary;
  readiness: LaunchReadinessItem[];
  checklist: LaunchChecklistEntry[];
  blockers: LaunchBlockerRecord[];
  risks: LaunchRiskRecord[];
  dependencies: LaunchDependencyRecord[];
  timeline: LaunchTimelineEvent[];
  approvals: LaunchApprovalRecord[];
  recommendations: string[];
};

export type LaunchControlAreaBundle = LaunchControlCenterBundle & {
  sectionId: LaunchControlSectionId;
};
