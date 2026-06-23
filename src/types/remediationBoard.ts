export type RemediationSeverityId = "P0" | "P1" | "P2";

export type RemediationStatusId =
  | "open"
  | "in-progress"
  | "blocked"
  | "resolved"
  | "deferred";

export type RemediationCategoryId =
  | "routes"
  | "permissions"
  | "journey-integrity"
  | "persistence"
  | "operations"
  | "crm"
  | "notifications"
  | "safety"
  | "executive"
  | "launch";

export type RemediationFindingSeed = {
  id: string;
  title: string;
  detail: string;
  severity: RemediationSeverityId;
  category: RemediationCategoryId;
  auditSource: string;
  auditPath?: string;
  defaultStatus: RemediationStatusId;
  launchBlocker?: boolean;
};

export type RemediationFinding = RemediationFindingSeed & {
  status: RemediationStatusId;
  updatedAt: string;
};

export type RemediationBoardMetrics = {
  openFindings: number;
  criticalFindings: number;
  resolvedFindings: number;
  launchBlockers: number;
  totalFindings: number;
};

export type RemediationCategorySummary = {
  category: RemediationCategoryId;
  label: string;
  open: number;
  p0: number;
  p1: number;
  p2: number;
  total: number;
};

export type RemediationBoardBundle = {
  generatedAt: string;
  metrics: RemediationBoardMetrics;
  categorySummaries: RemediationCategorySummary[];
  findings: RemediationFinding[];
};
