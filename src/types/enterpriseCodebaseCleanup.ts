export type EngineeringHealthDomainId =
  | "unused-files"
  | "dead-components"
  | "duplicate-utilities"
  | "duplicate-constants"
  | "duplicate-hooks"
  | "duplicate-types"
  | "unused-css"
  | "unused-tailwind"
  | "unused-images"
  | "unused-icons"
  | "unused-routes"
  | "unused-layouts"
  | "unused-imports"
  | "circular-imports"
  | "duplicate-business-logic"
  | "duplicate-validation"
  | "duplicate-formatters"
  | "duplicate-helpers"
  | "duplicate-tests";

export type EngineeringHealthStatusId = "healthy" | "review" | "debt";

export type EngineeringHealthDomainResult = {
  id: EngineeringHealthDomainId;
  label: string;
  status: EngineeringHealthStatusId;
  score: number;
  summary: string;
  issueCount: number;
};

export type EngineeringHealthCheck = {
  id: string;
  checkRef: string;
  domainId: EngineeringHealthDomainId;
  label: string;
  passed: boolean;
  detail: string;
};

export type EngineeringDuplicateFinding = {
  id: string;
  label: string;
  paths: string[];
  status: EngineeringHealthStatusId;
  summary: string;
};

export type EngineeringHealthReport = {
  generatedAt: string;
  overallScore: number;
  overallStatus: EngineeringHealthStatusId;
  domains: EngineeringHealthDomainResult[];
  checklist: EngineeringHealthCheck[];
  duplicates: EngineeringDuplicateFinding[];
  standardizationTargets: string[];
  appliedFixes: string[];
  removedFiles: string[];
  passedCheckCount: number;
  reviewIssueCount: number;
  debtIssueCount: number;
};
