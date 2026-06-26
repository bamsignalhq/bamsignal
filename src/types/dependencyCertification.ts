export type DependencyCertificationSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "warning";

export type DependencyCertificationCategoryId =
  | "npm-packages"
  | "docker-base"
  | "node-version"
  | "android-dependencies"
  | "firebase-sdk"
  | "supabase-sdk"
  | "payment-sdks"
  | "notification-sdks";

export type DependencyCertificationFinding = {
  id: string;
  categoryId: DependencyCertificationCategoryId | string;
  title: string;
  detail: string;
  severity: DependencyCertificationSeverity;
  passed: boolean;
  packageName?: string;
};

export type DependencyUpgradeCandidate = {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  majorDrift: boolean;
};

export type DependencyCriticalVulnerability = {
  name: string;
  severity: string;
  via?: unknown;
};

export type DependencyCertificationCategoryResult = {
  id: DependencyCertificationCategoryId | string;
  label: string;
  findingsCount: number;
  criticalCount: number;
  passed: boolean;
};

export type DependencyCertificationRecommendation = {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  detail: string;
};

export type DependencyCertificationSnapshot = {
  runId: string;
  generatedAt: string;
  dependencyScore: number;
  passed: boolean;
  counts: Record<DependencyCertificationSeverity, number>;
  packagesScanned: number;
  categories: DependencyCertificationCategoryResult[];
  findings: DependencyCertificationFinding[];
  criticalVulnerabilities: DependencyCriticalVulnerability[];
  upgradeCandidates: DependencyUpgradeCandidate[];
  unusedDependencies: string[];
  duplicatePackages: Array<{ name: string; versions: string[] }>;
  recommendations: DependencyCertificationRecommendation[];
  failures: string[];
};

export type DependencyCertificationReport = DependencyCertificationSnapshot & {
  summaryLine: string;
  source: "store" | "cli";
};
