export type HealthSectionId =
  | "routes"
  | "permissions"
  | "journey"
  | "persistence"
  | "operations"
  | "safety"
  | "executive"
  | "launch";

export type HealthStatusId = "healthy" | "partial" | "critical";

export type GoNoGoVerdictId = "go" | "go-with-conditions" | "no-go-member-only" | "no-go";

export type HealthCategory = {
  id: HealthSectionId;
  label: string;
  status: HealthStatusId;
  score: number;
  summary: string;
  issueCount: number;
  auditPath: string | null;
};

export type ReadinessRiskItem = {
  id: string;
  title: string;
  detail: string;
  severity: "critical" | "high" | "medium";
  sectionId: HealthSectionId;
  auditPath?: string;
};

export type LaunchDecision = {
  verdict: GoNoGoVerdictId;
  label: string;
  detail: string;
  overallScore: number;
};

export type InstitutionalReadinessReport = {
  generatedAt: string;
  overallScore: number;
  sections: HealthCategory[];
  criticalBlockers: ReadinessRiskItem[];
  highRisks: ReadinessRiskItem[];
  mediumRisks: ReadinessRiskItem[];
  resolvedRisks: ReadinessRiskItem[];
  decision: LaunchDecision;
};
