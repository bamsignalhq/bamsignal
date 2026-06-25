export type FatPersonaId =
  | "guest"
  | "registered-member"
  | "premium-member"
  | "concierge-member"
  | "consultant"
  | "senior-matchmaker"
  | "operations"
  | "support"
  | "research"
  | "executive"
  | "super-admin";

export type FatWorkflowId =
  | "discovery"
  | "auth"
  | "onboarding"
  | "member-app"
  | "premium"
  | "payments"
  | "concierge"
  | "scheduling"
  | "meetings"
  | "assignments"
  | "introductions"
  | "follow-up"
  | "archive"
  | "notifications"
  | "consultant-portal"
  | "operations-center"
  | "support"
  | "research"
  | "executive"
  | "admin"
  | "permissions"
  | "reporting"
  | "exports"
  | "search"
  | "seo"
  | "infrastructure";

export type FatSeverityId = "passed" | "warning" | "critical";

export type FatGoDecisionId = "go" | "go-with-conditions" | "no-go";

export type FatWorkflowResult = {
  id: FatWorkflowId;
  label: string;
  status: FatSeverityId;
  score: number;
  summary: string;
  testRef?: string;
};

export type FatPersonaResult = {
  id: FatPersonaId;
  label: string;
  status: FatSeverityId;
  score: number;
  workflows: FatWorkflowResult[];
  summary: string;
};

export type FatCheck = {
  id: string;
  checkRef: string;
  personaId: FatPersonaId;
  label: string;
  passed: boolean;
  detail: string;
};

export type FatIssue = {
  id: string;
  severity: FatSeverityId;
  title: string;
  detail: string;
  personaId?: FatPersonaId;
  workflowId?: FatWorkflowId;
};

export type FounderAcceptanceReport = {
  generatedAt: string;
  goDecision: FatGoDecisionId;
  overallScore: number;
  passedCount: number;
  warningCount: number;
  criticalCount: number;
  personas: FatPersonaResult[];
  workflows: FatWorkflowResult[];
  checklist: FatCheck[];
  passed: FatIssue[];
  warnings: FatIssue[];
  critical: FatIssue[];
  testSuite: { total: number; passed: number; failed: string[] };
  fixesApplied: string[];
};
