/** Production security hardening — audit domains and verification checklist. */

import type { SecurityDomainId, SecurityRouteZoneId, SecurityStatusId } from "../types/productionSecurity";

export const SECURITY_AUDIT_DOMAINS = [
  { id: "authentication", label: "Authentication" },
  { id: "authorization", label: "Authorization" },
  { id: "session-management", label: "Session Management" },
  { id: "secrets", label: "Secrets" },
  { id: "api-keys", label: "API Keys" },
  { id: "headers", label: "Headers" },
  { id: "cookies", label: "Cookies" },
  { id: "csrf", label: "CSRF" },
  { id: "xss", label: "XSS" },
  { id: "sql-injection", label: "SQL Injection" },
  { id: "rate-limiting", label: "Rate Limiting" },
  { id: "file-uploads", label: "File Uploads" },
  { id: "validation", label: "Validation" },
  { id: "logging", label: "Logging" },
  { id: "sensitive-data", label: "Sensitive Data Exposure" },
  { id: "deep-links", label: "Deep Links" },
  { id: "rls", label: "RLS" },
  { id: "storage-access", label: "Storage Access" }
] as const;

export const SECURITY_DOMAIN_LABELS: Record<SecurityDomainId, string> = Object.fromEntries(
  SECURITY_AUDIT_DOMAINS.map((item) => [item.id, item.label])
) as Record<SecurityDomainId, string>;

export const SECURITY_STATUSES = [
  { id: "secure", label: "Secure" },
  { id: "warning", label: "Warning" },
  { id: "critical", label: "Critical" }
] as const;

export const SECURITY_STATUS_LABELS: Record<SecurityStatusId, string> = Object.fromEntries(
  SECURITY_STATUSES.map((item) => [item.id, item.label])
) as Record<SecurityStatusId, string>;

export const SECURITY_ROUTE_ZONES = [
  { id: "admin", label: "Admin routes" },
  { id: "consultant", label: "Consultant routes" },
  { id: "member", label: "Member routes" },
  { id: "operations", label: "Operations routes" },
  { id: "executive", label: "Executive routes" },
  { id: "supabase", label: "Supabase policies" },
  { id: "storage", label: "Storage access" }
] as const;

export const SECURITY_ROUTE_ZONE_LABELS: Record<SecurityRouteZoneId, string> = Object.fromEntries(
  SECURITY_ROUTE_ZONES.map((item) => [item.id, item.label])
) as Record<SecurityRouteZoneId, string>;

export const SECURITY_HARDENING_FIXES = [
  "Security response headers enabled on all responses",
  "X-Powered-By disabled on Express",
  "CRON_SECRET accepted via header only (query/body rejected)",
  "Diagnostics endpoints require x-diagnostics-secret or admin session",
  "Generic auth errors — no username/email enumeration",
  "API errors sanitized before logging",
  "Pin login throttled server-side",
  "Payment initialize throttled server-side",
  "Admin action PIN throttled server-side"
] as const;
