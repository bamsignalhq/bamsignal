/** Enterprise QA & Certification Center™ — single source of truth for release readiness. */

import { QA_CERTIFICATION_CENTER_ADMIN_BRAND } from "./qualityAssuranceCenterAdmin";

export const QA_CERTIFICATION_CENTER_BRAND = QA_CERTIFICATION_CENTER_ADMIN_BRAND;

export const QA_CERTIFICATION_REFRESH_INTERVAL_MS = 30_000;

export const QA_CERTIFICATION_SECTIONS = [
  { id: "certification-summary", label: "Certification Summary" },
  { id: "automated-tests", label: "Automated Tests" },
  { id: "manual-qa", label: "Manual QA" },
  { id: "cross-browser", label: "Cross Browser" },
  { id: "mobile-testing", label: "Mobile Testing" },
  { id: "regression-tests", label: "Regression Tests" },
  { id: "performance", label: "Performance" },
  { id: "security", label: "Security" },
  { id: "accessibility", label: "Accessibility" },
  { id: "production-readiness", label: "Production Readiness" }
] as const;

export type QACertificationSectionId = (typeof QA_CERTIFICATION_SECTIONS)[number]["id"];

export const QA_CERTIFICATION_SECTION_LABELS: Record<QACertificationSectionId, string> =
  Object.fromEntries(QA_CERTIFICATION_SECTIONS.map((item) => [item.id, item.label])) as Record<
    QACertificationSectionId,
    string
  >;

export const QA_AUTOMATED_TESTS = [
  { id: "build", label: "Build" },
  { id: "unit", label: "Unit" },
  { id: "integration", label: "Integration" },
  { id: "server-import", label: "Server Import" },
  { id: "database", label: "Database" },
  { id: "api", label: "API" },
  { id: "notifications", label: "Notifications" },
  { id: "payments", label: "Payments" },
  { id: "otp", label: "OTP" },
  { id: "concierge", label: "Concierge" },
  { id: "operations", label: "Operations" },
  { id: "feature-flags", label: "Feature Flags" },
  { id: "remote-config", label: "Remote Config" },
  { id: "platform-health", label: "Platform Health" },
  { id: "abuse-protection", label: "Abuse Protection" },
  { id: "observability", label: "Observability" }
] as const;

export type QAAutomatedTestId = (typeof QA_AUTOMATED_TESTS)[number]["id"];

export const QA_AUTOMATED_TEST_LABELS: Record<QAAutomatedTestId, string> = Object.fromEntries(
  QA_AUTOMATED_TESTS.map((item) => [item.id, item.label])
) as Record<QAAutomatedTestId, string>;

export const QA_MANUAL_CHECKS = [
  { id: "android", label: "Android" },
  { id: "iphone", label: "iPhone" },
  { id: "tablet", label: "Tablet" },
  { id: "chrome", label: "Chrome" },
  { id: "safari", label: "Safari" },
  { id: "firefox", label: "Firefox" },
  { id: "edge", label: "Edge" },
  { id: "slow-network", label: "Slow Network" },
  { id: "offline", label: "Offline" },
  { id: "dark-mode", label: "Dark Mode" }
] as const;

export type QAManualCheckId = (typeof QA_MANUAL_CHECKS)[number]["id"];

export const QA_MANUAL_CHECK_LABELS: Record<QAManualCheckId, string> = Object.fromEntries(
  QA_MANUAL_CHECKS.map((item) => [item.id, item.label])
) as Record<QAManualCheckId, string>;

export const QA_RELEASE_GATE_STATUSES = ["pass", "warning", "failed"] as const;
export type QAReleaseGateStatusId = (typeof QA_RELEASE_GATE_STATUSES)[number];

export const QA_RELEASE_GATE_STATUS_LABELS: Record<QAReleaseGateStatusId, string> = {
  pass: "PASS",
  warning: "WARNING",
  failed: "FAILED"
};

export const QA_CERTIFICATION_SUBSYSTEMS = [
  { id: "automated", label: "Automated Tests" },
  { id: "manual", label: "Manual QA" },
  { id: "cross-browser", label: "Cross Browser" },
  { id: "mobile", label: "Mobile Testing" },
  { id: "regression", label: "Regression" },
  { id: "performance", label: "Performance" },
  { id: "security", label: "Security" },
  { id: "accessibility", label: "Accessibility" },
  { id: "production", label: "Production Readiness" }
] as const;

export type QACertificationSubsystemId = (typeof QA_CERTIFICATION_SUBSYSTEMS)[number]["id"];

export const QA_REPORT_TYPES = [
  { id: "release-certification-pdf", label: "Generate Release Certification PDF" },
  { id: "qa-summary", label: "Generate QA Summary" },
  { id: "blocker-report", label: "Generate Blocker Report" }
] as const;

export type QAReportTypeId = (typeof QA_REPORT_TYPES)[number]["id"];

export const QA_CERTIFICATION_CENTER_DB_TABLES = [
  "qa_certification_records",
  "qa_release_gates",
  "qa_automated_test_runs",
  "qa_manual_qa_runs",
  "qa_certification_reports"
] as const;
