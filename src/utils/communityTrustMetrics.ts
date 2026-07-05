import { STORAGE_KEYS } from "../constants/limits";
import type { ReportRecord } from "../types";
import { getSafetyMetrics } from "./safetyAnalytics";
import { listBlockedUsers, listHiddenUsers, listMutedUsers, listRestrictedUsers } from "./safetyInteractions";
import { readJson } from "./storage";

export type CommunityTrustMemberSnapshot = {
  blockedCount: number;
  mutedCount: number;
  hiddenCount: number;
  restrictedCount: number;
  reportsSubmitted: number;
  reportsToday: number;
  updatedAt: string;
};

export function getCommunityTrustMemberSnapshot(): CommunityTrustMemberSnapshot {
  const safety = getSafetyMetrics();
  const reports = readJson<ReportRecord[]>(STORAGE_KEYS.reports, []);

  return {
    blockedCount: listBlockedUsers().length,
    mutedCount: listMutedUsers().length,
    hiddenCount: listHiddenUsers().length,
    restrictedCount: listRestrictedUsers().length,
    reportsSubmitted: reports.length,
    reportsToday: safety.reportsToday,
    updatedAt: new Date().toISOString(),
  };
}

export function listMemberReports(limit = 20): ReportRecord[] {
  const reports = readJson<ReportRecord[]>(STORAGE_KEYS.reports, []);
  return [...reports].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, limit);
}
