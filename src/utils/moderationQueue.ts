import { STORAGE_KEYS } from "../constants/limits";
import type { ReportRecord } from "../types";
import { getReportCount } from "./reportCount";
import { isShadowBanned, readShadowBannedIds } from "./shadowBan";
import { readJson } from "./storage";

export type ModerationEntry = {
  profileId: string;
  name: string;
  city: string;
  reportCount: number;
  shadowBanned: boolean;
  lastReportAt?: string;
  lastReason?: string;
  status: "pending" | "reviewed" | "action_taken";
};

export type ReportFilter = "all" | "pending" | "reviewed" | "action_taken";

export function getModerationQueue(): ModerationEntry[] {
  const reports = readJson<ReportRecord[]>(STORAGE_KEYS.reports, []);
  const byProfile = new Map<string, ReportRecord[]>();

  for (const report of reports) {
    const list = byProfile.get(report.profileId) ?? [];
    list.push(report);
    byProfile.set(report.profileId, list);
  }

  const entries: ModerationEntry[] = [];
  for (const [profileId, list] of byProfile) {
    const sorted = [...list].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    const latest = sorted[0];
    entries.push({
      profileId,
      name: `Member ${profileId.slice(0, 8)}`,
      city: "—",
      reportCount: list.length,
      shadowBanned: isShadowBanned(profileId),
      lastReportAt: latest?.at,
      lastReason: latest?.reason,
      status: isShadowBanned(profileId)
        ? "action_taken"
        : list.length >= 3
          ? "pending"
          : "reviewed"
    });
  }

  return entries.sort((a, b) => b.reportCount - a.reportCount);
}

export function moderationStats() {
  const queue = getModerationQueue();
  return {
    totalReports: readJson<ReportRecord[]>(STORAGE_KEYS.reports, []).length,
    flaggedProfiles: queue.filter((e) => e.reportCount >= 3).length,
    shadowBanned: readShadowBannedIds().length,
    pendingReview: queue.filter((e) => e.status === "pending").length,
    resolved: queue.filter((e) => e.status === "reviewed").length,
    actionTaken: queue.filter((e) => e.status === "action_taken").length
  };
}

export function filterModerationQueue(queue: ModerationEntry[], filter: ReportFilter): ModerationEntry[] {
  if (filter === "all") return queue;
  return queue.filter((entry) => entry.status === filter);
}

export { getReportCount };
