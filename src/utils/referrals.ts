import { STORAGE_KEYS } from "../constants/limits";
import type { UserProfile } from "../types";
import { readJson, writeJson } from "./storage";
import { notifyReferralRewardEarned } from "./notifyHelpers";

const REFERRAL_GOAL = 3;
const REWARD_DAYS = 7;

export type ReferralState = {
  code: string;
  invitesSent: number;
  successfulReferrals: number;
  rewardsClaimed: number;
  lastRewardAt?: string;
};

function randomCode(name: string): string {
  const base = (name || "BAM")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

export function getReferralState(user: UserProfile): ReferralState {
  const stored = readJson<ReferralState | null>(STORAGE_KEYS.referrals, null);
  if (stored?.code) return stored;

  const code = user.referralCode?.trim().toUpperCase() || randomCode(user.name);
  const initial: ReferralState = { code, invitesSent: 0, successfulReferrals: 0, rewardsClaimed: 0 };
  writeJson(STORAGE_KEYS.referrals, initial);
  return initial;
}

export function referralShareUrl(code: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://bamsignal.com";
  return `${origin}/signup?ref=${encodeURIComponent(code)}`;
}

export function recordInviteSent(): ReferralState {
  const state = readJson<ReferralState>(STORAGE_KEYS.referrals, {
    code: "BAM0000",
    invitesSent: 0,
    successfulReferrals: 0,
    rewardsClaimed: 0
  });
  const next = { ...state, invitesSent: state.invitesSent + 1 };
  writeJson(STORAGE_KEYS.referrals, next);
  return next;
}

/** Call when a referred user completes signup */
export function recordSuccessfulReferral(): ReferralState {
  const state = readJson<ReferralState>(STORAGE_KEYS.referrals, {
    code: "BAM0000",
    invitesSent: 0,
    successfulReferrals: 0,
    rewardsClaimed: 0
  });
  const successfulReferrals = state.successfulReferrals + 1;
  const next = { ...state, successfulReferrals };
  writeJson(STORAGE_KEYS.referrals, next);

  const pendingRewards = Math.floor(successfulReferrals / REFERRAL_GOAL) - state.rewardsClaimed;
  if (pendingRewards > 0) {
    grantReferralReward(pendingRewards);
  }

  return next;
}

function grantReferralReward(count: number): void {
  const state = readJson<ReferralState>(STORAGE_KEYS.referrals, {
    code: "BAM0000",
    invitesSent: 0,
    successfulReferrals: 0,
    rewardsClaimed: 0
  });
  const until = readJson<string | null>(STORAGE_KEYS.premiumUntil, null);
  const base = until && new Date(until).getTime() > Date.now() ? new Date(until).getTime() : Date.now();
  const extended = new Date(base + REWARD_DAYS * count * 24 * 60 * 60 * 1000).toISOString();
  writeJson(STORAGE_KEYS.premiumUntil, extended);
  writeJson(STORAGE_KEYS.referrals, {
    ...state,
    rewardsClaimed: state.rewardsClaimed + count,
    lastRewardAt: new Date().toISOString()
  });
  notifyReferralRewardEarned(REWARD_DAYS * count);
}

export function referralProgress(state: ReferralState): {
  goal: number;
  current: number;
  remaining: number;
  rewardLabel: string;
  pendingRewards: number;
} {
  const cycle = state.successfulReferrals % REFERRAL_GOAL;
  const earned = Math.floor(state.successfulReferrals / REFERRAL_GOAL);
  return {
    goal: REFERRAL_GOAL,
    current: cycle,
    remaining: REFERRAL_GOAL - cycle,
    rewardLabel: `${REWARD_DAYS}-day Signal Pass`,
    pendingRewards: Math.max(0, earned - state.rewardsClaimed)
  };
}
