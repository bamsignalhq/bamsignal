export type AccessibilityCertificationSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "warning";

export type AccessibilityCertificationDomainId =
  | "keyboard-navigation"
  | "focus-order"
  | "aria-labels"
  | "color-contrast"
  | "screen-readers"
  | "touch-targets"
  | "reduced-motion"
  | "form-labels"
  | "error-messaging"
  | "modal-focus-trapping";

export type AccessibilityCertificationFinding = {
  id: string;
  domainId: AccessibilityCertificationDomainId | string;
  title: string;
  detail: string;
  severity: AccessibilityCertificationSeverity;
  passed: boolean;
};

export type AccessibilityCertificationViolation = {
  id: string;
  domainId: AccessibilityCertificationDomainId | string;
  title: string;
  detail: string;
  severity: AccessibilityCertificationSeverity;
};

export type AccessibilityCertificationDomainResult = {
  id: AccessibilityCertificationDomainId | string;
  label: string;
  findingsCount: number;
  criticalCount: number;
  openCount: number;
  passedCount: number;
  score: number;
  passed: boolean;
};

export type AccessibilityCertificationRecommendation = {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  detail: string;
};

export type AccessibilityCertificationSnapshot = {
  runId: string;
  generatedAt: string;
  accessibilityScore: number;
  passed: boolean;
  counts: Record<AccessibilityCertificationSeverity, number>;
  domains: AccessibilityCertificationDomainResult[];
  findings: AccessibilityCertificationFinding[];
  violations: AccessibilityCertificationViolation[];
  recommendations: AccessibilityCertificationRecommendation[];
  failures: string[];
};

export type AccessibilityCertificationReport = AccessibilityCertificationSnapshot & {
  summaryLine: string;
  source: "store" | "cli";
};
