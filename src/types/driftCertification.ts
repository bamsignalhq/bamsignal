export type DriftCertificationSeverity = "critical" | "high" | "medium" | "low" | "warning";

export type DriftCertificationDomainId =
  | "environment-variables"
  | "feature-flags"
  | "remote-config"
  | "permissions"
  | "roles"
  | "notification-templates"
  | "payment-configuration"
  | "sendchamp"
  | "resend"
  | "firebase"
  | "supabase"
  | "storage-buckets"
  | "cron-schedules";

export type DriftCompareTarget =
  | "expected"
  | "current"
  | "production"
  | "staging"
  | "expected-vs-current"
  | "production-vs-staging";

export type DriftCertificationFinding = {
  id: string;
  domainId: DriftCertificationDomainId | string;
  title: string;
  detail: string;
  severity: DriftCertificationSeverity;
  compareTarget: DriftCompareTarget | string;
  passed: boolean;
  variable?: string;
};

export type DriftCertificationDomainResult = {
  id: DriftCertificationDomainId | string;
  label: string;
  findingsCount: number;
  criticalCount: number;
  passed: boolean;
};

export type DriftCertificationRecommendation = {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  detail: string;
  variable?: string;
};

export type DriftCertificationSnapshot = {
  runId: string;
  generatedAt: string;
  mode: "database" | "static";
  driftScore: number;
  passed: boolean;
  counts: Record<DriftCertificationSeverity, number>;
  domains: DriftCertificationDomainResult[];
  findings: DriftCertificationFinding[];
  unexpectedDrift: number;
  unauthorizedChanges: number;
  configurationMismatches: number;
  missingSecrets: number;
  unusedSecrets: string[];
  recommendations: DriftCertificationRecommendation[];
  failures: string[];
};

export type DriftCertificationReport = DriftCertificationSnapshot & {
  summaryLine: string;
  source: "store" | "cli";
};
