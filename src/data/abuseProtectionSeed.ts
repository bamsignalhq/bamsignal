import type {
  AbuseBlockRecord,
  AbuseForensicsRecord,
  AbuseMonitorRecord,
  AbuseOffendingIp,
  AbuseRateLimitRule,
  AbuseReportSnapshot,
  AbuseSuspiciousActivity
} from "../types/abuseProtection";
import { ABUSE_MONITOR_CATEGORIES } from "../constants/abuseProtection";

const NOW = "2026-06-26T17:00:00.000Z";

function monitor(
  id: AbuseMonitorRecord["id"],
  eventCount24h: number,
  blockedCount24h: number,
  riskLevel: AbuseMonitorRecord["riskLevel"],
  extra: Partial<AbuseMonitorRecord> = {}
): AbuseMonitorRecord {
  const meta = ABUSE_MONITOR_CATEGORIES.find((item) => item.id === id);
  return {
    id,
    label: meta?.label ?? id,
    critical: meta?.critical ?? false,
    eventCount24h,
    blockedCount24h,
    trend: "flat",
    riskLevel,
    lastEventAt: NOW,
    ...extra
  };
}

export const ABUSE_MONITOR_SEED: AbuseMonitorRecord[] = [
  monitor("otp-requests", 842, 126, "high", { trend: "up", blockedCount24h: 126 }),
  monitor("login-attempts", 4200, 89, "medium", { trend: "flat" }),
  monitor("failed-logins", 312, 67, "medium", { trend: "down" }),
  monitor("signal-spam", 45, 12, "low", { trend: "flat" }),
  monitor("message-spam", 78, 23, "low", { trend: "up" }),
  monitor("report-abuse", 34, 0, "medium", { trend: "flat" }),
  monitor("fake-accounts", 18, 18, "high", { trend: "up" }),
  monitor("bot-detection", 156, 98, "high", { trend: "up" }),
  monitor("referral-abuse", 9, 4, "low", { trend: "flat" }),
  monitor("consultation-abuse", 6, 2, "low", { trend: "flat" }),
  monitor("payment-abuse", 11, 8, "critical", { trend: "up" })
];

export const ABUSE_RATE_LIMIT_SEED: AbuseRateLimitRule[] = [
  { id: "rl_otp_phone", dimension: "phone", endpoint: "/api/otp/send", limitPerWindow: 5, windowMinutes: 60, currentUsage: 3, blockedToday: 42, enabled: true },
  { id: "rl_login_ip", dimension: "ip", endpoint: "/api/pin-login", limitPerWindow: 20, windowMinutes: 15, currentUsage: 18, blockedToday: 67, enabled: true },
  { id: "rl_login_account", dimension: "account", endpoint: "/api/pin-login", limitPerWindow: 10, windowMinutes: 30, currentUsage: 4, blockedToday: 23, enabled: true },
  { id: "rl_signal_device", dimension: "device", endpoint: "/api/signals", limitPerWindow: 50, windowMinutes: 60, currentUsage: 12, blockedToday: 8, enabled: true },
  { id: "rl_message_session", dimension: "session", endpoint: "/api/messages", limitPerWindow: 100, windowMinutes: 60, currentUsage: 45, blockedToday: 15, enabled: true },
  { id: "rl_signup_email", dimension: "email", endpoint: "/api/signup", limitPerWindow: 3, windowMinutes: 1440, currentUsage: 1, blockedToday: 5, enabled: true },
  { id: "rl_payment_account", dimension: "account", endpoint: "/api/payments/initialize", limitPerWindow: 5, windowMinutes: 60, currentUsage: 2, blockedToday: 8, enabled: true },
  { id: "rl_scrape_ip", dimension: "ip", endpoint: "/api/discover", limitPerWindow: 200, windowMinutes: 60, currentUsage: 195, blockedToday: 98, enabled: true }
];

export const ABUSE_BLOCK_SEED: AbuseBlockRecord[] = [
  { id: "blk_001", target: "102.89.45.12", targetType: "ip", blockType: "temporary", reason: "OTP flood", monitorId: "otp-requests", blockedAt: "2026-06-26T14:00:00.000Z", expiresAt: "2026-06-27T14:00:00.000Z", country: "NG" },
  { id: "blk_002", target: "41.203.88.99", targetType: "ip", blockType: "permanent", reason: "Bot scraping discover", monitorId: "bot-detection", blockedAt: "2026-06-25T08:00:00.000Z", expiresAt: null, country: "NG" },
  { id: "blk_003", target: "+2348012345678", targetType: "phone", blockType: "temporary", reason: "WhatsApp OTP abuse", monitorId: "otp-requests", blockedAt: "2026-06-26T10:30:00.000Z", expiresAt: "2026-06-28T10:30:00.000Z", country: "NG" },
  { id: "blk_004", target: "fake_user_8821", targetType: "account", blockType: "permanent", reason: "Fake account cluster", monitorId: "fake-accounts", blockedAt: "2026-06-24T16:00:00.000Z", expiresAt: null, country: "GH" },
  { id: "blk_005", target: "197.210.52.44", targetType: "ip", blockType: "temporary", reason: "Failed login burst", monitorId: "failed-logins", blockedAt: "2026-06-26T16:45:00.000Z", expiresAt: "2026-06-26T22:45:00.000Z", country: "NG" }
];

