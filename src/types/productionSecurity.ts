export type SecurityDomainId =
  | "authentication"
  | "authorization"
  | "session-management"
  | "secrets"
  | "api-keys"
  | "headers"
  | "cookies"
  | "csrf"
  | "xss"
  | "sql-injection"
  | "rate-limiting"
  | "file-uploads"
  | "validation"
  | "logging"
  | "sensitive-data"
  | "deep-links"
  | "rls"
  | "storage-access";

export type SecurityStatusId = "secure" | "warning" | "critical";

export type SecurityRouteZoneId =
  | "admin"
  | "consultant"
  | "member"
  | "operations"
  | "executive"
  | "supabase"
  | "storage";

export type SecurityDomainResult = {
  id: SecurityDomainId;
  label: string;
  status: SecurityStatusId;
  score: number;
  summary: string;
  issueCount: number;
};

export type SecurityChecklistItem = {
  id: string;
  checkRef: string;
  domainId: SecurityDomainId;
  label: string;
  passed: boolean;
  detail: string;
};

export type SecurityRouteVerification = {
  id: SecurityRouteZoneId;
  label: string;
  status: SecurityStatusId;
  enforcedCount: number;
  issueCount: number;
  summary: string;
};

export type SecurityHealthReport = {
  generatedAt: string;
  overallScore: number;
  overallStatus: SecurityStatusId;
  domains: SecurityDomainResult[];
  checklist: SecurityChecklistItem[];
  routeVerifications: SecurityRouteVerification[];
  hardenedFixes: string[];
  criticalIssueCount: number;
  warningIssueCount: number;
  passedCheckCount: number;
};
