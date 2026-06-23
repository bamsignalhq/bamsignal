export type IntegrityStatusId = "healthy" | "warning" | "critical";

export type DataIntegrityCheckId =
  | "journey-ids"
  | "consultant-assignments"
  | "introductions"
  | "follow-ups"
  | "archives"
  | "legacy-profiles"
  | "payments"
  | "meetings"
  | "notifications";

export type IntegrityIssue = {
  id: string;
  checkId: DataIntegrityCheckId;
  title: string;
  detail: string;
  severity: "warning" | "critical";
};

export type IntegrityCheck = {
  id: DataIntegrityCheckId;
  label: string;
  status: IntegrityStatusId;
  score: number;
  summary: string;
  issueCount: number;
  issues: IntegrityIssue[];
};

export type IntegritySummary = {
  overallStatus: IntegrityStatusId;
  score: number;
  healthyChecks: number;
  warningChecks: number;
  criticalChecks: number;
  totalIssues: number;
};

export type DataIntegrityBundle = {
  generatedAt: string;
  summary: IntegritySummary;
  checks: IntegrityCheck[];
};
