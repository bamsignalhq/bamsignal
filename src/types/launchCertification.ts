export type LaunchCertificationDomainId =
  | "routing"
  | "authentication"
  | "authorization"
  | "supabase"
  | "payments"
  | "scheduling"
  | "notifications"
  | "crm"
  | "operations-center"
  | "executive-dashboard"
  | "journey-engine"
  | "introductions"
  | "follow-up"
  | "archive"
  | "legacy"
  | "monitoring"
  | "compliance"
  | "backup"
  | "recovery"
  | "reporting"
  | "security"
  | "performance"
  | "accessibility"
  | "seo"
  | "deep-links"
  | "pwa"
  | "android"
  | "ios";

export type LaunchCertificationStatusId = "certified" | "conditional" | "blocked";

export type LaunchDecisionId = "go" | "go-with-conditions" | "no-go";

export type LaunchIssueSeverityId = "critical" | "warning" | "minor";

export type LaunchSubsystemScore = {
  id: LaunchCertificationDomainId;
  label: string;
  status: LaunchCertificationStatusId;
  score: number;
  summary: string;
  issueCount: number;
  auditPath?: string;
};

export type LaunchCertificationCheck = {
  id: string;
  checkRef: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type LaunchCertificationIssue = {
  id: string;
  issueRef: string;
  severity: LaunchIssueSeverityId;
  title: string;
  detail: string;
  domainId: LaunchCertificationDomainId;
  auditPath?: string;
};

export type LaunchCertificationRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: "critical" | "high" | "medium";
};

export type LaunchCertificationReport = {
  generatedAt: string;
  overallReadinessScore: number;
  launchDecision: LaunchDecisionId;
  launchDecisionDetail: string;
  subsystems: LaunchSubsystemScore[];
  consolidationChecks: LaunchCertificationCheck[];
  criticalBlockers: LaunchCertificationIssue[];
  warnings: LaunchCertificationIssue[];
  minorIssues: LaunchCertificationIssue[];
  recommendations: LaunchCertificationRecommendation[];
  passedCheckCount: number;
  certifiedDomainCount: number;
};
