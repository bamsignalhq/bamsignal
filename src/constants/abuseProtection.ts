/** Abuse Protection Center™ — spam, fraud, scraping, OTP abuse, and bot defense. */

import { ABUSE_PROTECTION_ADMIN_BRAND } from "./abuseProtectionAdmin";

export const ABUSE_PROTECTION_BRAND = ABUSE_PROTECTION_ADMIN_BRAND;

export const ABUSE_PROTECTION_REFRESH_INTERVAL_MS = 30_000;

export const ABUSE_MONITOR_CATEGORIES = [
  { id: "otp-requests", label: "OTP requests", critical: true },
  { id: "login-attempts", label: "Login attempts", critical: true },
  { id: "failed-logins", label: "Failed logins", critical: true },
  { id: "signal-spam", label: "Signal spam", critical: false },
  { id: "message-spam", label: "Message spam", critical: false },
  { id: "report-abuse", label: "Report abuse", critical: true },
  { id: "fake-accounts", label: "Fake accounts", critical: true },
  { id: "bot-detection", label: "Bot detection", critical: true },
  { id: "referral-abuse", label: "Referral abuse", critical: false },
  { id: "consultation-abuse", label: "Consultation abuse", critical: false },
  { id: "payment-abuse", label: "Payment abuse", critical: true }
] as const;

export type AbuseMonitorId = (typeof ABUSE_MONITOR_CATEGORIES)[number]["id"];

export const ABUSE_MONITOR_LABELS: Record<AbuseMonitorId, string> = Object.fromEntries(
  ABUSE_MONITOR_CATEGORIES.map((item) => [item.id, item.label])
) as Record<AbuseMonitorId, string>;

export const ABUSE_RATE_LIMIT_DIMENSIONS = [
  { id: "ip", label: "Per IP" },
  { id: "device", label: "Per device" },
  { id: "account", label: "Per account" },
  { id: "phone", label: "Per phone" },
  { id: "email", label: "Per email" },
  { id: "session", label: "Per session" },
  { id: "endpoint", label: "Per endpoint" }
] as const;

export type AbuseRateLimitDimensionId = (typeof ABUSE_RATE_LIMIT_DIMENSIONS)[number]["id"];

export const ABUSE_RATE_LIMIT_DIMENSION_LABELS: Record<AbuseRateLimitDimensionId, string> =
  Object.fromEntries(ABUSE_RATE_LIMIT_DIMENSIONS.map((item) => [item.id, item.label])) as Record<
    AbuseRateLimitDimensionId,
    string
  >;

export const ABUSE_PROTECTION_TOOLS = [
  { id: "unblock", label: "Unblock" },
  { id: "blacklist", label: "Blacklist" },
  { id: "whitelist", label: "Whitelist" },
  { id: "increase-limits", label: "Increase limits" },
  { id: "decrease-limits", label: "Decrease limits" },
  { id: "manual-review", label: "Manual review" }
] as const;

export type AbuseProtectionToolId = (typeof ABUSE_PROTECTION_TOOLS)[number]["id"];

export const ABUSE_REPORT_PERIODS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" }
] as const;

export type AbuseReportPeriodId = (typeof ABUSE_REPORT_PERIODS)[number]["id"];

export const ABUSE_RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export type AbuseRiskLevelId = (typeof ABUSE_RISK_LEVELS)[number];

export const ABUSE_RISK_LEVEL_LABELS: Record<AbuseRiskLevelId, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

export const ABUSE_PROTECTION_DB_TABLES = [
  "abuse_monitor_snapshots",
  "abuse_rate_limits",
  "abuse_blocks",
  "abuse_forensics",
  "abuse_reports"
] as const;

export const ABUSE_PROTECTION_FUTURE_CAPABILITIES = [
  { id: "ml-bot-scoring", label: "ML bot scoring", description: "Adaptive bot detection with behavioral models." },
  { id: "honeypot-endpoints", label: "Honeypot endpoints", description: "Decoy routes to trap scrapers and credential stuffers." },
  { id: "device-fingerprint", label: "Device fingerprint", description: "Cross-session device correlation for ban evasion." }
] as const;
