export type ReadinessSubsystemId =
  | "routing"
  | "authentication"
  | "permissions"
  | "supabase"
  | "payments"
  | "scheduling"
  | "notifications"
  | "crm"
  | "operations"
  | "journey-engine"
  | "introductions"
  | "follow-ups"
  | "archive"
  | "legacy"
  | "monitoring"
  | "security"
  | "compliance"
  | "backups"
  | "executive-dashboard";

export type ReadinessResultId = "healthy" | "warning" | "critical" | "unknown";

export type ReadinessCheckTypeId =
  | "configuration"
  | "connectivity"
  | "data-integrity"
  | "performance"
  | "permissions"
  | "dependencies"
  | "audit-coverage"
  | "operational-status";

export type GoNoGoVerdictId = "go" | "go-with-conditions" | "no-go-member-only" | "no-go";

export type ReadinessVerificationCheck = {
  id: string;
  checkRef: string;
  subsystemId: ReadinessSubsystemId;
  checkType: ReadinessCheckTypeId;
  status: ReadinessResultId;
  message: string;
  passed: boolean;
};

export type ReadinessSubsystemHealth = {
  id: ReadinessSubsystemId;
  label: string;
  status: ReadinessResultId;
  score: number;
  issueCount: number;
  summary: string;
  dependencies: ReadinessSubsystemId[];
  failedDependencies: ReadinessSubsystemId[];
  auditPath: string | null;
  contractExposed: boolean;
};

export type ReadinessDependencyLink = {
  id: string;
  dependencyRef: string;
  upstreamId: ReadinessSubsystemId;
  downstreamId: ReadinessSubsystemId;
  critical: boolean;
  upstreamStatus: ReadinessResultId;
  downstreamStatus: ReadinessResultId;
  surfaced: boolean;
};

export type ReadinessCriticalIssue = {
  id: string;
  issueRef: string;
  title: string;
  detail: string;
  subsystemId: ReadinessSubsystemId;
  auditPath?: string;
};

export type ReadinessRecommendedAction = {
  id: string;
  actionRef: string;
  title: string;
  detail: string;
  priority: "critical" | "high" | "medium";
};

export type ReadinessGoNoGoRecommendation = {
  verdict: GoNoGoVerdictId;
  label: string;
  detail: string;
  institutionReadinessScore: number;
};

export type InstitutionalReadinessVerificationBundle = {
  generatedAt: string;
  institutionReadinessScore: number;
  subsystems: ReadinessSubsystemHealth[];
  checks: ReadinessVerificationCheck[];
  dependencies: ReadinessDependencyLink[];
  criticalIssues: ReadinessCriticalIssue[];
  warnings: ReadinessCriticalIssue[];
  passedChecks: ReadinessVerificationCheck[];
  recommendedActions: ReadinessRecommendedAction[];
  recommendation: ReadinessGoNoGoRecommendation;
};

/** @deprecated use InstitutionalReadinessVerificationBundle */
export type InstitutionalReadinessReport = InstitutionalReadinessVerificationBundle;
