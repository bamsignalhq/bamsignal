/** Institutional Launch Certification™ — final launch authority for tomorrow's go-live. */

import type { LaunchCertificationDomainId, LaunchDecisionId, LaunchIssueSeverityId } from "../types/launchCertification";

export const LAUNCH_CERTIFICATION_DOMAINS = [
  { id: "routing", label: "Routing" },
  { id: "authentication", label: "Authentication" },
  { id: "authorization", label: "Authorization" },
  { id: "supabase", label: "Supabase" },
  { id: "payments", label: "Payments" },
  { id: "scheduling", label: "Scheduling" },
  { id: "notifications", label: "Notifications" },
  { id: "crm", label: "CRM" },
  { id: "operations-center", label: "Operations Center" },
  { id: "executive-dashboard", label: "Executive Dashboard" },
  { id: "journey-engine", label: "Journey Engine" },
  { id: "introductions", label: "Introductions" },
  { id: "follow-up", label: "Follow-up" },
  { id: "archive", label: "Archive" },
  { id: "legacy", label: "Legacy" },
  { id: "monitoring", label: "Monitoring" },
  { id: "compliance", label: "Compliance" },
  { id: "backup", label: "Backup" },
  { id: "recovery", label: "Recovery" },
  { id: "reporting", label: "Reporting" },
  { id: "security", label: "Security" },
  { id: "performance", label: "Performance" },
  { id: "accessibility", label: "Accessibility" },
  { id: "seo", label: "SEO" },
  { id: "deep-links", label: "Deep Links" },
  { id: "pwa", label: "PWA" },
  { id: "android", label: "Android" },
  { id: "ios", label: "iOS" }
] as const;

export const LAUNCH_CERTIFICATION_DOMAIN_LABELS: Record<LaunchCertificationDomainId, string> =
  Object.fromEntries(LAUNCH_CERTIFICATION_DOMAINS.map((item) => [item.id, item.label])) as Record<
    LaunchCertificationDomainId,
    string
  >;

export const LAUNCH_DECISIONS = [
  { id: "go", label: "GO" },
  { id: "go-with-conditions", label: "GO WITH CONDITIONS" },
  { id: "no-go", label: "NO GO" }
] as const;

export const LAUNCH_DECISION_LABELS: Record<LaunchDecisionId, string> = Object.fromEntries(
  LAUNCH_DECISIONS.map((item) => [item.id, item.label])
) as Record<LaunchDecisionId, string>;

export const LAUNCH_ISSUE_SEVERITIES = [
  { id: "critical", label: "Critical Blocker" },
  { id: "warning", label: "Warning" },
  { id: "minor", label: "Minor Issue" }
] as const;

export const LAUNCH_ISSUE_SEVERITY_LABELS: Record<LaunchIssueSeverityId, string> =
  Object.fromEntries(LAUNCH_ISSUE_SEVERITIES.map((item) => [item.id, item.label])) as Record<
    LaunchIssueSeverityId,
    string
  >;

export const LAUNCH_CONSOLIDATION_CHECKS = [
  "No duplicate /hard route keys in permissions registry",
  "No eager admin hub imports — institutional tabs lazy-loaded",
  "No duplicate readiness and launch certification engines",
  "Service worker does not force reload loops",
  "heic2any isolated from initial member bundle",
  "Public routes isolated from member restore shell",
  "Onboarding only at /onboarding",
  "Paystack callbacks preserve return path"
] as const;
