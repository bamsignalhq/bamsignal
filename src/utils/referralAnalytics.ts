import { STORAGE_KEYS } from "../constants/limits";
import { countEvent } from "./analytics";
import { readJson } from "./storage";
import type { ReferralState } from "./referrals";

export function getReferralAdminMetrics() {
  const stored = readJson<ReferralState | null>(STORAGE_KEYS.referrals, null);
  const referralSignups = countEvent("referral_signup");
  const signups = countEvent("signup_completed");

  return {
    referralSignups,
    referralConversionRate: signups ? Math.round((referralSignups / signups) * 100) : 0,
    localInvitesSent: stored?.invitesSent ?? 0,
    localSuccessfulReferrals: stored?.successfulReferrals ?? 0,
    localRewardsClaimed: stored?.rewardsClaimed ?? 0,
    localReferralCode: stored?.code ?? "—"
  };
}
