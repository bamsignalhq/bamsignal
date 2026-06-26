export type SecurityCertificationSeverity = "critical" | "high" | "medium" | "low";

export type SecurityCertificationCheckId =
  | "owasp-top-10"
  | "dependency-audit"
  | "secrets-scan"
  | "permission-audit"
  | "rls-verification"
  | "jwt-validation"
  | "rate-limiting"
  | "session-fixation"
  | "broken-access-control"
  | "idor-scan"
  | "xss-scan"
  | "csrf-scan"
  | "upload-validation"
  | "webhook-validation"
  | "otp-abuse"
  | "payment-abuse";

export type SecurityCertificationFinding = {
  id: string;
  checkId: SecurityCertificationCheckId;
  title: string;
  severity: SecurityCertificationSeverity;
  passed: boolean;
  detail: string;
  owaspRef?: string;
};

export type SecurityCertificationRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: SecurityCertificationSeverity;
};

export type SecurityCertificationSnapshot = {
  runId: string;
  generatedAt: string;
  securityScore: number;
  passed: boolean;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  findings: SecurityCertificationFinding[];
};

export type SecurityCertificationReport = SecurityCertificationSnapshot & {
  summaryLine: string;
  recommendations: SecurityCertificationRecommendation[];
  failures: string[];
  source: "store" | "cli";
};
