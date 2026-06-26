/** Security Certification™ — release security baseline checks. */

import type { SecurityCertificationCheckId } from "../types/securityCertification";

export const SECURITY_CERTIFICATION_CHECKS: Array<{
  id: SecurityCertificationCheckId;
  label: string;
  owaspCategory?: string;
}> = [
  { id: "owasp-top-10", label: "OWASP Top 10", owaspCategory: "A01-A10" },
  { id: "dependency-audit", label: "Dependency audit", owaspCategory: "A06" },
  { id: "secrets-scan", label: "Secrets scan", owaspCategory: "A02" },
  { id: "permission-audit", label: "Permission audit", owaspCategory: "A01" },
  { id: "rls-verification", label: "RLS verification", owaspCategory: "A01" },
  { id: "jwt-validation", label: "JWT validation", owaspCategory: "A07" },
  { id: "rate-limiting", label: "Rate limiting", owaspCategory: "A04" },
  { id: "session-fixation", label: "Session fixation", owaspCategory: "A07" },
  { id: "broken-access-control", label: "Broken access control", owaspCategory: "A01" },
  { id: "idor-scan", label: "IDOR scan", owaspCategory: "A01" },
  { id: "xss-scan", label: "XSS scan", owaspCategory: "A03" },
  { id: "csrf-scan", label: "CSRF scan", owaspCategory: "A08" },
  { id: "upload-validation", label: "Upload validation", owaspCategory: "A04" },
  { id: "webhook-validation", label: "Webhook validation", owaspCategory: "A08" },
  { id: "otp-abuse", label: "OTP abuse", owaspCategory: "A04" },
  { id: "payment-abuse", label: "Payment abuse", owaspCategory: "A04" }
];

export const SECURITY_CERTIFICATION_RELEASE_BLOCKERS = [
  "Critical findings > 0",
  "High findings > 0"
] as const;
