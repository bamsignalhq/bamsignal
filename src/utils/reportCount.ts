import { STORAGE_KEYS } from "../constants/limits";
import type { ReportRecord } from "../types";
import { readJson } from "./storage";

export function getReportCount(profileId: string): number {
  const reports = readJson<ReportRecord[]>(STORAGE_KEYS.reports, []);
  return reports.filter((r) => r.profileId === profileId).length;
}
