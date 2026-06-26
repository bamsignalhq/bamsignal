export type DataIntegrityCertificationDomainId =
  | "members"
  | "profiles"
  | "photos"
  | "signals"
  | "matches"
  | "chats"
  | "messages"
  | "notifications"
  | "payments"
  | "consultations"
  | "journey-ids"
  | "reports"
  | "saved-profiles"
  | "premium-status"
  | "subscriptions"
  | "feature-flags"
  | "remote-config"
  | "audit-logs";

export type DataIntegrityCertIssue = {
  id: string;
  domainId: string;
  title: string;
  detail: string;
  severity: "critical" | "warning";
  count?: number;
  domainLabel?: string;
};

export type DataIntegrityCertDomainResult = {
  id: DataIntegrityCertificationDomainId | string;
  label: string;
  objectsScanned: number;
  objectsRepaired: number;
  objectsRequiringReview: number;
  criticalIssues: DataIntegrityCertIssue[];
  warnings: DataIntegrityCertIssue[];
  passed: boolean;
};

export type DataIntegrityCertificationSnapshot = {
  runId: string;
  generatedAt: string;
  mode: "database" | "static";
  integrityScore: number;
  passed: boolean;
  objectsScanned: number;
  objectsRepaired: number;
  objectsRequiringReview: number;
  domains: DataIntegrityCertDomainResult[];
  criticalIssues: DataIntegrityCertIssue[];
  warnings: DataIntegrityCertIssue[];
  repairs: Array<{ action: string; count: number; safe: boolean }>;
  flaggedForReview: Array<{ action: string; detail: string; safe: boolean }>;
};

export type DataIntegrityCertificationReport = DataIntegrityCertificationSnapshot & {
  summaryLine: string;
  source: "store" | "cli";
};
