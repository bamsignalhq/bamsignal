export type UxDomainId =
  | "typography"
  | "spacing"
  | "buttons"
  | "cards"
  | "tables"
  | "forms"
  | "icons"
  | "animations"
  | "loading-states"
  | "skeletons"
  | "error-states"
  | "success-states"
  | "dialogs"
  | "modals"
  | "mobile-layout"
  | "desktop-layout"
  | "accessibility"
  | "dark-theme"
  | "light-theme"
  | "navigation"
  | "breadcrumbs"
  | "page-titles"
  | "consistency";

export type UxStatusId = "consistent" | "review" | "inconsistent";

export type UxDomainResult = {
  id: UxDomainId;
  label: string;
  status: UxStatusId;
  score: number;
  summary: string;
  issueCount: number;
};

export type UxChecklistItem = {
  id: string;
  checkRef: string;
  domainId: UxDomainId;
  label: string;
  passed: boolean;
  detail: string;
};

export type UxDuplicateFinding = {
  id: string;
  label: string;
  paths: string[];
  status: UxStatusId;
  summary: string;
};

export type UxConsistencyReport = {
  generatedAt: string;
  overallScore: number;
  overallStatus: UxStatusId;
  domains: UxDomainResult[];
  checklist: UxChecklistItem[];
  duplicates: UxDuplicateFinding[];
  standardizationTargets: string[];
  appliedFixes: string[];
  passedCheckCount: number;
  reviewIssueCount: number;
  inconsistentIssueCount: number;
};
