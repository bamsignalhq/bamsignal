import { getModerationQueue, moderationStats } from "./moderationQueue";
import { verificationStats } from "./verificationQueue";
import { readShadowBannedIds } from "./shadowBan";

export function getTrustAnalytics() {
  const moderation = moderationStats();
  const verification = verificationStats();
  const shadowBanned = readShadowBannedIds().length;

  return {
    reportsSubmitted: moderation.totalReports,
    reportsResolved: moderation.resolved,
    reportsActionTaken: moderation.actionTaken,
    fakeProfilesRemoved: shadowBanned,
    verificationsPending: verification.pending,
    verificationsApproved: verification.approved,
    verificationsRejected: verification.rejected,
    avgVerificationReviewHours: verification.avgReviewHours,
    flaggedProfiles: getModerationQueue().filter((e) => e.reportCount >= 3).length
  };
}

export function getTrustAnalyticsSummary() {
  const stats = getTrustAnalytics();
  return [
    { label: "Reports submitted", value: String(stats.reportsSubmitted) },
    { label: "Reports resolved", value: String(stats.reportsResolved) },
    { label: "Action taken", value: String(stats.reportsActionTaken) },
    { label: "Profiles removed", value: String(stats.fakeProfilesRemoved) },
    { label: "Verifications approved", value: String(stats.verificationsApproved) }
  ];
}
