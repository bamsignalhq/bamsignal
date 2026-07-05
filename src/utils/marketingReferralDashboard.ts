import type { UserProfile } from "../types";
import { REFERRAL_REWARD_RULES } from "../constants/marketingInfrastructure";
import {
  getReferralState,
  referralProgress,
  referralShareUrl,
  type ReferralState,
} from "./referrals";
import { getReferralAdminMetrics } from "./referralAnalytics";

export type ReferralDashboardSnapshot = {
  code: string;
  link: string;
  state: ReferralState;
  progress: ReturnType<typeof referralProgress>;
  rewardLabel: string;
  metrics: ReturnType<typeof getReferralAdminMetrics>;
  updatedAt: string;
};

export function getReferralDashboardSnapshot(user: UserProfile): ReferralDashboardSnapshot {
  const state = getReferralState(user);
  return {
    code: state.code,
    link: referralShareUrl(state.code),
    state,
    progress: referralProgress(state),
    rewardLabel: REFERRAL_REWARD_RULES.rewardLabel,
    metrics: getReferralAdminMetrics(),
    updatedAt: new Date().toISOString(),
  };
}
