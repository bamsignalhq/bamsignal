import { STORAGE_KEYS } from "../constants/limits";
import { countEvent, countEventToday, eventsSince, trackEvent } from "./analytics";
import type { ReportReason } from "../types";
import { readJson } from "./storage";
import { moderationStats } from "./moderationQueue";

export function trackSafetyReport(profileId: string, reason: ReportReason): void {
  trackEvent("safety_report", { profileId, reason });
}

export function trackSafetyBlock(profileId: string): void {
  trackEvent("safety_block", { profileId });
}

export function trackContactShareAttempt(context: string): void {
  trackEvent("contact_share_attempt", { context });
}

export function getSafetyMetrics() {
  const mod = moderationStats();
  const reports = readJson<unknown[]>(STORAGE_KEYS.reports, []);
  const blocked = readJson<string[]>(STORAGE_KEYS.blocked, []);

  return {
    reportsToday: countEventToday("safety_report"),
    blocksToday: countEventToday("safety_block"),
    contactAttemptsToday: countEventToday("contact_share_attempt"),
    totalReports: reports.length,
    totalBlocks: blocked.length,
    flaggedProfiles: mod.flaggedProfiles,
    shadowBanned: mod.shadowBanned,
    pendingReview: mod.pendingReview,
    reportsLast7d: eventsSince("safety_report", 7 * 86400000),
    blocksLast7d: eventsSince("safety_block", 7 * 86400000)
  };
}

export function getTrustMetrics() {
  return {
    verifiedToday: countEventToday("verification_approved"),
    profileCompletedToday: countEventToday("profile_completed"),
    totalSignups: countEvent("signup_completed")
  };
}
