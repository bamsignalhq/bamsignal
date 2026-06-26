export type FounderCertificationSubsystemId =
  | "qa"
  | "security"
  | "performance"
  | "reliability"
  | "observability"
  | "platform-health"
  | "payments"
  | "otp"
  | "messaging"
  | "notifications"
  | "concierge"
  | "abuse-protection"
  | "readiness"
  | "release"
  | "backup"
  | "governance"
  | "api"
  | "feature-flags"
  | "remote-config";

export type FounderLaunchDecisionId = "go" | "go-with-conditions" | "no-go";

export type FounderCertificationIssue = {
  id: string;
  subsystemId: FounderCertificationSubsystemId;
  title: string;
  detail: string;
  severity: "critical" | "warning";
};

export type FounderSubsystemScore = {
  id: FounderCertificationSubsystemId;
  label: string;
  score: number;
  status: "healthy" | "warning" | "critical";
  summary: string;
  source: "cert-report" | "static" | "pending";
};

export type FounderCertificationSnapshot = {
  runId: string;
  generatedAt: string;
  releaseCandidate: string;
  overallScore: number;
  releaseDecision: FounderLaunchDecisionId;
  releaseDecisionLabel: string;
  passed: boolean;
  subsystemScores: FounderSubsystemScore[];
  criticalIssues: FounderCertificationIssue[];
  warnings: FounderCertificationIssue[];
  resolvedSinceLastRelease: string[];
  releaseDecisionDetail?: string;
  exports?: {
    json: string;
    markdown: string;
    founderPdf: string;
    boardPdf: string;
  };
};

export type FounderCertificationReport = FounderCertificationSnapshot & {
  summaryLine: string;
  releaseDecisionDetail: string;
  exports: {
    json: string;
    markdown: string;
    founderPdf: string;
    boardPdf: string;
  };
  source: "store" | "cli";
};
