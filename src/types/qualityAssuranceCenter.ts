import type {
  QAAutomatedTestId,
  QACertificationSectionId,
  QACertificationSubsystemId,
  QAManualCheckId,
  QAReleaseGateStatusId,
  QAReportTypeId
} from "../constants/qualityAssuranceCenter";

export type QAAutomatedTestRun = {
  id: QAAutomatedTestId;
  label: string;
  status: QAReleaseGateStatusId;
  durationMs: number;
  lastRunAt: string;
  detail?: string;
};

export type QAManualCheckRun = {
  id: QAManualCheckId;
  label: string;
  status: QAReleaseGateStatusId;
  testedBy?: string;
  lastRunAt: string;
  notes?: string;
};

export type QAReleaseGate = {
  id: string;
  gateRef: string;
  name: string;
  sectionId: QACertificationSectionId;
  status: QAReleaseGateStatusId;
  blocksRelease: boolean;
  detail: string;
  evaluatedAt: string;
};

export type QASubsystemScore = {
  id: QACertificationSubsystemId;
  label: string;
  score: number;
  status: QAReleaseGateStatusId;
};

export type QACertificationApproval = {
  role: "engineer" | "qa" | "founder";
  status: "pending" | "approved" | "rejected";
  signedBy?: string;
  signedAt?: string;
};

export type QACertificationHistoryEntry = {
  id: string;
  certificationRef: string;
  version: string;
  overallScore: number;
  releaseBlocked: boolean;
  certifiedAt: string;
  certifiedBy: string;
};

export type QACertificationSummary = {
  overallScore: number;
  releaseBlocked: boolean;
  passCount: number;
  warningCount: number;
  failedCount: number;
  automatedPassRate: number;
  manualPassRate: number;
};

export type QACertificationCenterBundle = {
  generatedAt: string;
  summary: QACertificationSummary;
  subsystemScores: QASubsystemScore[];
  releaseGates: QAReleaseGate[];
  automatedTests: QAAutomatedTestRun[];
  manualChecks: QAManualCheckRun[];
  approvals: QACertificationApproval[];
  history: QACertificationHistoryEntry[];
  reports: { id: QAReportTypeId; label: string; lastGeneratedAt?: string }[];
};
