import type { AbuseRiskLevelId } from "../constants/abuseProtection";
import {
  ABUSE_BLOCK_SEED,
  ABUSE_COUNTRY_SEED,
  ABUSE_FORENSICS_SEED,
  ABUSE_MONITOR_SEED,
  ABUSE_RATE_LIMIT_SEED,
  ABUSE_REPORT_SEED,
  ABUSE_SUSPICIOUS_SEED,
  ABUSE_TOP_IP_SEED
} from "../data/abuseProtectionSeed";
import type {
  AbuseProtectionCenterBundle,
  AbuseProtectionSummary,
  AbuseRateLimitRule
} from "../types/abuseProtection";

const RISK_RANK: Record<AbuseRiskLevelId, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

export function worstAbuseRiskLevel(levels: AbuseRiskLevelId[]): AbuseRiskLevelId {
  return levels.reduce<AbuseRiskLevelId>(
    (worst, current) => (RISK_RANK[current] > RISK_RANK[worst] ? current : worst),
    "low"
  );
}

export function buildAbuseProtectionSummary(checkedAt = new Date().toISOString()): AbuseProtectionSummary {
  const blocks = ABUSE_BLOCK_SEED;
  const suspicious = ABUSE_SUSPICIOUS_SEED.filter((item) => item.status !== "resolved");
  const blockedRequests24h = ABUSE_MONITOR_SEED.reduce((sum, item) => sum + item.blockedCount24h, 0);
  const monitorRisks = ABUSE_MONITOR_SEED.filter((item) => item.critical).map((item) => item.riskLevel);

  return {
    blockedRequests24h,
    temporaryBans: blocks.filter((item) => item.blockType === "temporary").length,
    permanentBans: blocks.filter((item) => item.blockType === "permanent").length,
    suspiciousOpen: suspicious.length,
    overallRisk: worstAbuseRiskLevel(monitorRisks),
    lastCheckedAt: checkedAt
  };
}

export function buildAbuseProtectionCenterBundle(
  options: {
    blocks?: typeof ABUSE_BLOCK_SEED;
    rateLimits?: AbuseRateLimitRule[];
    checkedAt?: string;
  } = {}
): AbuseProtectionCenterBundle {
  const checkedAt = options.checkedAt ?? new Date().toISOString();

  return {
    generatedAt: checkedAt,
    summary: buildAbuseProtectionSummary(checkedAt),
    monitors: [...ABUSE_MONITOR_SEED],
    rateLimits: options.rateLimits ?? [...ABUSE_RATE_LIMIT_SEED],
    blocks: options.blocks ?? [...ABUSE_BLOCK_SEED],
    suspicious: [...ABUSE_SUSPICIOUS_SEED],
    countryStats: [...ABUSE_COUNTRY_SEED],
    topIps: [...ABUSE_TOP_IP_SEED],
    forensics: [...ABUSE_FORENSICS_SEED],
    reports: [...ABUSE_REPORT_SEED]
  };
}

export function buildAbuseProtectionSummaryLine(bundle: AbuseProtectionCenterBundle): string {
  const { summary } = bundle;
  return `${summary.blockedRequests24h} blocked · ${summary.temporaryBans} temp bans · ${summary.permanentBans} perm bans · ${summary.suspiciousOpen} suspicious`;
}

export function adjustAbuseRateLimit(
  rule: AbuseRateLimitRule,
  direction: "increase" | "decrease"
): AbuseRateLimitRule {
  const factor = direction === "increase" ? 1.25 : 0.75;
  return {
    ...rule,
    limitPerWindow: Math.max(1, Math.round(rule.limitPerWindow * factor))
  };
}

export function exportAbuseReportCsv(bundle: AbuseProtectionCenterBundle, period: string): string {
  const report = bundle.reports.find((item) => item.period === period);
  if (!report) return "";
  const header = "period,blocked,suspicious,top_monitor,generated_at";
  const row = `${report.period},${report.totalBlocked},${report.totalSuspicious},${report.topMonitor},${report.generatedAt}`;
  return `${header}\n${row}`;
}
