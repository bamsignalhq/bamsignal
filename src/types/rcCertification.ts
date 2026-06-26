export type RcCertificationDecision = "go" | "go-with-conditions" | "no-go";

export type RcCertificationSubsystemId =
  | "qa"
  | "security"
  | "performance"
  | "reliability"
  | "data-integrity"
  | "database"
  | "dependencies"
  | "operational-drift"
  | "observability"
  | "platform-health"
  | "notifications"
  | "payments"
  | "otp"
  | "feature-flags"
  | "remote-config"
  | "backups"
  | "release-management"
  | "launch-readiness"
  | "founder-certification";

export type RcCertificationIssue = {
  id: string;
  subsystemId: string;
  title: string;
  detail: string;
  severity: "critical" | "high" | "medium" | "warning" | "low";
};

export type RcCertificationSubsystemScore = {
  id: RcCertificationSubsystemId | string;
  label: string;
  score: number;
  status: string;
  summary: string;
  source: string;
  passed: boolean;
};

export type RcCertificationSnapshot = {
  runId: string;
  rcNumber: string;
  certificationTimestamp: string;
  gitCommit: string;
  gitCommitShort: string;
  buildVersion: string;
  buildCode: string;
  cacheVersion: string;
  environment: string;
  overallScore: number;
  releaseDecision: RcCertificationDecision;
  releaseDecisionLabel: string;
  releaseDecisionDetail: string;
  passed: boolean;
  passedChecks: number;
  subsystemScores: RcCertificationSubsystemScore[];
  criticalIssues: RcCertificationIssue[];
  warnings: RcCertificationIssue[];
  blockers: RcCertificationIssue[];
};

export type RcCertificationReport = RcCertificationSnapshot & {
  summaryLine: string;
  source: "store" | "cli";
};