export const ABUSE_SUSPICIOUS_SEED: AbuseSuspiciousActivity[] = [
  { id: "sus_001", monitorId: "payment-abuse", summary: "Multiple Paystack init from same device", riskLevel: "critical", ip: "102.89.45.12", country: "NG", detectedAt: "2026-06-26T15:30:00.000Z", status: "open" },
  { id: "sus_002", monitorId: "bot-detection", summary: "Headless browser pattern on /discover", riskLevel: "high", ip: "41.203.88.99", country: "NG", detectedAt: "2026-06-26T14:00:00.000Z", status: "reviewing" },
  { id: "sus_003", monitorId: "referral-abuse", summary: "Self-referral ring detected", riskLevel: "medium", ip: "197.210.52.44", country: "NG", detectedAt: "2026-06-26T12:00:00.000Z", status: "open" }
];

export const ABUSE_COUNTRY_SEED = [
  { country: "Nigeria", countryCode: "NG", blockedCount: 412, suspiciousCount: 89 },
  { country: "Ghana", countryCode: "GH", blockedCount: 67, suspiciousCount: 12 },
  { country: "United Kingdom", countryCode: "GB", blockedCount: 34, suspiciousCount: 8 },
  { country: "United States", countryCode: "US", blockedCount: 28, suspiciousCount: 5 },
  { country: "Canada", countryCode: "CA", blockedCount: 15, suspiciousCount: 3 }
];

export const ABUSE_TOP_IP_SEED: AbuseOffendingIp[] = [
  { ip: "102.89.45.12", country: "NG", blockedRequests: 126, riskScore: 92, monitors: ["otp-requests", "payment-abuse"] },
  { ip: "41.203.88.99", country: "NG", blockedRequests: 98, riskScore: 88, monitors: ["bot-detection"] },
  { ip: "197.210.52.44", country: "NG", blockedRequests: 67, riskScore: 74, monitors: ["failed-logins", "referral-abuse"] },
  { ip: "154.113.45.78", country: "GH", blockedRequests: 45, riskScore: 65, monitors: ["fake-accounts"] },
  { ip: "82.132.10.22", country: "GB", blockedRequests: 34, riskScore: 58, monitors: ["message-spam"] }
];

export const ABUSE_FORENSICS_SEED: AbuseForensicsRecord[] = [
  {
    id: "for_001",
    target: "102.89.45.12",
    riskScore: 92,
    riskLevel: "critical",
    linkedAccounts: ["fake_user_8821", "spam_bot_4412"],
    devices: ["dev_android_9a2f", "dev_web_chrome_88"],
    sessions: ["sess_abc123", "sess_def456"],
    timeline: [
      { at: "2026-06-26T14:00:00.000Z", action: "OTP flood", detail: "42 OTP requests in 10 minutes" },
      { at: "2026-06-26T15:30:00.000Z", action: "Payment abuse", detail: "5 Paystack init attempts" },
      { at: "2026-06-26T16:00:00.000Z", action: "Blocked", detail: "Temporary IP ban applied" }
    ]
  },
  {
    id: "for_002",
    target: "fake_user_8821",
    riskScore: 85,
    riskLevel: "high",
    linkedAccounts: ["fake_user_8822", "fake_user_8823"],
    devices: ["dev_android_9a2f"],
    sessions: ["sess_ghi789"],
    timeline: [
      { at: "2026-06-24T16:00:00.000Z", action: "Fake account", detail: "Stock photo profile detected" },
      { at: "2026-06-24T16:05:00.000Z", action: "Permanent ban", detail: "Account suspended" }
    ]
  }
];

export const ABUSE_REPORT_SEED: AbuseReportSnapshot[] = [
  { period: "daily", generatedAt: NOW, totalBlocked: 541, totalSuspicious: 12, topMonitor: "otp-requests", exportReady: true },
  { period: "weekly", generatedAt: NOW, totalBlocked: 3240, totalSuspicious: 67, topMonitor: "bot-detection", exportReady: true },
  { period: "monthly", generatedAt: NOW, totalBlocked: 12800, totalSuspicious: 245, topMonitor: "otp-requests", exportReady: true }
];

export const ABUSE_LIST_ENTRIES_SEED: { id: string; listType: "blacklist" | "whitelist"; target: string; targetType: string; addedAt: string; addedBy: string }[] = [
  { id: "list_001", listType: "blacklist", target: "41.203.88.99", targetType: "ip", addedAt: "2026-06-25T08:00:00.000Z", addedBy: "safety@bamsignal.com" },
  { id: "list_002", listType: "whitelist", target: "203.0.113.50", targetType: "ip", addedAt: "2026-06-20T10:00:00.000Z", addedBy: "ops@bamsignal.com" }
];
